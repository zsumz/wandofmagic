import { describe, expect, it } from 'vitest';

import { collection } from '../../../src/builder/collection/collection.js';
import { spell } from '../../../src/builder/spell/spell.js';
import { number } from '../../../src/coerce/builtin/number.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { Spell } from '../../../src/core/execution/spell.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

interface ItemInput {
    readonly metadata: { readonly owner?: string };
    readonly profile: {
        readonly count: number | string;
        readonly name: string;
        readonly secret: string;
    };
}

const itemSpell = spell<ItemInput>()
    .trim([['profile', 'name']])
    .coerce(['profile', 'count'], number({ integer: true }))
    .transform(['profile', 'name'], (name) => name.toUpperCase())
    .copy(['profile', 'name'], ['metadata', 'owner'])
    .omit([['profile', 'secret']])
    .pick([['profile', 'name'], ['profile', 'count'], ['metadata', 'owner']])
    .build();

describe('static trusted collection mapper', () => {
    it('preserves sparse arrays and item bindings', async () => {
        const compiled = collection(itemSpell);
        const input: ItemInput[] = [];
        input.length = 4;
        input[1] = createItem(' Ada ', '7');
        input[3] = createItem(' Grace ', 9);
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(artifact.bindingDescriptions.map((binding) => binding.kind)).toEqual(['transform']);
        expectGeneratedParity(compiled, generated, input);
        const value = generated(input) as unknown[];
        expect(value).toHaveLength(4);
        expect(0 in value).toBe(false);
        expect(2 in value).toBe(false);
    });

    it('prefixes item failures through nested collections', async () => {
        const compiled = collection(collection(itemSpell));
        const input: ItemInput[][] = [];
        input.length = 2;
        input[1] = [];
        input[1].length = 3;
        input[1][2] = createItem('Ada', 'invalid');
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expectGeneratedParity(compiled, generated, input);
        expect(captureMapperOutcome(() => generated(input))).toContain(
            '"path":[1,2,"profile","count"]',
        );
    });

    it('matches trusted root collection guardrails', async () => {
        const compiled = collection(itemSpell);
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);
        const custom = [createItem('Ada', '7')];
        Object.defineProperty(custom, 'extra', { enumerable: true, value: true });
        class ItemArray extends Array<ItemInput> {}

        expectGeneratedParity(compiled, generated, {});
        expectGeneratedParity(compiled, generated, new ItemArray());
        expectGeneratedParity(compiled, generated, custom);
    });
});

function createItem(name: string, count: number | string): ItemInput {
    return { metadata: {}, profile: { count, name, secret: 'hidden' } };
}

function expectGeneratedParity<Input extends object, Output extends object>(
    compiled: Spell<Input, Output>,
    generated: (input: object) => object,
    input: object,
): void {
    expect(captureMapperOutcome(() => generated(input))).toBe(
        captureMapperOutcome(() => compiled.run(
            input as Input,
            { input: 'trusted', receipt: 'discard' },
        )),
    );
}

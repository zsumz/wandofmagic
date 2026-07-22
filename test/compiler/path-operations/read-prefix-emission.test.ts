import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/builder/spell/spell.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { Spell } from '../../../src/core/execution/spell.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

describe('static trusted mapper shared path prefixes', () => {
    it('resolves a repeated container prefix once per operation', () => {
        const compiled = spell<{ profile: { first: string; last: string } }>()
            .trim([['profile', 'first'], ['profile', 'last']])
            .build();
        const source = emitTrustedMapperModule(compiled).source;

        expect(source).toContain('function $readPrefix0($root)');
        expect(source).toContain('let $readPrefix0_0;');
        expect(source.match(/\?\?= \$readPrefix0\(\$value\)/gu)).toHaveLength(2);
        expect(source).toContain('containers: [$container0, $container1]');
    });

    it('resolves prefixes lazily without changing failure order', async () => {
        interface Input {
            profile: { first: string; last: string };
        }
        const compiled = spell<Input>()
            .derive(
                ['summary', 'label'],
                [['profile', 'first'], ['profile', 'last']],
                ([first, last]) => `${first} ${last}`,
            )
            .build();
        const input = {
            profile: new Date() as unknown as Input['profile'],
            summary: { label: 'existing' },
        } as unknown as Input;

        await expectGeneratedParity(compiled, input);
    });

    it('retains cycle checks through cached ancestors', async () => {
        interface Input {
            a: {
                b: {
                    c: { x: string };
                    d: { y: string };
                };
            };
        }
        const input: Input = {
            a: { b: { c: { x: 'first' }, d: { y: 'second' } } },
        };
        input.a.b.c = input.a as unknown as { x: string };
        const compiled = spell<Input>()
            .trim([['a', 'b', 'c', 'x'], ['a', 'b', 'd', 'y']])
            .build();

        await expectGeneratedParity(compiled, input);
    });

    it('shares prefixes through sparse array indices', async () => {
        interface Input {
            rows: Array<{ first: string; last: string }>;
        }
        const rows: Input['rows'] = [];
        rows.length = 3;
        rows[2] = { first: ' Ada ', last: ' Lovelace ' };
        const compiled = spell<Input>()
            .trim([['rows', 2, 'first'], ['rows', 2, 'last']])
            .build();

        await expectGeneratedParity(compiled, { rows });
    });
});

async function expectGeneratedParity<Input extends object, Output extends object>(
    compiled: Spell<Input, Output>,
    input: Input,
): Promise<void> {
    const artifact = emitTrustedMapperModule(compiled);
    const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);
    expect(captureMapperOutcome(() => generated(input))).toBe(
        captureMapperOutcome(() => compiled.run(
            input,
            { input: 'trusted', receipt: 'discard' },
        )),
    );
}

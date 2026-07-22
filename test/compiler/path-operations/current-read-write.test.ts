import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/builder/spell/spell.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

describe('static trusted mapper current-read writes', () => {
    it('emits direct depth-two commits only when no user callback separates read and write', () => {
        const compiled = spell<{ profile: { alias?: string; name: string } }>()
            .trim([['profile', 'name']])
            .default(['profile', 'alias'], 'anonymous')
            .transform(['profile', 'name'], (name) => name.toUpperCase())
            .build();
        const source = emitTrustedMapperModule(compiled).source;

        expect(source).toContain('$readIsCurrent === true && $path.length === 2');
        expect(source).toMatch(/\$trimPathRead0_0, \$pathTrimmed0_0, \$ownership, true\)/u);
        expect(source).toMatch(/\$defaultRead1, \$binding0, \$ownership, true,/u);
        expect(source).toMatch(/\$transformRead2, \$pathTransformed2, \$ownership\);/u);
    });

    it('clones a frozen depth-two parent without mutating the input', async () => {
        const compiled = spell<{ profile: { value?: string } }>()
            .default(['profile', 'value'], 'fallback')
            .build();
        const profile = Object.freeze({ value: undefined });
        const input = Object.freeze({ profile });
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(generated(input)).toEqual({ profile: { value: 'fallback' } });
        expect(input.profile).toBe(profile);
        expect(input.profile.value).toBeUndefined();
    });

    it('rejects an accessor sibling without executing it', async () => {
        const compiled = spell<{ profile: { value?: string } }>()
            .default(['profile', 'value'], 'fallback')
            .build();
        const profile: { secret?: string; value?: string } = {};
        const accessor = expect.unreachable;
        Object.defineProperty(profile, 'secret', {
            enumerable: true,
            get: accessor,
        });
        const input = { profile };
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(captureMapperOutcome(() => generated(input))).toBe(
            captureMapperOutcome(() => compiled.run(
                input,
                { input: 'trusted', receipt: 'discard' },
            )),
        );
    });

    it('isolates aliased parents and preserves sparse arrays', async () => {
        const aliased = spell<{
            left: { value?: string };
            right: { value?: string };
        }>()
            .default(['left', 'value'], 'left')
            .build();
        const shared = { value: undefined };
        const aliasedArtifact = emitTrustedMapperModule(aliased);
        const aliasedMapper = await materializeGeneratedMapper(
            aliasedArtifact.source,
            aliasedArtifact.bindings,
        );

        expect(aliasedMapper({ left: shared, right: shared })).toEqual({
            left: { value: 'left' },
            right: { value: undefined },
        });
        expect(shared.value).toBeUndefined();

        const sparse = spell<{ rows: string[] }>()
            .trim([['rows', 2]])
            .build();
        const rows: string[] = [];
        rows.length = 3;
        rows[2] = ' value ';
        const expected: string[] = [];
        expected.length = 3;
        expected[2] = 'value';
        const sparseArtifact = emitTrustedMapperModule(sparse);
        const sparseMapper = await materializeGeneratedMapper(
            sparseArtifact.source,
            sparseArtifact.bindings,
        );
        const output = sparseMapper({ rows }) as { rows: string[] };

        expect(output.rows).toEqual(expected);
        expect(0 in output.rows).toBe(false);
        expect(rows[2]).toBe(' value ');
    });

    it('retains defensive re-reads after user callbacks', async () => {
        const generatedCase = callbackMutationCase();
        const artifact = emitTrustedMapperModule(generatedCase.compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);
        const runtimeCase = callbackMutationCase();

        expect(captureMapperOutcome(() => generated(generatedCase.input))).toBe(
            captureMapperOutcome(() => runtimeCase.compiled.run(
                runtimeCase.input,
                { input: 'trusted', receipt: 'discard' },
            )),
        );
    });
});

function callbackMutationCase(): {
    readonly compiled: ReturnType<ReturnType<typeof spell<CallbackInput>>['build']>;
    readonly input: CallbackInput;
} {
    const input: CallbackInput = { profile: { secret: 'safe', value: 'value' } };
    const compiled = spell<CallbackInput>()
        .transform(['profile', 'value'], (value) => {
            Object.defineProperty(input.profile, 'secret', {
                enumerable: true,
                get: expect.unreachable,
            });
            return value.toUpperCase();
        })
        .build();
    return { compiled, input };
}

interface CallbackInput {
    readonly profile: { readonly secret: string; readonly value: string };
}

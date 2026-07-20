import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';

import { boolean } from '../src/coerce/boolean.js';
import { isoDate } from '../src/coerce/iso-date.js';
import { number } from '../src/coerce/number.js';
import { string } from '../src/coerce/string.js';
import { defineCoercer } from '../src/coerce/types.js';
import { spell } from '../src/builder/spell.js';
import { CompilerError } from '../src/compiler/compiler-error.js';
import { emitTrustedMapperModule } from '../src/compiler/emit-trusted-mapper.js';
import { WandError } from '../src/core/errors.js';
import type { Spell } from '../src/core/spell.js';

interface BenchmarkInput {
    readonly age?: string;
    readonly email: string;
    readonly first_name: string;
    readonly last_name: string;
    readonly password_hash: string;
}

interface GeneratedModule {
    createTrustedMapper(
        bindings: readonly unknown[],
        ErrorConstructor: typeof WandError,
    ): (input: object) => object;
}

interface OperationInput {
    readonly count?: number | string;
    readonly custom: string;
    readonly date: Date | string;
    readonly fallback?: number;
    readonly flag?: boolean | string;
    readonly secret: string;
    readonly source: string;
    readonly text: bigint | boolean | number | string;
}

describe('static trusted mapper compiler', () => {
    it('emits and executes a value-free mapper with equivalent outcomes', async () => {
        const sensitiveFallback = Object.freeze({ token: 'not-serialized' });
        const normalize = spell<BenchmarkInput>()
            .rename({
                first_name: 'firstName',
                last_name: 'lastName',
                password_hash: 'passwordHash',
            })
            .trim(['firstName', 'lastName', 'email'])
            .coerce('age', number({ integer: true }))
            .default('metadata', sensitiveFallback)
            .derive('displayName', ['firstName', 'lastName'], ([firstName, lastName]) =>
                `${firstName} ${lastName}`)
            .omit(['passwordHash'])
            .build();
        const artifact = emitTrustedMapperModule(normalize);
        const generated = await materialize(artifact.source, artifact.bindings);

        expect(artifact.mode).toBe('trusted-discard');
        expect(artifact.source).not.toContain('not-serialized');
        expect(artifact.bindingDescriptions).toEqual([
            { index: 0, kind: 'default', stepId: 'default:4' },
            { index: 1, kind: 'derive', stepId: 'derive:5' },
        ]);
        const valid: BenchmarkInput = {
            age: '37',
            email: '  ada@example.com ',
            first_name: ' Ada ',
            last_name: ' Lovelace ',
            password_hash: 'private',
        };
        const missingAge = { ...valid };
        Reflect.deleteProperty(missingAge, 'age');
        const inputs: readonly BenchmarkInput[] = [
            valid,
            unsafeBenchmarkInput({ ...valid, firstName: 'existing' }),
            unsafeBenchmarkInput({ ...valid, email: 7 }),
            { ...valid, age: 'invalid' },
            missingAge,
            unsafeBenchmarkInput({ ...valid, displayName: 'existing' }),
        ];
        for (const input of inputs) {
            expect(capture(() => generated(input))).toBe(capture(() =>
                normalize.run(input, { input: 'trusted', receipt: 'discard' })));
        }

        const nullPrototype = Object.assign(createNullPrototype(), valid);
        Object.defineProperty(nullPrototype, '__proto__', {
            enumerable: true,
            value: { safe: true },
        });
        expect(capture(() => generated(nullPrototype))).toBe(capture(() =>
            normalize.run(nullPrototype, { input: 'trusted', receipt: 'discard' })));
    });

    it('fails closed when structural projection cannot be proven', () => {
        const noStructuralEdges = spell<{ value: string }>().trim(['value']).build();
        const touchedOmit = spell<{ secret: string; source: string }>()
            .rename({ source: 'value' })
            .trim(['secret'])
            .omit(['secret'])
            .build();
        const overlappingRename = spell<{ first: string; second: string; secret: string }>()
            .rename({ first: 'second', second: 'third' })
            .omit(['secret'])
            .build();

        expect(() => emitTrustedMapperModule(noStructuralEdges)).toThrow(CompilerError);
        expect(() => emitTrustedMapperModule(touchedOmit)).toThrow(CompilerError);
        expect(() => emitTrustedMapperModule(overlappingRename)).toThrow(CompilerError);
    });

    it('rejects spell implementations without private compiler instructions', () => {
        const foreignSpell: Spell<{ value: string }, { value: string }> = {
            describe() {
                return { steps: [] };
            },
            run(input) {
                return input;
            },
            safeRun(input) {
                return { changes: [], ok: true, value: input };
            },
        };

        expect(captureCompilerError(() => emitTrustedMapperModule(foreignSpell)).code)
            .toBe('unsupported_spell');
    });

    it('preserves built-in, custom, transform, and callback failure semantics', async () => {
        const custom = defineCoercer<string, string>({
            name: 'uppercase',
            run(value) {
                return value === 'invalid'
                    ? { code: 'invalid_custom', message: 'Custom value is invalid.', ok: false }
                    : { ok: true, value: String(value).toUpperCase() };
            },
        });
        const normalize = spell<OperationInput>()
            .rename({ source: 'value' })
            .trim(['value'])
            .coerce('count', number({ integer: true }), { missing: 'skip' })
            .coerce('flag', boolean({ caseSensitive: true }), { missing: 'skip' })
            .coerce('text', string())
            .coerce('date', isoDate())
            .coerce('custom', custom)
            .transform('value', (value) => {
                if (value === 'throw') {
                    throw new Error('callback failure');
                }
                return value.toUpperCase();
            })
            .default('fallback', 5)
            .derive('summary', ['value', 'custom'], ([value, customValue]) =>
                `${value}:${customValue}`)
            .omit(['secret'])
            .build();
        const artifact = emitTrustedMapperModule(normalize);
        const generated = await materialize(artifact.source, artifact.bindings);
        const valid: OperationInput = {
            count: '7',
            custom: 'ada',
            date: '2026-07-20T12:00:00Z',
            flag: 'true',
            secret: 'hidden',
            source: ' value ',
            text: 42,
        };
        const inputs: readonly OperationInput[] = [
            valid,
            { ...valid, count: '7.5' },
            { ...valid, custom: 'invalid' },
            { ...valid, date: 'not-a-date' },
            { ...valid, flag: 'TRUE' },
            { ...valid, source: 'throw' },
        ];

        for (const input of inputs) {
            expect(capture(() => generated(input))).toBe(capture(() =>
                normalize.run(input, { input: 'trusted', receipt: 'discard' })));
        }
    });
});

async function materialize(
    source: string,
    bindings: readonly unknown[],
): Promise<(input: object) => object> {
    const directory = await mkdtemp(join(tmpdir(), 'wandofmagic-compiler-'));
    const modulePath = join(directory, 'generated.mjs');
    try {
        await writeFile(modulePath, source, 'utf8');
        const imported: unknown = await import(pathToFileURL(modulePath).href);
        if (!isGeneratedModule(imported)) {
            throw new TypeError('The emitted module did not expose createTrustedMapper().');
        }
        return imported.createTrustedMapper(bindings, WandError);
    } finally {
        await rm(directory, { force: true, recursive: true });
    }
}

function isGeneratedModule(value: unknown): value is GeneratedModule {
    return typeof value === 'object'
        && value !== null
        && 'createTrustedMapper' in value
        && typeof value.createTrustedMapper === 'function';
}

function capture(run: () => object): string {
    try {
        const value = run();
        return JSON.stringify({
            keys: Object.keys(value),
            nullPrototype: Object.getPrototypeOf(value) === null,
            ok: true,
            value,
        });
    } catch (error) {
        if (error instanceof WandError) {
            return JSON.stringify({ error: error.toJSON(), ok: false });
        }
        throw error;
    }
}

function createNullPrototype(): object {
    return Object.create(null) as object;
}

function unsafeBenchmarkInput(value: object): BenchmarkInput {
    // Deliberately cross the public type boundary to exercise JavaScript/runtime misuse.
    return value as BenchmarkInput;
}

function captureCompilerError(run: () => unknown): CompilerError {
    try {
        run();
    } catch (error) {
        if (error instanceof CompilerError) {
            return error;
        }
        throw error;
    }
    throw new Error('Expected static mapper emission to fail.');
}

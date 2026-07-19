import { describe, expect, it } from 'vitest';
import { spell, type Spell, WandError, wand } from '../src/index.js';

function createAccessorInput(onRead: () => void): { value: string } {
    return Object.defineProperty({}, 'value', {
        enumerable: true,
        get() {
            onRead();
            return '  trusted  ';
        },
    }) as { value: string };
}

describe('trusted input execution', () => {
    it('keeps descriptor inspection as the default and makes trust explicit', () => {
        let reads = 0;
        const input = createAccessorInput(() => {
            reads += 1;
        });
        const normalize = spell<{ value: string }>().trim(['value']).build();

        expect(normalize.safeRun(input)).toMatchObject({
            issues: [{ code: 'unsupported_accessor' }],
            ok: false,
        });
        expect(reads).toBe(0);

        expect(normalize.safeRun(input, { input: 'trusted' })).toMatchObject({
            changes: [{ kind: 'trim' }],
            ok: true,
            value: { value: 'trusted' },
        });
        expect(reads).toBe(1);
    });

    it('supports trusted throwing execution and receipt discard through reusable and one-off APIs', () => {
        const normalize = spell<{ label: string }>().trim(['label']).build();
        const options = { input: 'trusted', receipt: 'discard' } as const;

        expect(normalize.run({ label: '  reusable  ' }, options)).toEqual({ label: 'reusable' });
        expect(wand({ label: '  one-off  ' }).trim(['label']).value(options)).toEqual({
            label: 'one-off',
        });
    });

    it('turns throwing input inspection traps into value-free structured failures', () => {
        const secret = 'proxy-secret-991';
        const input = new Proxy({}, {
            getPrototypeOf() {
                throw new Error(secret);
            },
        });
        const normalize = spell<Record<string, unknown>>().build();

        const result = normalize.safeRun(input);
        expect(result).toMatchObject({ issues: [{ code: 'invalid_input' }], ok: false });
        expect(JSON.stringify(result)).not.toContain(secret);

        expect(() => normalize.run(input)).toThrow(WandError);
    });

    it('returns a structured failure when a trusted property read throws', () => {
        const input = Object.defineProperty({}, 'value', {
            enumerable: true,
            get() {
                throw new Error('private getter detail');
            },
        }) as { value: string };

        const result = spell<{ value: string }>()
            .trim(['value'])
            .build()
            .safeRun(input, { input: 'trusted' });

        expect(result).toMatchObject({ issues: [{ code: 'invalid_input' }], ok: false });
        expect(JSON.stringify(result)).not.toContain('private getter detail');
    });
});

interface ProjectedInput {
    firstName?: string;
    first_name?: string;
    keep: number;
    passwordHash?: string;
    password_hash?: string;
}

interface ProjectedOutput {
    firstName?: string;
    keep: number;
}

describe('trusted structural projection', () => {
    const createProjectedSpell = (): Spell<ProjectedInput, ProjectedOutput> => {
        return spell<ProjectedInput>()
            .rename({ first_name: 'firstName', password_hash: 'passwordHash' })
            .trim(['firstName'])
            .omit(['passwordHash'])
            .build();
    };

    it('preserves projection semantics with collected and discarded receipts', () => {
        const normalize = createProjectedSpell();
        const input = { first_name: '  Ada  ', keep: 7, password_hash: 'secret' };

        expect(normalize.safeRun(input, { input: 'trusted' })).toEqual({
            changes: [
                expect.objectContaining({ from: ['first_name'], kind: 'rename', to: ['firstName'] }),
                expect.objectContaining({
                    from: ['password_hash'],
                    kind: 'rename',
                    to: ['passwordHash'],
                }),
                expect.objectContaining({ kind: 'trim', path: ['firstName'] }),
                expect.objectContaining({ kind: 'omit', path: ['passwordHash'] }),
            ],
            ok: true,
            value: { firstName: 'Ada', keep: 7 },
        });

        expect(normalize.safeRun(input, { input: 'trusted', receipt: 'discard' })).toEqual({
            changes: [],
            ok: true,
            value: { firstName: 'Ada', keep: 7 },
        });
    });

    it('keeps output key order independent of receipt collection', () => {
        const normalize = createProjectedSpell();
        const input = { first_name: 'Ada', keep: 7, password_hash: 'secret' };
        const collected = normalize.run(input, { input: 'trusted' });
        const discarded = normalize.run(input, { input: 'trusted', receipt: 'discard' });

        expect(Object.keys(discarded)).toEqual(Object.keys(collected));
        expect(Object.keys(discarded)).toEqual(['keep', 'firstName']);
    });

    it('detects projected destination conflicts in both receipt modes', () => {
        const normalize = createProjectedSpell();
        const input = { firstName: 'existing', first_name: 'incoming', keep: 7 };

        for (const receipt of ['collect', 'discard'] as const) {
            expect(normalize.safeRun(input, { input: 'trusted', receipt })).toMatchObject({
                issues: [{ code: 'destination_conflict', path: ['firstName'] }],
                ok: false,
            });
        }
    });

    it('handles an existing destination when its source is absent and reports direct omissions', () => {
        const normalize = createProjectedSpell();

        expect(normalize.safeRun(
            { firstName: '  Existing  ', keep: 7, passwordHash: 'remove-me' },
            { input: 'trusted' },
        )).toEqual({
            changes: [
                expect.objectContaining({ kind: 'trim', path: ['firstName'] }),
                expect.objectContaining({ kind: 'omit', path: ['passwordHash'] }),
            ],
            ok: true,
            value: { firstName: 'Existing', keep: 7 },
        });
    });

    it('preserves null prototypes and treats __proto__ as an ordinary own field', () => {
        const normalize = createProjectedSpell();
        const input = Object.assign(Object.create(null), {
            first_name: '  Ada  ',
            keep: 7,
            password_hash: 'secret',
        }) as {
            first_name: string;
            keep: number;
            password_hash: string;
        };
        Object.defineProperty(input, '__proto__', {
            configurable: true,
            enumerable: true,
            value: { polluted: true },
            writable: true,
        });

        const output = normalize.run(input, { input: 'trusted', receipt: 'discard' });
        expect(Object.getPrototypeOf(output)).toBeNull();
        expect(Object.getOwnPropertyDescriptor(output, '__proto__')?.value).toEqual({
            polluted: true,
        });
        expect(Object.prototype).not.toHaveProperty('polluted');
    });
});

describe('trusted execution conformance', () => {
    interface ConformanceInput {
        active?: 'false' | 'true';
        age?: string;
        email?: string | null;
        firstName?: string;
        first_name?: string;
        last_name?: string | null;
        password_hash?: string;
        sequence: number;
    }

    const normalize = spell<ConformanceInput>()
        .rename({
            first_name: 'firstName',
            last_name: 'lastName',
            password_hash: 'passwordHash',
        })
        .trim(['firstName', 'lastName', 'email'])
        .coerce('age', {
            name: 'test-number',
            run(value) {
                const converted = Number(value);
                return Number.isFinite(converted)
                    ? { ok: true, value: converted }
                    : { message: 'Expected a finite number.', ok: false };
            },
        }, { missing: 'skip' })
        .coerce('active', {
            name: 'test-boolean',
            run(value) {
                return value === 'true'
                    ? { ok: true, value: true }
                    : value === 'false'
                        ? { ok: true, value: false }
                        : { message: 'Expected a boolean string.', ok: false };
            },
        }, { missing: 'skip' })
        .default('active', false)
        .derive('displayName', ['firstName', 'lastName'], ([firstName, lastName]) =>
            [firstName, lastName].filter(Boolean).join(' '))
        .omit(['passwordHash'])
        .build();

    it('matches checked behavior for valid trusted-record shapes', () => {
        for (let index = 0; index < 64; index += 1) {
            const input = (index % 2 === 0 ? {} : Object.create(null)) as ConformanceInput;
            input.sequence = index;
            if (index % 3 !== 0) {
                input.first_name = ` Ada ${String(index)} `;
            }
            if (index % 4 !== 0) {
                input.last_name = index % 5 === 0 ? null : ` Lovelace ${String(index)} `;
            }
            if (index % 6 === 0) {
                input.firstName = 'existing destination';
            }
            if (index % 7 !== 0) {
                input.age = index % 11 === 0 ? 'invalid' : String(index);
            }
            if (index % 8 !== 0) {
                input.active = index % 2 === 0 ? 'true' : 'false';
            }
            if (index % 9 !== 0) {
                input.email = index % 10 === 0 ? null : ` user-${String(index)}@example.com `;
            }
            if (index % 5 !== 0) {
                input.password_hash = `secret-${String(index)}`;
            }

            for (const receipt of ['collect', 'discard'] as const) {
                const checked = normalize.safeRun(input, { input: 'checked', receipt });
                const trusted = normalize.safeRun(input, { input: 'trusted', receipt });
                expect(trusted).toEqual(checked);
                if (checked.ok && trusted.ok) {
                    expect(Object.getPrototypeOf(trusted.value)).toBe(
                        Object.getPrototypeOf(checked.value),
                    );
                    expect(Object.keys(trusted.value)).toEqual(Object.keys(checked.value));
                }
            }
        }
    });
});

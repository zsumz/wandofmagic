import { describe, expect, it } from 'vitest';
import { number } from '../src/coerce/index.js';
import { spell } from '../src/index.js';

describe('ahead-of-time structural projections', () => {
    it('preserves output order and receipt order while removing dead structural writes', () => {
        const normalize = spell<{
            first_name: string;
            password_hash: string;
            untouched: number;
        }>()
            .rename({ first_name: 'firstName', password_hash: 'passwordHash' })
            .trim(['firstName'])
            .omit(['passwordHash'])
            .build();

        const result = normalize.safeRun({
            first_name: ' Ada ',
            password_hash: 'secret',
            untouched: 1,
        });
        expect(result).toMatchObject({
            changes: [
                { kind: 'rename', to: ['firstName'] },
                { kind: 'rename', to: ['passwordHash'] },
                { kind: 'trim', path: ['firstName'] },
                { kind: 'omit', path: ['passwordHash'] },
            ],
            ok: true,
            value: { firstName: 'Ada', untouched: 1 },
        });
        if (result.ok) {
            expect(Object.keys(result.value)).toEqual(['untouched', 'firstName']);
        }
    });

    it('keeps projected rename receipts but defers omit receipts across a middle failure', () => {
        const normalize = spell<{ count: string; secret: string }>()
            .rename({ secret: 'credential' })
            .coerce('count', number())
            .omit(['credential'])
            .build();

        expect(normalize.safeRun({ count: 'invalid', secret: 'private' })).toMatchObject({
            changes: [{ kind: 'rename', to: ['credential'] }],
            issues: [{ code: 'coercion_failed', path: ['count'] }],
            ok: false,
        });
    });

    it('reports a projected rename conflict before recording structural changes', () => {
        const normalize = spell<{
            first_name: string;
            firstName?: string;
            removable?: boolean;
        }>()
            .rename({ first_name: 'firstName' })
            .omit(['removable'])
            .build();

        expect(normalize.safeRun({ first_name: 'Ada', firstName: 'Grace' })).toMatchObject({
            changes: [],
            issues: [{ code: 'destination_conflict', path: ['firstName'] }],
            ok: false,
        });
    });

    it('validates every descriptor before reporting a projected operation issue', () => {
        let getterCalls = 0;
        const input = Object.defineProperty(
            { first_name: 'Ada', firstName: 'Grace' },
            'removable',
            {
                enumerable: true,
                get() {
                    getterCalls += 1;
                    return true;
                },
            },
        );
        const normalize = spell<{
            first_name: string;
            firstName?: string;
            removable?: boolean;
        }>()
            .rename({ first_name: 'firstName' })
            .omit(['removable'])
            .build();

        expect(normalize.safeRun(input)).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['removable'] }],
            ok: false,
        });
        expect(getterCalls).toBe(0);
    });

    it('preserves null prototypes in projected outputs', () => {
        const normalize = spell<{ removable: string; source: string }>()
            .rename({ source: 'target' })
            .omit(['removable'])
            .build();
        const input = Object.create(null) as { removable: string; source: string };
        input.removable = 'remove me';
        input.source = 'kept';

        const result = normalize.safeRun(input);
        expect(result).toMatchObject({ ok: true, value: { target: 'kept' } });
        if (result.ok) {
            expect(Object.getPrototypeOf(result.value)).toBeNull();
        }
    });

    it('falls back when a middle step touches an omitted field', () => {
        const normalize = spell<{ removable: string; source: string }>()
            .rename({ source: 'target' })
            .trim(['removable'])
            .omit(['removable'])
            .build();
        const input = { removable: ' remove me ', source: 'kept' };

        const result = normalize.safeRun(input);
        expect(result).toMatchObject({
            changes: [
                { kind: 'rename' },
                { kind: 'trim' },
                { kind: 'omit' },
            ],
            ok: true,
            value: { target: 'kept' },
        });
    });

    it('matches fallback behavior across the 31-entry projection limit', () => {
        for (const fieldCount of [31, 32]) {
            const mapping: Record<string, string> = {};
            for (let index = 0; index < fieldCount; index += 1) {
                mapping[`source_${String(index)}`] = `target_${String(index)}`;
            }
            const lastIndex = fieldCount - 1;
            const normalize = spell<Record<string, number>>()
                .rename(mapping as never)
                .omit([`target_${String(lastIndex)}`] as never)
                .build();

            expect(normalize.safeRun({
                source_0: 0,
                [`source_${String(lastIndex)}`]: lastIndex,
            })).toMatchObject({
                changes: [
                    { kind: 'rename', to: ['target_0'] },
                    { kind: 'rename', to: [`target_${String(lastIndex)}`] },
                    { kind: 'omit', path: [`target_${String(lastIndex)}`] },
                ],
                ok: true,
                value: { target_0: 0 },
            });
        }
    });
});

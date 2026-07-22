import { describe, expect, it } from 'vitest';

import { collection, spell, type Spell, WandError } from '../../src/index.js';
import { number } from '../../src/coerce/index.js';

interface WireItem {
    age: string;
    name: string;
}

function itemSpell(): Spell<WireItem, { age: number; name: string }> {
    return spell<WireItem>()
        .trim(['name'])
        .coerce('age', number({ integer: true }))
        .build();
}

describe('root collection execution', () => {
    it('maps present items, preserves holes, and prefixes receipts', () => {
        const input: WireItem[] = [];
        input.length = 3;
        input[0] = { age: '37', name: ' Ada ' };
        input[2] = { age: '42', name: ' Grace ' };

        const result = collection(itemSpell()).safeRun(input);

        expect(result).toMatchObject({ ok: true });
        if (!result.ok) {
            throw new Error('Expected collection execution to succeed.');
        }
        const expected: Array<{ age: number; name: string }> = [];
        expected.length = 3;
        expected[0] = { age: 37, name: 'Ada' };
        expected[2] = { age: 42, name: 'Grace' };
        expect(result.value).toEqual(expected);
        expect(1 in result.value).toBe(false);
        expect(result.changes.map((change) =>
            'path' in change ? change.path : change.from)).toEqual([
            [0, 'name'],
            [0, 'age'],
            [2, 'name'],
            [2, 'age'],
        ]);
        expect(input[0]).toEqual({ age: '37', name: ' Ada ' });
        expect(input[2]).toEqual({ age: '42', name: ' Grace ' });
    });

    it('prefixes item failures and retains changes before failure', () => {
        const result = collection(itemSpell()).safeRun([
            { age: '37', name: ' Ada ' },
            { age: 'unknown', name: ' Grace ' },
        ]);

        expect(result).toMatchObject({
            changes: [
                { kind: 'trim', path: [0, 'name'] },
                { kind: 'coerce', path: [0, 'age'] },
                { kind: 'trim', path: [1, 'name'] },
            ],
            issues: [{ code: 'coercion_failed', path: [1, 'age'] }],
            ok: false,
        });
    });

    it('supports discarded receipts and throwing execution', () => {
        const normalize = collection(itemSpell());
        expect(normalize.safeRun(
            [{ age: '37', name: ' Ada ' }],
            { receipt: 'discard' },
        )).toMatchObject({ changes: [], ok: true });
        expect(() => normalize.run([{ age: 'invalid', name: ' Ada ' }]))
            .toThrow(WandError);
    });

    it('describes the plan applied to every present item', () => {
        const item = itemSpell();
        expect(collection(item).describe()).toBe(item.describe());
    });
});

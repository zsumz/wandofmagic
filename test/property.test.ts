import { describe, expect, it } from 'vitest';

import { spell } from '../src/index.js';

const cases = [
    '',
    ' ',
    '\tvalue\n',
    'already-clean',
    '  leading',
    'trailing  ',
    '  both  ',
    '🙂 unicode 🙂',
    '\u00a0non-breaking\u00a0',
] as const;

describe('invariant checks', () => {
    it('trim is deterministic and never mutates its input', () => {
        const normalize = spell<{ value: string }>().trim(['value']).build();

        for (const value of cases) {
            const input = { value };
            const first = normalize.run(input);
            const second = normalize.run(input);

            expect(first).toEqual(second);
            expect(first.value).toBe(value.trim());
            expect(input.value).toBe(value);
        }
    });
});

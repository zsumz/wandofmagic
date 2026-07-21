import { describe, expect, it } from 'vitest';
import { spell } from '../../../src/index.js';

describe('long execution snapshots', () => {
    it('executes a 100-step compiled plan without losing order or receipts', () => {
        let builder = spell<{ value: string }>();
        for (let index = 0; index < 100; index += 1) {
            builder = builder.trim(['value']);
        }

        const result = builder.build().safeRun({ value: '  stable  ' });
        expect(result).toMatchObject({
            changes: [{ kind: 'trim', stepId: 'trim:1' }],
            ok: true,
            value: { value: 'stable' },
        });
    });
});

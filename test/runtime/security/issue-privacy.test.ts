import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/index.js';

describe('runtime issue privacy', () => {
    it('does not include thrown causes in serialized issues', () => {
        const normalize = spell<{ value: string }>()
            .transform('value', () => {
                throw new Error('sensitive details');
            })
            .build();

        const result = normalize.safeRun({ value: 'x' });
        expect(result.ok).toBe(false);
        expect(JSON.stringify(result)).not.toContain('sensitive details');
    });
});

import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('deep copy guardrails', () => {
    it('rejects destinations nested inside their source', () => {
        expectPlanError(
            () => spell<{ profile: { name: string } }>()
                .copy('profile', ['profile', 'backup']),
            'invalid_path',
        );
        expectPlanError(
            () => spell<{ profile: string }>().copy('profile', 'profile'),
            'invalid_path',
        );
    });

    it('rejects destination accessors atomically', () => {
        let reads = 0;
        const target = {};
        Object.defineProperty(target, 'value', {
            enumerable: true,
            get() {
                reads += 1;
                return 'private';
            },
        });
        const result = spell<{ source: string; target: { value?: string } }>()
            .copy('source', ['target', 'value'], { conflict: 'overwrite' })
            .build()
            .safeRun({ source: 'copy', target });

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', step: { kind: 'copy' } }],
            ok: false,
        });
        expect(reads).toBe(0);
    });
});

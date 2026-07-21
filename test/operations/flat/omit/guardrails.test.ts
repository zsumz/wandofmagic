import { describe, it } from 'vitest';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('omit guardrails', () => {
    it('rejects an empty key list', () => {
        expectPlanError(() => spell<{ value: string }>().omit([]), 'empty_operation');
    });
});

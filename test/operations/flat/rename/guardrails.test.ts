import { describe, it } from 'vitest';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('rename guardrails', () => {
    it('rejects an empty mapping', () => {
        expectPlanError(() => spell<{ value: string }>().rename({}), 'empty_operation');
    });

    it('rejects duplicate destinations', () => {
        expectPlanError(
            () => spell<{ a: string; b: string }>().rename({ a: 'value', b: 'value' }),
            'duplicate_destination',
        );
    });
});

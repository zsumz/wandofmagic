import { describe, it } from 'vitest';
import { spell } from '../../../src/index.js';
import { expectPlanError } from '../../support/expect-plan-error.js';

describe('builder step IDs', () => {
    it('rejects invalid IDs', () => {
        expectPlanError(
            () => spell<{ value: string }>().trim(['value'], { id: 'not valid' }),
            'invalid_step_id',
        );
    });

    it('rejects duplicate IDs across operations', () => {
        expectPlanError(
            () =>
                spell<{ value: string }>()
                    .trim(['value'], { id: 'normalize' })
                    .transform('value', (value) => value, { id: 'normalize' }),
            'duplicate_step_id',
        );
    });
});

import { describe, it } from 'vitest';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('derive guardrails', () => {
    it('rejects an empty dependency list', () => {
        const emptyDependencies = [] as unknown as readonly ['value'];

        expectPlanError(
            () => spell<{ value: string }>().derive('next', emptyDependencies, () => 'value'),
            'empty_operation',
        );
    });

    it('rejects duplicate dependencies while building', () => {
        expectPlanError(
            () =>
                spell<{ firstName: string }>().derive(
                    'displayName',
                    ['firstName', 'firstName'],
                    ([firstName]) => firstName,
                ),
            'duplicate_dependency',
        );
    });
});

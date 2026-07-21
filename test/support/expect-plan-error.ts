import { expect } from 'vitest';

import { PlanError, type PlanErrorCode } from '../../src/index.js';

export function expectPlanError(action: () => unknown, code: PlanErrorCode): void {
    try {
        action();
    } catch (error) {
        expect(error).toBeInstanceOf(PlanError);
        if (!(error instanceof PlanError)) {
            throw error;
        }

        expect(error.code).toBe(code);
        return;
    }

    throw new Error(`Expected PlanError with code ${code}.`);
}

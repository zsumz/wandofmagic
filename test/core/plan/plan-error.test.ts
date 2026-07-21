import { describe, expect, it } from 'vitest';
import { PlanError } from '../../../src/index.js';

describe('PlanError', () => {
    it('retains its public identity and metadata', () => {
        const error = new PlanError('dangerous_key', 'Nope');

        expect(error).toMatchObject({ code: 'dangerous_key', message: 'Nope', name: 'PlanError' });
    });
});

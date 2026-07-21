import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('move semantics', () => {
    it('moves a nested value atomically with full-path metadata', () => {
        const stable = Object.freeze({ retained: true });
        const company = Object.freeze({ legalName: 'Acme', stable });
        const input = Object.freeze({ company, other: stable });
        const rename = spell<typeof input>()
            .move(['company', 'legalName'], ['company', 'name'], { id: 'move-name' })
            .build();

        const result = rename.safeRun(input);
        expect(result.ok).toBe(true);
        if (!result.ok) {
            return;
        }
        expect(result.value).toEqual({ company: { name: 'Acme', stable }, other: stable });
        expect(result.value.company).not.toBe(company);
        expect(result.value.company.stable).toBe(stable);
        expect(result.value.other).toBe(stable);
        expect(input.company.legalName).toBe('Acme');
        expect(result.changes).toEqual([{
            from: ['company', 'legalName'],
            kind: 'move',
            stepId: 'move-name',
            to: ['company', 'name'],
        }]);
        expect(rename.describe().steps).toEqual([{
            id: 'move-name',
            kind: 'move',
            reads: [['company', 'legalName'], ['company', 'name']],
            removes: [['company', 'legalName']],
            writes: [['company', 'name']],
        }]);
        expect(JSON.stringify(result.changes)).not.toContain('Acme');
        expect(JSON.stringify(rename.describe())).not.toContain('Acme');
    });

});

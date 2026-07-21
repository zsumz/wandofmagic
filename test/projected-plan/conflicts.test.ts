import { describe, expect, it } from 'vitest';

import { spell } from '../../src/index.js';

describe('ahead-of-time structural projection conflicts', () => {
    it('reports a rename conflict before recording structural changes', () => {
        const normalize = spell<{
            first_name: string;
            firstName?: string;
            removable?: boolean;
        }>()
            .rename({ first_name: 'firstName' })
            .omit(['removable'])
            .build();

        expect(normalize.safeRun({ first_name: 'Ada', firstName: 'Grace' })).toMatchObject({
            changes: [],
            issues: [{ code: 'destination_conflict', path: ['firstName'] }],
            ok: false,
        });
    });
});

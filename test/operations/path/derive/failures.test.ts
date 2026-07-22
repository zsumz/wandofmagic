import { describe, expect, it } from 'vitest';

import { spell } from '../../../../src/index.js';

describe('deep derive failures', () => {
    it('rejects missing dependencies and occupied destinations', () => {
        const normalize = spell<{
            profile?: { first?: string };
        }>()
            .derive(['profile', 'label'], [['profile', 'first']], ([first]) => first)
            .build();

        expect(normalize.safeRun({})).toMatchObject({
            changes: [],
            issues: [{ code: 'missing_field', path: ['profile', 'first'] }],
            ok: false,
        });
        const occupied = { profile: { first: 'Ada', label: 'occupied' } };
        expect(normalize.safeRun(occupied))
            .toMatchObject({
                changes: [],
                issues: [{ code: 'destination_conflict', path: ['profile', 'label'] }],
                ok: false,
            });
    });

    it('converts thrown and asynchronous callbacks into failures', () => {
        const thrown = spell<{ source: string }>()
            .derive(['result', 'value'], ['source'], () => {
                throw new Error('private');
            })
            .build()
            .safeRun({ source: 'value' });
        expect(thrown).toMatchObject({
            changes: [],
            issues: [{ code: 'transform_failed', path: ['result', 'value'] }],
            ok: false,
        });
        expect(JSON.stringify(thrown)).not.toContain('private');

        const asynchronous = spell<{ source: string }>()
            .derive(
                ['result', 'value'],
                ['source'],
                (async () => await Promise.resolve('value')) as never,
            )
            .build()
            .safeRun({ source: 'value' });
        expect(asynchronous).toMatchObject({
            changes: [],
            issues: [{ code: 'transform_failed' }],
            ok: false,
        });
    });

    it('rejects duplicate dependencies while building', () => {
        expect(() => spell<{ profile: { first: string } }>()
            .derive(
                ['profile', 'label'],
                [['profile', 'first'], ['profile', 'first']],
                ([first]) => first,
            )).toThrowError(/dependencies must be unique/u);
    });
});

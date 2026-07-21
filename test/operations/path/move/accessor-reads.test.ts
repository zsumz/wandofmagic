import { describe, expect, it, vi } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('move accessor reads', () => {
    it('rejects an accessor-backed source leaf without invoking it', () => {
        const sourceGetter = vi.fn(() => 'secret');
        const source = Object.defineProperty({}, 'token', {
            enumerable: true,
            get: sourceGetter,
        });
        const result = spell<{ source: { token: string } }>()
            .move(['source', 'token'], 'target')
            .build()
            .safeRun({ source: source as { token: string } });

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['source', 'token'] }],
            ok: false,
        });
        expect(sourceGetter).not.toHaveBeenCalled();
    });

    it('rejects an accessor-backed destination leaf without invoking it', () => {
        const destinationGetter = vi.fn(() => 'secret');
        const destination = Object.defineProperty({}, 'token', {
            enumerable: true,
            get: destinationGetter,
        });
        const result = spell<{
            destination: { token: string };
            source: string;
        }>()
            .move('source', ['destination', 'token'])
            .build()
            .safeRun({ destination: destination as { token: string }, source: 'value' });

        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'unsupported_accessor', path: ['destination', 'token'] }],
            ok: false,
        });
        expect(destinationGetter).not.toHaveBeenCalled();
    });
});

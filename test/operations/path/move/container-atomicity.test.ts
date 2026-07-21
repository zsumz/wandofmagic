import { describe, expect, it, vi } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('move container atomicity', () => {
    it('rolls back when the destination branch is unsafe', () => {
        const destinationGetter = vi.fn(() => 'secret');
        const destination = Object.defineProperty({ visible: true }, 'computed', {
            enumerable: true,
            get: destinationGetter,
        });
        const input = { destination, source: { token: 'still-present' } };
        const result = spell<{
            destination: { visible: boolean };
            source: { token: string };
        }>()
            .move(['source', 'token'], ['destination', 'token'], { id: 'atomic-move' })
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['destination', 'computed'],
                step: { id: 'atomic-move', kind: 'move' },
            }],
            ok: false,
        });
        expect(destinationGetter).not.toHaveBeenCalled();
        expect(input.source.token).toBe('still-present');
        expect('token' in input.destination).toBe(false);
    });

    it('rolls back a staged destination when the source branch is unsafe', () => {
        const sourceGetter = vi.fn(() => 'secret');
        const source = Object.defineProperty({ token: 'still-present' }, 'computed', {
            enumerable: true,
            get: sourceGetter,
        });
        const input = { destination: { visible: true }, source };
        const result = spell<{
            destination: { visible: boolean };
            source: { token: string };
        }>()
            .move(['source', 'token'], ['destination', 'token'], { id: 'late-move' })
            .build()
            .safeRun(input);

        expect(result).toMatchObject({
            changes: [],
            issues: [{
                code: 'unsupported_accessor',
                path: ['source', 'computed'],
                step: { id: 'late-move', kind: 'move' },
            }],
            ok: false,
        });
        expect(sourceGetter).not.toHaveBeenCalled();
        expect(input.source.token).toBe('still-present');
        expect('token' in input.destination).toBe(false);
    });
});

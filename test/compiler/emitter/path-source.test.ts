import { describe, expect, it } from 'vitest';

import { createEmitterState } from '../../../src/compiler/emitter/emitter-state.js';
import {
    emitPathDeclarations,
    pathSource,
    pathsSource,
} from '../../../src/compiler/emitter/path-source.js';

describe('generated path declarations', () => {
    it('hoists and deduplicates immutable paths and path groups', () => {
        const state = createEmitterState();
        const profile = ['profile', 'name'] as const;
        const row = ['rows', 2, 'label'] as const;

        expect(pathSource(profile, state)).toBe('$path0');
        expect(pathSource(profile, state)).toBe('$path0');
        expect(pathsSource([profile, row], state)).toBe('$paths0');
        expect(pathsSource([profile, row], state)).toBe('$paths0');
        expect(emitPathDeclarations(state)).toEqual([
            'const $path0 = Object.freeze(["profile","name"]);',
            'const $path1 = Object.freeze(["rows",2,"label"]);',
            'const $paths0 = Object.freeze([$path0, $path1]);',
        ]);
    });
});

import { describe, expect, it } from 'vitest';

import { createEmitterState } from '../../../src/compiler/emitter/emitter-state.js';
import {
    emitPathDeclarations,
    pathSource,
    readPathSource,
} from '../../../src/compiler/emitter/path-source.js';

describe('generated path declarations', () => {
    it('hoists and deduplicates immutable paths', () => {
        const state = createEmitterState();
        const profile = ['profile', 'name'] as const;

        expect(pathSource(profile, state)).toBe('$path0');
        expect(pathSource(profile, state)).toBe('$path0');
        expect(emitPathDeclarations(state)).toEqual([
            'const $path0 = Object.freeze(["profile","name"]);',
        ]);
    });

    it('deduplicates safe read programs', () => {
        const state = createEmitterState();
        const profile = ['profile', 'name'] as const;
        const row = ['rows', 2, 'label'] as const;

        expect(readPathSource('$value', profile, state)).toBe('$readPath0($value)');
        expect(readPathSource('$staged', profile, state)).toBe('$readPath0($staged)');
        expect(readPathSource('$value', row, state)).toBe('$readPath1($value)');

        const source = emitPathDeclarations(state).join('\n');
        expect(source.match(/function \$readPath\d+\(\$root\)/gu)).toHaveLength(2);
        expect(source).toContain('$container2 === $container0 || $container2 === $container1');
    });
});

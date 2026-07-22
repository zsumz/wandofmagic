import { describe, expect, it } from 'vitest';

import { createEmitterState } from '../../../src/compiler/emitter/emitter-state.js';
import {
    emitPathDeclarations,
    pathReadersSource,
    pathSource,
    pathsSource,
    readPathSource,
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

    it('deduplicates safe read programs and emits aligned reader groups', () => {
        const state = createEmitterState();
        const profile = ['profile', 'name'] as const;
        const row = ['rows', 2, 'label'] as const;

        expect(readPathSource('$value', profile, state)).toBe('$readPath0($value)');
        expect(readPathSource('$staged', profile, state)).toBe('$readPath0($staged)');
        expect(pathReadersSource([profile, row], state)).toBe('$pathReaders0');

        const source = emitPathDeclarations(state).join('\n');
        expect(source.match(/function \$readPath\d+\(\$root\)/gu)).toHaveLength(2);
        expect(source).toContain(
            'const $pathReaders0 = Object.freeze([$readPath0, $readPath1]);',
        );
        expect(source).toContain('$container2 === $container0 || $container2 === $container1');
    });
});

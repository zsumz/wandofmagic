import type { FieldPath } from '../../core/path/path.js';

/** Render an emitter-controlled normalized path as an immutable JavaScript array. */
export function pathSource(path: FieldPath): string {
    return `Object.freeze(${JSON.stringify(path)})`;
}

export function pathsSource(paths: readonly FieldPath[]): string {
    return `Object.freeze([${paths.map(pathSource).join(', ')}])`;
}

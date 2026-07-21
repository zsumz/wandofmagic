import type { PathSegment } from '../../../src/core/path/path.js';

export function defineReferenceField(
    container: Record<PropertyKey, unknown> | unknown[],
    segment: PathSegment,
    value: unknown,
): void {
    Object.defineProperty(container, segment, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}

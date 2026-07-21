import type { PathSegment } from '../../core/path/path.js';
import type { PathContainer } from '../path-container/container-types.js';

/** Define a writable enumerable data field on a private object or array clone. */
export function defineContainerField(
    container: PathContainer,
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

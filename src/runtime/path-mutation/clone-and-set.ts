import type {
    FieldPath,
    PathSegment,
} from '../../core/path/path.js';
import { clonePathContainer } from '../clone-path-container/clone-path-container.js';
import { defineContainerField } from '../clone-path-container/define-container-field.js';
import type { PathContainer } from '../path-container/container-types.js';
import type { ContainerMutationResult } from './mutation-result.js';

export function cloneAndSet(
    container: PathContainer,
    path: FieldPath,
    index: number,
    segment: PathSegment,
    value: unknown,
): ContainerMutationResult {
    const cloned = clonePathContainer(container, path, index);
    if (!cloned.ok) {
        return cloned;
    }
    defineContainerField(cloned.value, segment, value);
    return { changed: true, ok: true, value: cloned.value };
}

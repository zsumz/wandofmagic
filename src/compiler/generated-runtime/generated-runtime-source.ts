import { baseRuntimeSource } from './base-runtime-source.js';
import { isoDateRuntimeSource } from './iso-date-runtime-source.js';
import { pathCloneRuntimeSource } from './path-clone-runtime-source.js';
import { pathDeleteRuntimeSource } from './path-delete-runtime-source.js';
import { pathProjectionRuntimeSource } from './path-projection-runtime-source.js';
import { pathReadRuntimeSource } from './path-read-runtime-source.js';
import { pathSetRuntimeSource } from './path-set-runtime-source.js';

export function generatedRuntimeSource(
    includeIsoDate: boolean,
    includePaths: boolean,
): readonly string[] {
    return [
        ...baseRuntimeSource,
        ...includePaths ? [
            ...pathReadRuntimeSource,
            ...pathCloneRuntimeSource,
            ...pathSetRuntimeSource,
            ...pathDeleteRuntimeSource,
            ...pathProjectionRuntimeSource,
        ] : [],
        ...includeIsoDate ? isoDateRuntimeSource : [],
    ];
}

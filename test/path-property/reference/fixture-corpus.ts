import type { DataRecord } from '../../../src/core/execution/data-record.js';
import type { FieldPath } from '../../../src/core/path/path.js';
import { createSparseDataArray } from '../../../src/internal/type-boundary/array.js';
import { normalizePath } from '../../../src/runtime/path/normalize-path.js';
import { defineReferenceField } from './data-field.js';

export function referenceMutationPaths(): readonly FieldPath[] {
    return [
        normalizePath('flag'),
        normalizePath(['profile', 'name']),
        normalizePath(['profile', 'tags', 0]),
        normalizePath(['profile', 'tags', 1]),
        normalizePath(['profile', 'tags', 4]),
        normalizePath(['orders', 0, 'total']),
        normalizePath(['orders', 2, 'total']),
        normalizePath(['metadata', 'count']),
        normalizePath(['created', 'nested', 3, 'label']),
    ];
}

export function createReferenceFixture(): DataRecord {
    const metadata = Object.create(null) as Record<string, unknown>;
    defineReferenceField(metadata, 'count', 2);
    const tags = createSparseDataArray(3);
    tags[0] = 'first';
    tags[2] = 'third';
    return {
        flag: true,
        metadata,
        orders: [{ total: 10 }, { total: 20 }],
        profile: { name: 'Ada', tags },
    };
}

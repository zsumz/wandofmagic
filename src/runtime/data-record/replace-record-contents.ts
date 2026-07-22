import type { DataRecord } from '../../core/execution/data-record.js';
import { defineContainerField } from '../clone-path-container/define-container-field.js';
import { deleteField } from './record-fields.js';

/** Replace every enumerable string field in a private execution snapshot. */
export function replaceRecordContents(target: DataRecord, replacement: DataRecord): void {
    for (const key of Object.keys(target)) {
        deleteField(target, key);
    }
    for (const key of Object.keys(replacement)) {
        defineContainerField(target, key, replacement[key]);
    }
}

import type { DataRecord } from '../../core/execution/data-record.js';

const objectPrototype = Object.prototype;

export function hasOwn(record: DataRecord, key: string): boolean {
    return objectPrototype.hasOwnProperty.call(record, key);
}

export function deleteField(record: DataRecord, key: string): void {
    // The key was plan-validated and the record is a private writable snapshot.
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete record[key];
}

import type { DataRecord } from '../../core/execution/data-record.js';

/** Define one inspected data property on a private execution snapshot. */
export function defineSnapshotField(record: DataRecord, key: string, value: unknown): void {
    if (key === '__proto__') {
        Object.defineProperty(record, key, {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
        });
        return;
    }

    record[key] = value;
}

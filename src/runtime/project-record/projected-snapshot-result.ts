import type { DataRecord } from '../../core/execution/data-record.js';
import type { WandIssue } from '../../core/issue/issue-types.js';

export type ProjectedSnapshotResult =
    | {
        readonly deferredOmitMask: number;
        readonly ok: true;
        readonly value: DataRecord;
    }
    | { readonly issue: WandIssue; readonly ok: false };

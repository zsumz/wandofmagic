import type { DataRecord } from '../../core/execution/data-record.js';
import type { WandIssue } from '../../core/issue/issue-types.js';

export type PathContainer = DataRecord | unknown[];

export type ContainerInspection =
    | { readonly issue: WandIssue; readonly ok: false }
    | { readonly ok: true; readonly value: PathContainer };

export type ContainerRead =
    | { readonly issue: WandIssue; readonly status: 'failed' }
    | { readonly status: 'found'; readonly value: unknown }
    | { readonly status: 'missing' };

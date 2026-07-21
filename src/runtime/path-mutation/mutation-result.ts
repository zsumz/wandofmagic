import type { DataRecord } from '../../core/execution/data-record.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import type { PathContainer } from '../path-container/container-types.js';

export type PathMutationResult =
    | { readonly changed: boolean; readonly ok: true; readonly value: DataRecord }
    | { readonly issue: WandIssue; readonly ok: false };

export type ContainerMutationResult =
    | { readonly changed: boolean; readonly ok: true; readonly value: PathContainer }
    | { readonly issue: WandIssue; readonly ok: false };

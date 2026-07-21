import type { WandIssue } from '../../core/issue/issue-types.js';
import type { PathContainer } from '../path-container/container-types.js';

export type ContainerCloneResult =
    | { readonly issue: WandIssue; readonly ok: false }
    | { readonly ok: true; readonly value: PathContainer };

import type { WandChange } from '../../core/change/receipt-types.js';
import type { RunOptions } from '../../core/execution/run-options.js';
import type { WandResult } from '../../core/execution/result.js';
import type { Spell } from '../../core/execution/spell.js';
import type { WandIssue } from '../../core/issue/issue-types.js';
import { createSparseDataArray } from '../../internal/type-boundary/array.js';
import {
    castCollectionItem,
    castCollectionOutput,
} from '../../internal/type-boundary/collection.js';
import {
    exposeChanges,
    resolveExecutionOptions,
} from '../execute-plan/execution-support.js';
import { prefixCollectionChange } from './prefix-change.js';
import { prefixCollectionIssue } from './prefix-issue.js';
import { snapshotCollection } from './snapshot-collection.js';

export function executeCollection<Input extends object, Output extends object>(
    input: readonly Input[],
    itemSpell: Spell<Input, Output>,
    options?: RunOptions,
): WandResult<Output[]> {
    const resolved = resolveExecutionOptions(options);
    const changes: WandChange[] | undefined = resolved.receipt === 'collect' ? [] : undefined;
    const snapshot = snapshotCollection(input, resolved.input);
    if (!snapshot.ok) {
        return collectionFailure([snapshot.issue], changes);
    }

    const output = createSparseDataArray(snapshot.length);
    for (const entry of snapshot.entries) {
        const result = itemSpell.safeRun(
            castCollectionItem<Input>(entry.value),
            resolved,
        );
        appendItemChanges(changes, entry.index, result.changes);
        if (!result.ok) {
            return collectionFailure(
                result.issues.map((issue) => prefixCollectionIssue(entry.index, issue)),
                changes,
            );
        }
        output[entry.index] = result.value;
    }

    return Object.freeze({
        changes: exposeChanges(changes),
        ok: true,
        value: castCollectionOutput<Output>(output),
    });
}

function appendItemChanges(
    changes: WandChange[] | undefined,
    index: number,
    itemChanges: readonly WandChange[],
): void {
    if (changes !== undefined) {
        changes.push(...itemChanges.map((change) => prefixCollectionChange(index, change)));
    }
}

function collectionFailure(
    issues: readonly WandIssue[],
    changes: WandChange[] | undefined,
): WandResult<never> {
    return Object.freeze({
        changes: exposeChanges(changes),
        issues: Object.freeze([...issues]),
        ok: false,
    });
}

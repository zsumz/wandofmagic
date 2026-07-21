import type { WandResult } from 'wandofmagic';

function readResult(result: WandResult<{ readonly value: string }>): unknown {
    if (result.ok) {
        return [result.changes, result.value.value];
    }

    return [result.changes, result.issues];
}

void readResult;

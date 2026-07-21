import type { BenchmarkOutput } from '../../harness/benchmark-types.mts';
import { coerceActive } from './coerce-active.mts';
import { coerceAge } from './coerce-age.mts';
import { deriveName } from './derive-name.mts';
import { projectTrustedInput } from './project-input.mts';
import { hasOwn } from './record-fields.mts';
import { trimFields } from './trim-fields.mts';

export function runHandwrittenEquivalent(input: object): BenchmarkOutput {
    const snapshot = projectTrustedInput(input);
    trimFields(snapshot);
    coerceAge(snapshot);
    coerceActive(snapshot);
    if (!hasOwn(snapshot, 'active') || snapshot['active'] === undefined) {
        snapshot['active'] = false;
    }
    deriveName(snapshot);
    return snapshot as BenchmarkOutput;
}

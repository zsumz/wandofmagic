import type { RequireAtPath } from 'wandofmagic';

import type { AppendPathTypeOperation } from '../../../../src/types/path-program/append-operation.js';
import type { EvaluatePathTypeOperations } from '../../../../src/types/path-program/evaluate-program.js';

type Variant =
    | { common?: { side: 'left'; value?: string } }
    | { common: { side: 'right'; value: string } };
type VariantProgram = AppendPathTypeOperation<readonly [], {
    readonly kind: 'require';
    readonly path: readonly ['common', 'value'];
    readonly replacement: number;
}>;
type SequentialVariant = RequireAtPath<Variant, readonly ['common', 'value'], number>;
type ProgramVariant = EvaluatePathTypeOperations<Variant, VariantProgram>;
declare const sequentialVariant: SequentialVariant;
declare const programVariant: ProgramVariant;
const programVariantContract: SequentialVariant = programVariant;
const sequentialVariantContract: ProgramVariant = sequentialVariant;
void [programVariantContract, sequentialVariantContract];

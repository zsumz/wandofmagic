import type { AppendPathTypeOperation } from '../../../../src/types/path-program/append-operation.js';
import type { EvaluatePathTypeOperations } from '../../../../src/types/path-program/evaluate-program.js';
import type { Model } from './model.js';

type ReaddedProgram1 = AppendPathTypeOperation<readonly [], {
    readonly kind: 'omit';
    readonly path: readonly ['stable'];
}>;
type ReaddedProgram2 = AppendPathTypeOperation<ReaddedProgram1, {
    readonly kind: 'add';
    readonly path: readonly ['stable'];
    readonly replacement: 'restored';
}>;
type Readded = EvaluatePathTypeOperations<Model, ReaddedProgram2>;
declare const readded: Readded;
const restored: 'restored' = readded.stable;
void restored;

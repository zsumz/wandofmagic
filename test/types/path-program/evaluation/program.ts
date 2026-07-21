import type { AppendPathTypeOperation } from '../../../../src/types/path-program/append-operation.js';
import type { EvaluatePathTypeOperations } from '../../../../src/types/path-program/evaluate-program.js';
import type { Model } from './model.js';

type Program0 = readonly [];
type Program1 = AppendPathTypeOperation<Program0, {
    readonly kind: 'require';
    readonly path: readonly ['optional', 'value'];
    readonly replacement: number;
}>;
type Program2 = AppendPathTypeOperation<Program1, {
    readonly kind: 'add';
    readonly path: readonly ['optional', 'extra'];
    readonly replacement: 'added';
}>;
type Program3 = AppendPathTypeOperation<Program2, {
    readonly kind: 'add';
    readonly path: readonly ['optional', 'rows', 0, 'selected'];
    readonly replacement: true;
}>;
type Program4 = AppendPathTypeOperation<Program3, {
    readonly kind: 'omit';
    readonly path: readonly ['optional', 'keep'];
}>;
type Program5 = AppendPathTypeOperation<Program4, {
    readonly kind: 'replace';
    readonly path: readonly ['stable', 'value'];
    readonly replacement: boolean;
}>;
type Program6 = AppendPathTypeOperation<Program5, {
    readonly kind: 'omit';
    readonly path: readonly ['removable'];
}>;
type Program7 = AppendPathTypeOperation<Program6, {
    readonly kind: 'add';
    readonly path: readonly ['metadata', 'source'];
    readonly replacement: 'shopify';
}>;

export type ProgramOutput = EvaluatePathTypeOperations<Model, Program7>;

import type { AddAtPath, OmitAtPath, ReplaceAtPath, RequireAtPath } from 'wandofmagic';
import type {
    AppendPathTypeOperation,
    EvaluatePathTypeOperations,
} from '../../src/types/path-program.js';

interface Model {
    readonly optional?: {
        readonly keep: boolean;
        readonly rows: Array<{ readonly label: string }>;
        readonly value?: string;
    };
    removable?: string;
    readonly stable: { readonly value: number };
}

type Sequential1 = RequireAtPath<Model, readonly ['optional', 'value'], number>;
type Sequential2 = AddAtPath<Sequential1, readonly ['optional', 'extra'], 'added'>;
type Sequential3 = AddAtPath<Sequential2, readonly ['optional', 'rows', 0, 'selected'], true>;
type Sequential4 = OmitAtPath<Sequential3, readonly ['optional', 'keep']>;
type Sequential5 = ReplaceAtPath<Sequential4, readonly ['stable', 'value'], boolean>;
type Sequential6 = OmitAtPath<Sequential5, readonly ['removable']>;
type SequentialOutput = AddAtPath<
    Sequential6,
    readonly ['metadata', 'source'],
    'shopify'
>;

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

type ProgramOutput = EvaluatePathTypeOperations<Model, Program7>;
declare const sequentialOutput: SequentialOutput;
declare const programOutput: ProgramOutput;
const programMatchesSequential: SequentialOutput = programOutput;
const sequentialMatchesProgram: ProgramOutput = sequentialOutput;
void [programMatchesSequential, sequentialMatchesProgram];

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

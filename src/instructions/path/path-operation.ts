import type { CoercerInstruction } from '../coercer/coercer-instruction.js';
import type { FlatOperationInstruction } from '../flat/flat-operation.js';

export interface CoercePathInstruction {
    readonly coercer: CoercerInstruction;
    readonly id: string;
    readonly kind: 'coerce-path';
    readonly missing: 'error' | 'skip';
    readonly path: readonly [string, ...Array<string | number>];
}

export interface DefaultPathInstruction {
    readonly fallback: unknown;
    readonly id: string;
    readonly kind: 'default-path';
    readonly path: readonly [string, ...Array<string | number>];
}

export interface OmitPathsInstruction {
    readonly id: string;
    readonly kind: 'omit-paths';
    readonly paths: ReadonlyArray<readonly [string, ...Array<string | number>]>;
}

export interface PickInstruction {
    readonly id: string;
    readonly kind: 'pick';
    readonly paths: ReadonlyArray<readonly [string, ...Array<string | number>]>;
}

export interface MoveInstruction {
    readonly conflict: 'error' | 'overwrite' | 'preserve';
    readonly destination: readonly [string, ...Array<string | number>];
    readonly id: string;
    readonly kind: 'move';
    readonly missing: 'error' | 'skip';
    readonly source: readonly [string, ...Array<string | number>];
}

export interface CopyInstruction {
    readonly conflict: 'error' | 'overwrite' | 'preserve';
    readonly destination: readonly [string, ...Array<string | number>];
    readonly id: string;
    readonly kind: 'copy';
    readonly missing: 'error' | 'skip';
    readonly source: readonly [string, ...Array<string | number>];
}

export interface SetInstruction {
    readonly id: string;
    readonly kind: 'set';
    readonly path: readonly [string, ...Array<string | number>];
    readonly replacement: unknown;
}

export interface TransformPathInstruction {
    readonly binding: unknown;
    readonly id: string;
    readonly kind: 'transform-path';
    readonly missing: 'error' | 'skip';
    readonly path: readonly [string, ...Array<string | number>];
}

export type OperationInstruction =
    | CoercePathInstruction
    | CopyInstruction
    | DefaultPathInstruction
    | FlatOperationInstruction
    | MoveInstruction
    | OmitPathsInstruction
    | PickInstruction
    | SetInstruction
    | TransformPathInstruction;

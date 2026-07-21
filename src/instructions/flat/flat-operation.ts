import type { CoercerInstruction } from '../coercer/coercer-instruction.js';

export interface RenameFieldInstruction {
    readonly destination: string;
    readonly source: string;
}

interface OperationInstruction {
    readonly id: string;
}

export interface RenameInstruction extends OperationInstruction {
    readonly entries: readonly RenameFieldInstruction[];
    readonly kind: 'rename';
}

export interface TrimInstruction extends OperationInstruction {
    readonly keys: readonly string[];
    readonly kind: 'trim';
}

export interface CoerceInstruction extends OperationInstruction {
    readonly coercer: CoercerInstruction;
    readonly key: string;
    readonly kind: 'coerce';
    readonly missing: 'error' | 'skip';
}

export interface DefaultInstruction extends OperationInstruction {
    readonly fallback: unknown;
    readonly key: string;
    readonly kind: 'default';
}

export interface DeriveInstruction extends OperationInstruction {
    readonly binding: unknown;
    readonly dependencies: readonly string[];
    readonly key: string;
    readonly kind: 'derive';
}

export interface OmitInstruction extends OperationInstruction {
    readonly keys: readonly string[];
    readonly kind: 'omit';
}

export interface TransformInstruction extends OperationInstruction {
    readonly binding: unknown;
    readonly key: string;
    readonly kind: 'transform';
    readonly missing: 'error' | 'skip';
}

export type FlatOperationInstruction =
    | CoerceInstruction
    | DefaultInstruction
    | DeriveInstruction
    | OmitInstruction
    | RenameInstruction
    | TransformInstruction
    | TrimInstruction;

export type FlatProgram = readonly FlatOperationInstruction[];

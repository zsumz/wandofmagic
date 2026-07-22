import type {
    Path as StrictPath,
    PathInput,
} from '../../core/path/path.js';
import type {
    ReadonlyCallbackValue,
} from './callback-value.js';
import type { BuilderOutput } from './field-output.js';
import type { PathOf } from '../path/enumerate.js';
import type { SafePathInput } from '../path/input.js';
import type { AppendSetPathTypeOperation } from '../path-program/append-operation.js';
import type { PathTypeOperation } from '../path-program/operation.js';
import type { RawPathOperationValue } from './path-value.js';

export type BuilderDerivePathDependencies = readonly [PathInput, ...PathInput[]];

export type BuilderDerivePathDestination<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Destination extends StrictPath,
> = Destination
    & SafePathInput<Destination>
    & (Destination extends PathOf<BuilderOutput<Current, Program>> ? never : unknown);

type BuilderDeriveDependency<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Dependency extends PathInput,
> = Dependency
    & SafePathInput<Dependency>
    & ([RawPathOperationValue<
        Current,
        Program,
        Dependency extends string ? readonly [Dependency] : Dependency
    >] extends [never] ? never : unknown);

export type BuilderDerivePathInput<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Dependencies extends readonly PathInput[],
> = Dependencies extends readonly [
    infer Dependency extends PathInput,
    ...infer Rest extends readonly PathInput[],
]
    ? readonly [
        BuilderDeriveDependency<Current, Program, Dependency>,
        ...BuilderDerivePathInput<Current, Program, Rest>,
    ]
    : readonly [];

export type BuilderDerivePathValues<
    Current extends object,
    Program extends readonly PathTypeOperation[],
    Dependencies extends readonly PathInput[],
> = Readonly<{
    [Index in keyof Dependencies]: Dependencies[Index] extends infer Dependency extends PathInput
        ? ReadonlyCallbackValue<Exclude<RawPathOperationValue<
            Current,
            Program,
            Dependency extends string ? readonly [Dependency] : Dependency
        >, undefined>>
        : never;
}>;

export type BuilderDerivePathProgram<
    Program extends readonly PathTypeOperation[],
    Destination extends StrictPath,
    Output,
> = AppendSetPathTypeOperation<Program, Destination, Output>;

import type { PathTypeOperation } from './path-program-operation.js';
import type {
    ApplyOperationAtRoot,
    InitialRootState,
    RootState,
} from './path-program-root-state.js';
import type { SimplifyPath } from './path-shape.js';

export type { RootState } from './path-program-root-state.js';

export type EvaluateRootState<
    Value,
    Key extends PropertyKey,
    Program extends readonly PathTypeOperation[],
    State extends RootState = InitialRootState<Value, Key>,
> = Program extends readonly [
    infer Operation extends PathTypeOperation,
    ...infer Rest extends readonly PathTypeOperation[],
]
    ? Operation['path'][0] extends Key
        ? EvaluateRootState<Value, Key, Rest, ApplyOperationAtRoot<State, Operation>>
        : EvaluateRootState<Value, Key, Rest, State>
    : State;

type ProgramRootKey<Program extends readonly PathTypeOperation[]> = Program[number]['path'][0];
type RootKey<Value, Program extends readonly PathTypeOperation[]> =
    keyof Value | ProgramRootKey<Program>;
type StateAt<
    Value,
    Program extends readonly PathTypeOperation[],
    Key extends PropertyKey,
> = EvaluateRootState<Value, Key, Program>;

type PreservedProperties<Value, Program extends readonly PathTypeOperation[]> = {
    [Key in keyof Value as StateAt<Value, Program, Key>['present'] extends true
        ? StateAt<Value, Program, Key>['required'] extends false ? Key : never
        : never]: StateAt<Value, Program, Key>['value'];
};

type RequiredKey<Value, Program extends readonly PathTypeOperation[]> = {
    [Key in RootKey<Value, Program>]: StateAt<Value, Program, Key>['present'] extends true
        ? StateAt<Value, Program, Key>['required'] extends true ? Key : never
        : never;
}[RootKey<Value, Program>];

type RequiredProperties<Value, Program extends readonly PathTypeOperation[]> = {
    [Key in keyof Pick<Value, Extract<RequiredKey<Value, Program>, keyof Value>>]-?:
    StateAt<Value, Program, Key>['value'];
};

type AddedProperties<Value, Program extends readonly PathTypeOperation[]> = {
    [Key in Exclude<RequiredKey<Value, Program>, keyof Value>]:
    StateAt<Value, Program, Key>['value'];
};

type OptionalAddedKey<Value, Program extends readonly PathTypeOperation[]> = {
    [Key in Exclude<ProgramRootKey<Program>, keyof Value>]:
    StateAt<Value, Program, Key>['present'] extends true
        ? StateAt<Value, Program, Key>['required'] extends false ? Key : never
        : never;
}[Exclude<ProgramRootKey<Program>, keyof Value>];

type OptionalAddedProperties<Value, Program extends readonly PathTypeOperation[]> = {
    [Key in OptionalAddedKey<Value, Program>]?: StateAt<Value, Program, Key>['value'];
};

export type CompilePathTypeOperations<
    Value,
    Program extends readonly PathTypeOperation[],
> = Value extends object
    ? SimplifyPath<
        PreservedProperties<Value, Program>
        & RequiredProperties<Value, Program>
        & AddedProperties<Value, Program>
        & OptionalAddedProperties<Value, Program>
    >
    : Value;

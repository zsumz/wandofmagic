import type {
    Path as StrictPath,
    PathInput,
} from '../../core/path/path.js';
import type { StringKeyOf } from '../object/keys.js';
import type { PathOf } from '../path/enumerate.js';
import type {
    NormalizedPathInput,
    SafePathInput,
} from '../path/input.js';
import type { PickAtPaths } from '../path/pick.js';

export type BuilderPickPaths = readonly [PathInput, ...PathInput[]];

type BuilderPickPath<Output extends object, Candidate extends PathInput> =
    Candidate extends string
        ? Candidate & StringKeyOf<Output> & SafePathInput<Candidate>
        : Candidate extends StrictPath
            ? Candidate & PathOf<Output> & SafePathInput<Candidate>
            : never;

export type BuilderPickInput<
    Output extends object,
    Paths extends readonly PathInput[],
> = Paths extends readonly [
    infer Candidate extends PathInput,
    ...infer Rest extends PathInput[],
]
    ? readonly [BuilderPickPath<Output, Candidate>, ...BuilderPickInput<Output, Rest>]
    : readonly [];

type NormalizePickPaths<Paths extends readonly PathInput[]> = Paths extends readonly [
    infer Candidate extends PathInput,
    ...infer Rest extends readonly PathInput[],
]
    ? readonly [NormalizedPathInput<Candidate>, ...NormalizePickPaths<Rest>]
    : readonly [];

export type BuilderPickOutput<
    Output extends object,
    Paths extends BuilderPickPaths,
> = PickAtPaths<Output, NormalizePickPaths<Paths>>;

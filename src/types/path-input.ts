import type { Path as StrictPath, PathInput } from '../core/path.js';

type DangerousPathSegment = '__proto__' | 'constructor' | 'prototype';

/** Reject statically visible dangerous string segments while permitting runtime-checked inputs. */
export type SafePathInput<Candidate extends PathInput> = Candidate extends string
    ? Candidate extends DangerousPathSegment ? never : Candidate
    : Extract<Candidate[number], DangerousPathSegment> extends never ? Candidate : never;

/** Convert top-level shorthand to the tuple representation used by deferred type programs. */
export type NormalizedPathInput<Candidate extends PathInput> = Candidate extends string
    ? readonly [Candidate]
    : Candidate extends StrictPath ? Candidate : never;

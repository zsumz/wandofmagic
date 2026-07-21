import type { PathOf, PathValue } from 'wandofmagic';
import type { DeepPathExample, PathExample } from './model.js';

declare const validTopLevel: PathOf<PathExample>;
const acceptedTopLevel: PathOf<PathExample> = validTopLevel;
void acceptedTopLevel;

const profileAge: PathOf<PathExample> = ['profile', 'age'];
const rowCount: PathOf<PathExample> = ['rows', 0, 'count'];
const opaqueDate: PathOf<PathExample> = ['createdAt'];
void profileAge;
void rowCount;
void opaqueDate;

// @ts-expect-error -- Date instances are opaque leaves.
const dateMethod: PathOf<PathExample> = ['createdAt', 'getTime'];
void dateMethod;

// @ts-expect-error -- arrays use numeric segments.
const stringArrayIndex: PathOf<PathExample> = ['rows', '0', 'count'];
void stringArrayIndex;

// @ts-expect-error -- root arrays require an explicit collection API.
const rootArrayPath: PathOf<readonly PathExample[]> = [0];
void rootArrayPath;

type OptionalAge = PathValue<PathExample, readonly ['profile', 'age']>;
const optionalAge: OptionalAge = undefined;
const presentAge: OptionalAge = '42';
void [optionalAge, presentAge];

type SparseCount = PathValue<PathExample, readonly ['rows', number, 'count']>;
const sparseCount: SparseCount = undefined;
void [sparseCount];

const eightSegments: PathOf<DeepPathExample> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
void eightSegments;

// @ts-expect-error -- strict paths stop at the shared eight-segment budget.
const nineSegments: PathOf<DeepPathExample> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
void nineSegments;

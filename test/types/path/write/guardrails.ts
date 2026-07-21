import type { ReplaceAtPath } from 'wandofmagic';

import type { DeepPathExample } from '../model.js';

type NineSegmentPath = readonly ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

// @ts-expect-error -- path mutation utilities enforce the same eight-segment budget.
type TooDeepReplacement = ReplaceAtPath<DeepPathExample, NineSegmentPath, number>;
declare const tooDeepReplacement: TooDeepReplacement;
void tooDeepReplacement;

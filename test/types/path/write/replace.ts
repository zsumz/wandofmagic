import type { ReplaceAtPath } from 'wandofmagic';

import type { PathExample } from '../model.js';

type Replaced = ReplaceAtPath<PathExample, readonly ['profile', 'age'], number>;
declare const replaced: Replaced;
const readonlyProfile: { readonly age?: number; readonly name: string } | undefined =
    replaced.profile;
void readonlyProfile;

type ReplacedArray = ReplaceAtPath<PathExample, readonly ['rows', number, 'count'], number>;
declare const replacedArray: ReplacedArray;
const firstCount: string | number | undefined = replacedArray.rows[0]?.count;
void firstCount;

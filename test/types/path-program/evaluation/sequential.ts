import type { AddAtPath, OmitAtPath, ReplaceAtPath, RequireAtPath } from 'wandofmagic';

import type { Model } from './model.js';

type Sequential1 = RequireAtPath<Model, readonly ['optional', 'value'], number>;
type Sequential2 = AddAtPath<Sequential1, readonly ['optional', 'extra'], 'added'>;
type Sequential3 = AddAtPath<Sequential2, readonly ['optional', 'rows', 0, 'selected'], true>;
type Sequential4 = OmitAtPath<Sequential3, readonly ['optional', 'keep']>;
type Sequential5 = ReplaceAtPath<Sequential4, readonly ['stable', 'value'], boolean>;
type Sequential6 = OmitAtPath<Sequential5, readonly ['removable']>;

export type SequentialOutput = AddAtPath<
    Sequential6,
    readonly ['metadata', 'source'],
    'shopify'
>;

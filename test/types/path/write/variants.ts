import type { RequireAtPath } from 'wandofmagic';

import type { PathVariant } from '../model.js';

type RequiredVariant = RequireAtPath<PathVariant, readonly ['common', 'value'], number>;
type ExpectedVariant =
    | { common: { side: 'left'; value: number } }
    | { common: { side: 'right'; value: number } };
declare const requiredVariant: RequiredVariant;
declare const expectedVariant: ExpectedVariant;
const requiredVariantContract: ExpectedVariant = requiredVariant;
const expectedVariantContract: RequiredVariant = expectedVariant;
void [requiredVariantContract, expectedVariantContract];

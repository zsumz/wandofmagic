import type { OmitAtPath } from 'wandofmagic';
import type { PathExample } from './model.js';

type WithoutAge = OmitAtPath<PathExample, readonly ['profile', 'age']>;
declare const withoutAge: WithoutAge;
const profileWithoutAge: { readonly name: string } | undefined = withoutAge.profile;
void profileWithoutAge;

type WithoutRowCount = OmitAtPath<PathExample, readonly ['rows', 0, 'count']>;
declare const withoutRowCount: WithoutRowCount;
const maybeCountRow = withoutRowCount.rows[0];
if (maybeCountRow !== undefined && 'count' in maybeCountRow) {
    const retainedCount: string = maybeCountRow.count;
    void retainedCount;
}

type WithoutRows = OmitAtPath<PathExample, readonly ['rows']>;
declare const withoutRows: WithoutRows;
// @ts-expect-error -- omitting a top-level field removes it from the output model.
void withoutRows.rows;

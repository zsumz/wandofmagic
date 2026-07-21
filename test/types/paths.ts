import type {
    AddAtPath,
    OmitAtPath,
    PathOf,
    PathValue,
    ReplaceAtPath,
    RequireAtPath,
} from 'wandofmagic';

interface Example {
    readonly createdAt: Date;
    readonly profile?: {
        readonly age?: string;
        readonly name: string;
    };
    readonly rows: Array<{
        readonly count: string;
        readonly label: string;
    }>;
}

declare const validTopLevel: PathOf<Example>;
const acceptedTopLevel: PathOf<Example> = validTopLevel;
void acceptedTopLevel;

const profileAge: PathOf<Example> = ['profile', 'age'];
const rowCount: PathOf<Example> = ['rows', 0, 'count'];
const opaqueDate: PathOf<Example> = ['createdAt'];
void profileAge;
void rowCount;
void opaqueDate;

// @ts-expect-error -- Date instances are opaque leaves.
const dateMethod: PathOf<Example> = ['createdAt', 'getTime'];
void dateMethod;

// @ts-expect-error -- arrays use numeric segments.
const stringArrayIndex: PathOf<Example> = ['rows', '0', 'count'];
void stringArrayIndex;

// @ts-expect-error -- root arrays require an explicit collection API.
const rootArrayPath: PathOf<readonly Example[]> = [0];
void rootArrayPath;

type OptionalAge = PathValue<Example, readonly ['profile', 'age']>;
const optionalAge: OptionalAge = undefined;
const presentAge: OptionalAge = '42';
void [optionalAge, presentAge];

type SparseCount = PathValue<Example, readonly ['rows', number, 'count']>;
const sparseCount: SparseCount = undefined;
void [sparseCount];

type Replaced = ReplaceAtPath<Example, readonly ['profile', 'age'], number>;
declare const replaced: Replaced;
const readonlyProfile: { readonly age?: number; readonly name: string } | undefined =
    replaced.profile;
void readonlyProfile;

type ReplacedArray = ReplaceAtPath<Example, readonly ['rows', number, 'count'], number>;
declare const replacedArray: ReplacedArray;
const firstCount: string | number | undefined = replacedArray.rows[0]?.count;
void firstCount;

type RequiredAge = RequireAtPath<Example, readonly ['profile', 'age'], number>;
declare const requiredAge: RequiredAge;
const presentProfile: { readonly age: number; readonly name: string } = requiredAge.profile;
const presentProfileAge: number = requiredAge.profile.age;
void [presentProfile, presentProfileAge];

type AddedMetadata = AddAtPath<
    Example,
    readonly ['metadata', 'source'],
    'shopify'
>;
declare const addedMetadata: AddedMetadata;
const metadataSource: 'shopify' = addedMetadata.metadata.source;
void metadataSource;

type AddedOptionalParent = AddAtPath<
    Example,
    readonly ['profile', 'locale'],
    'en'
>;
declare const addedOptionalParent: AddedOptionalParent;
const addedLocale: 'en' = addedOptionalParent.profile.locale;
void addedLocale;

type AddedArrayField = AddAtPath<Example, readonly ['rows', 0, 'selected'], true>;
declare const addedArrayField: AddedArrayField;
const maybeSelectedRow = addedArrayField.rows[0];
if (maybeSelectedRow !== undefined && 'selected' in maybeSelectedRow) {
    const selected: true = maybeSelectedRow.selected;
    void selected;
}

type WithoutAge = OmitAtPath<Example, readonly ['profile', 'age']>;
declare const withoutAge: WithoutAge;
const profileWithoutAge: { readonly name: string } | undefined = withoutAge.profile;
void profileWithoutAge;

type WithoutRowCount = OmitAtPath<Example, readonly ['rows', 0, 'count']>;
declare const withoutRowCount: WithoutRowCount;
const maybeCountRow = withoutRowCount.rows[0];
if (maybeCountRow !== undefined && 'count' in maybeCountRow) {
    const retainedCount: string = maybeCountRow.count;
    void retainedCount;
}

type WithoutRows = OmitAtPath<Example, readonly ['rows']>;
declare const withoutRows: WithoutRows;
// @ts-expect-error -- omitting a top-level field removes it from the output model.
void withoutRows.rows;

type Variant =
    | { common?: { side: 'left'; value?: string } }
    | { common: { side: 'right'; value: string } };

type RequiredVariant = RequireAtPath<Variant, readonly ['common', 'value'], number>;
type ExpectedVariant =
    | { common: { side: 'left'; value: number } }
    | { common: { side: 'right'; value: number } };
declare const requiredVariant: RequiredVariant;
declare const expectedVariant: ExpectedVariant;
const requiredVariantContract: ExpectedVariant = requiredVariant;
const expectedVariantContract: RequiredVariant = expectedVariant;
void [requiredVariantContract, expectedVariantContract];

interface Deep {
    a: { b: { c: { d: { e: { f: { g: { h: { i: string } } } } } } } };
}

const eightSegments: PathOf<Deep> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
void eightSegments;

// @ts-expect-error -- strict paths stop at the shared eight-segment budget.
const nineSegments: PathOf<Deep> = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
void nineSegments;

type NineSegmentPath = readonly ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

// @ts-expect-error -- path mutation utilities enforce the same eight-segment budget.
type TooDeepReplacement = ReplaceAtPath<Deep, NineSegmentPath, number>;
declare const tooDeepReplacement: TooDeepReplacement;
void tooDeepReplacement;

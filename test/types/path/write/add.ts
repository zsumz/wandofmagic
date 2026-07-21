import type { AddAtPath } from 'wandofmagic';

import type { PathExample } from '../model.js';

type AddedMetadata = AddAtPath<
    PathExample,
    readonly ['metadata', 'source'],
    'shopify'
>;
declare const addedMetadata: AddedMetadata;
const metadataSource: 'shopify' = addedMetadata.metadata.source;
void metadataSource;

type AddedOptionalParent = AddAtPath<
    PathExample,
    readonly ['profile', 'locale'],
    'en'
>;
declare const addedOptionalParent: AddedOptionalParent;
const addedLocale: 'en' = addedOptionalParent.profile.locale;
void addedLocale;

type AddedArrayField = AddAtPath<PathExample, readonly ['rows', 0, 'selected'], true>;
declare const addedArrayField: AddedArrayField;
const maybeSelectedRow = addedArrayField.rows[0];
if (maybeSelectedRow !== undefined && 'selected' in maybeSelectedRow) {
    const selected: true = maybeSelectedRow.selected;
    void selected;
}

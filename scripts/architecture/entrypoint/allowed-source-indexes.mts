import { publicEntrypoints } from '../../shared/public-entrypoints.mts';

/** Source entrypoints allowed to compose public root facades. */
export const allowedSourceIndexes = new Set(
    publicEntrypoints.map(({ sourcePath }) => sourcePath),
);

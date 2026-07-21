import type { Path as StrictPath } from '../../core/path/path.js';

export type PathTypeOperation =
    | {
        readonly kind: 'add' | 'replace' | 'require';
        readonly path: StrictPath;
        readonly replacement: unknown;
    }
    | {
        readonly kind: 'optional-add';
        readonly path: StrictPath;
        readonly replacement: unknown;
    }
    | { readonly kind: 'optionalize'; readonly path: StrictPath }
    | { readonly kind: 'omit'; readonly path: StrictPath };

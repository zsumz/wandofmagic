import { spell } from 'wandofmagic';

import type { Model } from './model.js';

// @ts-expect-error -- dangerous top-level paths are rejected statically.
spell<Model>().set('constructor', true);

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().set(['profile', '__proto__'], true);

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], true);

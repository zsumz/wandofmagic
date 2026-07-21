import { spell } from 'wandofmagic';

import type { Model } from './model.js';

// @ts-expect-error -- flat batches retain their known-key contract.
spell<Model>().omit(['unknown']);

// Missing tuple selectors are tolerated consistently at runtime and in output types.
spell<Model>().omit([['profile', 'unknown']]);

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().omit([['profile', 'constructor']]);

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().omit([['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']]);

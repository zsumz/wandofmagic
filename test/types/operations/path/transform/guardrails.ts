import { spell } from 'wandofmagic';

import type { Model } from './model.js';

// @ts-expect-error -- deep transform paths must exist in the current type state.
spell<Model>().transform(['profile', 'missing'], String);

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().transform(['profile', 'constructor'], String);

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().transform(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], String);

// @ts-expect-error -- the core is synchronous and deep transform callbacks cannot return promises.
spell<Model>().transform(['profile', 'name'], async (name) => {
    await Promise.resolve();
    return name.length;
});

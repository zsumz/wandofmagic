import { spell } from 'wandofmagic';
import { boolean, string } from 'wandofmagic/coerce';

import type { Model } from './model.js';

// @ts-expect-error -- the selected path value must be accepted by the coercer.
spell<Model>().coerce(['profile', 'count'], boolean());

// @ts-expect-error -- deep coerce paths must exist in the current type state.
spell<Model>().coerce(['profile', 'missing'], string());

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().coerce(['profile', 'constructor'], string());

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().coerce(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], string());

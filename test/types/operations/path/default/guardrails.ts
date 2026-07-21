import { spell } from 'wandofmagic';

import type { Model } from './model.js';

// @ts-expect-error -- a fallback cannot widen an existing defined path value.
spell<Model>().default(['profile', 'name'], 'Unknown');

// @ts-expect-error -- dangerous nested path segments are rejected statically.
spell<Model>().default(['profile', 'constructor'], 'value');

// @ts-expect-error -- strict paths stop at eight segments.
spell<Model>().default(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 'value');

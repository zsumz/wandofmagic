import { spell } from 'wandofmagic';

import type { Model } from './model.js';

// @ts-expect-error -- source must resolve to a current field.
spell<Model>().move(['profile', 'missing'], ['profile', 'name']);

// @ts-expect-error -- dangerous source segments are rejected statically.
spell<Model>().move(['profile', 'constructor'], ['profile', 'name']);

// @ts-expect-error -- dangerous destination segments are rejected statically.
spell<Model>().move(['profile', 'legacy'], ['profile', '__proto__']);

// @ts-expect-error -- paths share the public eight-segment budget.
spell<Model>().move(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], ['output']);

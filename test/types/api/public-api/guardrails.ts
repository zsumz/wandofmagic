import { spell } from 'wandofmagic';

import type { WireUser } from './model.js';

// @ts-expect-error -- numeric fields cannot be trimmed.
spell<{ age?: number }>().trim(['age']);

// @ts-expect-error -- rename mappings cannot contain unknown source fields.
spell<WireUser>().rename({ missing: 'value' });

// @ts-expect-error -- derive cannot overwrite an existing field.
spell<WireUser>().derive('first_name', ['age'], ([age]) => age);

// @ts-expect-error -- derive requires at least one declared dependency.
spell<WireUser>().derive('empty', [], () => 'value');

// @ts-expect-error -- an existing numeric field cannot receive a string default.
spell<{ count?: number }>().default('count', 'zero');

const widenedRename = { first_name: 'firstName' };

// @ts-expect-error -- rename destinations must remain literal keys.
spell<WireUser>().rename(widenedRename);

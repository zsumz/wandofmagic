import { spell } from 'wandofmagic';
import { defineCoercer } from 'wandofmagic/coerce';

import type { Input } from './model.js';

const numericOnly = defineCoercer<number, number>({
    name: 'numeric-only',
    run: (value) =>
        typeof value === 'number'
            ? { ok: true, value }
            : { message: 'Expected a number.', ok: false },
});

// @ts-expect-error -- the id field is not compatible with a number-only coercer.
spell<Input>().coerce('id', numericOnly);

// @ts-expect-error -- unknown is not a valid state fallback.
spell<Input>().default('state', 'unknown');

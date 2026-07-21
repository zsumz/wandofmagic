import { type Spell, spell } from 'wandofmagic';

import type { Input } from './model.js';

declare const dynamicKey: string;

// @ts-expect-error -- strict field creation requires a literal key.
spell<Input>().default(dynamicKey, 'value');

// @ts-expect-error -- strict derived-field creation requires a literal key.
spell<Input>().derive(dynamicKey, ['id'], ([id]) => id);

const safeKey = 'locale' as const;

interface WithLocale {
    readonly id: string;
    locale: 'en';
    nickname?: string;
    retries?: string;
    state?: 'active' | 'inactive' | undefined;
}

const withLocaleContract: Spell<Input, WithLocale> = spell<Input>()
    .default(safeKey, 'en' as const)
    .build();
void withLocaleContract;

// @ts-expect-error -- __proto__ is always rejected.
spell<Input>().default('__proto__', 'value');

// @ts-expect-error -- constructor is always rejected.
spell<Input>().derive('constructor', ['id'], ([id]) => id);

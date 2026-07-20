import { type Spell, spell } from 'wandofmagic';
import { defineCoercer, number } from 'wandofmagic/coerce';

interface Input {
    readonly id: string;
    nickname?: string;
    retries?: string;
    state?: 'active' | 'inactive' | undefined;
}

const renamed = spell<Input>()
    .rename({ id: 'userId', nickname: 'displayName' })
    .coerce('retries', number({ integer: true }), { missing: 'skip' })
    .default('state', 'active' as const)
    .build();

interface Output {
    displayName?: string;
    retries?: number;
    state: 'active' | 'inactive';
    readonly userId: string;
}

const spellContract: Spell<Input, Output> = renamed;
void spellContract;

const output: Output = renamed.run({ id: 'user-1' });
void output;

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

// @ts-expect-error -- prototype is always rejected as a destination key.
spell<Input>().rename({ id: 'prototype' });

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

interface GuaranteedCollision {
    source: string;
    target: string;
}

// @ts-expect-error -- both fields are required, so this rename would always collide.
spell<GuaranteedCollision>().rename({ source: 'target' });

// Atomic swaps move both required destinations away and remain valid.
spell<GuaranteedCollision>().rename({ source: 'target', target: 'source' });

// Optional destinations can be absent at runtime, so they remain runtime-validated.
spell<{ source: string; target?: string }>().rename({ source: 'target' });

import { spell } from 'wandofmagic';

import type { Input } from './model.js';

// @ts-expect-error -- prototype is always rejected as a destination key.
spell<Input>().rename({ id: 'prototype' });

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

import { type Spell, wand } from 'wandofmagic';

interface WandValue {
    count: number;
    value: string;
}

const reusable = wand({ count: 1, value: 'first' }).build();
const reusableContract: Spell<WandValue, WandValue> = reusable;
void reusableContract;

const reusableOutput: WandValue = reusable.run({ count: 2, value: 'second' });
void reusableOutput;

interface StrictMode {
    readonly mode: 'strict';
}

const explicitLiteral = wand({ mode: 'strict' } as const).build();
const literalContract: Spell<StrictMode, StrictMode> = explicitLiteral;
void literalContract;

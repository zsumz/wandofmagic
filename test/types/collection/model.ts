import { collection, type InferInput, type InferOutput, spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';

interface WireItem {
    count: string;
    label: string;
}

const item = spell<WireItem>()
    .coerce('count', number({ integer: true }))
    .build();
const items = collection(item);

declare const input: InferInput<typeof items>;
const readonlyInput: readonly WireItem[] = input;
void readonlyInput;

declare const output: InferOutput<typeof items>;
const typedOutput: Array<{ count: number; label: string }> = output;
void typedOutput;

items.run([{ count: '7', label: 'seven' }]);

// @ts-expect-error -- root collections require a reusable item spell.
collection({});

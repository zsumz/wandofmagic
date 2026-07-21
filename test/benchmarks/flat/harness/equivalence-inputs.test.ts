import { describe, expect, it } from 'vitest';
import { createEquivalenceInputs } from '../../../../scripts/benchmarks/flat/harness/equivalence-inputs.mts';
import { createCorpus } from '../../../../scripts/benchmarks/flat/scenario/corpus.mts';

describe('flat benchmark equivalence inputs', () => {
    it('combines representative corpus records with adversarial inputs', () => {
        const corpus = createCorpus(10, 20);
        const inputs = createEquivalenceInputs(corpus);

        expect(inputs).toHaveLength(24);
        expect(inputs.slice(0, 16)).toEqual(corpus.slice(0, 16));
        expect(inputs[16]).toMatchObject({ firstName: 'existing' });
        expect(inputs[17]).toMatchObject({ age: 'invalid' });
        expect(inputs[18]).not.toHaveProperty('age');
        expect(inputs[19]).toMatchObject({ email: 7 });
        expect(inputs[20]).toMatchObject({ active: 'invalid' });
        expect(inputs[21]).toMatchObject({ displayName: 'existing' });
        expect(inputs[22]).not.toHaveProperty('first_name');
    });

    it('includes a null-prototype record with an own __proto__ field', () => {
        const inputs = createEquivalenceInputs(createCorpus(10, 1));
        const input = inputs.at(-1);

        expect(Object.getPrototypeOf(input)).toBeNull();
        expect(Object.hasOwn(input ?? {}, '__proto__')).toBe(true);
        expect(Reflect.get(input ?? {}, '__proto__')).toEqual({ marker: true });
    });

    it('rejects an empty corpus', () => {
        expect(() => createEquivalenceInputs([])).toThrow('The benchmark corpus is empty.');
    });
});

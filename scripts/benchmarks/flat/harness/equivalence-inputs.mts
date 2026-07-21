import type { BenchmarkInput } from './benchmark-types.mts';

export function createEquivalenceInputs(
    corpus: readonly BenchmarkInput[],
): readonly object[] {
    const base = corpus[0];
    if (base === undefined) {
        throw new Error('The benchmark corpus is empty.');
    }

    const missingAge = { ...base };
    const missingFirstName = { ...base };
    Reflect.deleteProperty(missingAge, 'age');
    Reflect.deleteProperty(missingFirstName, 'first_name');

    const nullPrototypeInput = Object.assign(createNullPrototypeRecord(), base);
    Object.defineProperty(nullPrototypeInput, '__proto__', {
        enumerable: true,
        value: { marker: true },
    });

    return [
        ...corpus.slice(0, 16),
        { ...base, firstName: 'existing' },
        { ...base, age: 'invalid' },
        missingAge,
        { ...base, email: 7 },
        { ...base, active: 'invalid' },
        { ...base, displayName: 'existing' },
        missingFirstName,
        nullPrototypeInput,
    ];
}

function createNullPrototypeRecord(): Record<string, unknown> {
    const record: Record<string, unknown> = {};
    Object.setPrototypeOf(record, null);
    return record;
}

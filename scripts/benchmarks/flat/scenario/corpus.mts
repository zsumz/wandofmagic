import type {
    BenchmarkCorpus,
    BenchmarkInput,
    MutableBenchmarkInput,
} from '../harness/benchmark-types.mts';

export function createCorpus(fieldCount: number, size: number): BenchmarkCorpus {
    const inputs = Array.from(
        { length: size },
        (_, index) => createInput(fieldCount, index),
    );
    const first = inputs[0];
    if (first === undefined) {
        throw new Error('The flat benchmark corpus must contain at least one record.');
    }
    return Object.freeze([first, ...inputs.slice(1)]);
}

function createInput(fieldCount: number, index: number): BenchmarkInput {
    const input: MutableBenchmarkInput = {
        age: String(20 + index % 60),
        email: `  ada-${String(index)}@example.com  `,
        first_name: ` Ada${String(index % 17)} `,
        last_name: ` Lovelace${String(index % 13)} `,
        password_hash: `not-measured-${String(index)}`,
    };

    for (let field = Object.keys(input).length; field < fieldCount; field += 1) {
        input[`extra_${String(field)}`] = field + index;
    }
    return Object.freeze(input);
}

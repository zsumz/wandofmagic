import type {
    BenchmarkMapper,
    BenchmarkOutput,
    BenchmarkRunner,
} from './benchmark-types.mts';

export function createBenchmarkRunner(
    name: string,
    run: BenchmarkMapper,
): BenchmarkRunner {
    return Object.freeze({ consume: createConsumer(run), name });
}

function createConsumer(run: BenchmarkMapper): BenchmarkRunner['consume'] {
    return (corpus, fieldCount, count) => {
        const extraKey = `extra_${String(fieldCount - 1)}`;
        let checksum = 0;
        for (let iteration = 0; iteration < count; iteration += 1) {
            // The modulo index is always inside this non-empty corpus.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = corpus[iteration % corpus.length]!;
            const output = run(input);
            checksum += consumeOutput(output, extraKey);
        }
        if (!Number.isFinite(checksum) || checksum === 0) {
            throw new Error('Benchmark output was not consumed.');
        }
    };
}

function consumeOutput(output: BenchmarkOutput, extraKey: string): number {
    return output.age
        + output.displayName.length
        + output.email.length
        + output.firstName.length
        + output.lastName.length
        + (output[extraKey] as number);
}

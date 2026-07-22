import type {
    DeepBenchmarkCorpus,
    DeepBenchmarkInput,
} from './model.mts';

export function createDeepCorpus(size: number): DeepBenchmarkCorpus {
    if (!Number.isSafeInteger(size) || size < 1) {
        throw new RangeError('Deep benchmark corpus size must be a positive integer.');
    }
    return Array.from({ length: size }, (_, index) => createInput(index)) as
        unknown as DeepBenchmarkCorpus;
}

export function createInvalidDeepInput(): DeepBenchmarkInput {
    return createInput(0, 'invalid');
}

function createInput(index: number, age = String(20 + index % 60)): DeepBenchmarkInput {
    return {
        audit: { traceId: `trace-${String(index)}` },
        metadata: {},
        profile: {
            active: index % 2 === 0 ? 'true' : 'false',
            age,
            contact: { legacyEmail: ` USER${String(index)}@EXAMPLE.COM ` },
            first: ` First${String(index)} `,
            last: ` Last${String(index)} `,
            secret: `private-${String(index)}`,
        },
    };
}

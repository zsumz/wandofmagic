export interface MutableBenchmarkInput extends Record<string, unknown> {
    age: string;
    email: string;
    first_name: string;
    last_name: string;
    password_hash: string;
}

export type BenchmarkInput = Readonly<MutableBenchmarkInput>;
export type BenchmarkCorpus = readonly [BenchmarkInput, ...BenchmarkInput[]];

export interface BenchmarkOutput extends Record<string, unknown> {
    active: boolean;
    age: number;
    displayName: string;
    email: string;
    firstName: string;
    lastName: string;
}

export type BenchmarkMapper = (input: BenchmarkInput) => BenchmarkOutput;

export interface BenchmarkRunner {
    readonly consume: (
        corpus: BenchmarkCorpus,
        fieldCount: number,
        count: number,
    ) => void;
    readonly name: string;
}

export interface WorkerMeasurement {
    readonly fieldCount: number;
    readonly opsPerSecond: number;
}

export interface WorkerResult {
    readonly name: string;
    readonly results: readonly WorkerMeasurement[];
}

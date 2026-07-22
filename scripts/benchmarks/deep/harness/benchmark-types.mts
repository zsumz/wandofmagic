import type {
    DeepBenchmarkCorpus,
    DeepBenchmarkMapper,
} from '../scenario/model.mts';

export interface DeepBenchmarkRunner {
    readonly consume: (corpus: DeepBenchmarkCorpus, iterations: number) => void;
    readonly name: string;
    readonly run: DeepBenchmarkMapper;
}

export interface DeepWorkerResult {
    readonly name: string;
    readonly opsPerSecond: number;
}

import type { TypeBenchmarkConfig } from '../../harness/type-benchmark-config.mts';

export function builderPathSource(path: string): string {
    return path.replace(/^readonly /u, '');
}

export function operationDepth(index: number, config: TypeBenchmarkConfig): number {
    return config.selectedDepth ?? index % 8 + 1;
}

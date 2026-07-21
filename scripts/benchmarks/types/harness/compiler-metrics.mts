export interface TypeBenchmarkMeasurement {
    readonly checkMilliseconds: number;
    readonly instantiations: number;
    readonly memoryKilobytes: number;
    readonly operations: number;
    readonly types: number;
    readonly wallMilliseconds: number;
}

export function readCompilerMetrics(
    output: string,
    operations: number,
    wallMilliseconds: number,
): TypeBenchmarkMeasurement {
    return {
        checkMilliseconds: parseSeconds(output, 'Check time') * 1_000,
        instantiations: parseInteger(output, 'Instantiations'),
        memoryKilobytes: parseKilobytes(output, 'Memory used'),
        operations,
        types: parseInteger(output, 'Types'),
        wallMilliseconds: Math.round(wallMilliseconds),
    };
}

function parseInteger(output: string, label: string): number {
    return Number.parseInt(readMetric(output, label), 10);
}

function parseKilobytes(output: string, label: string): number {
    return Number.parseInt(readMetric(output, label).replace(/K$/u, ''), 10);
}

function parseSeconds(output: string, label: string): number {
    return Number.parseFloat(readMetric(output, label).replace(/s$/u, ''));
}

function readMetric(output: string, label: string): string {
    const prefix = `${label}:`;
    const line = output.split(/\r?\n/u).find((candidate) => candidate.startsWith(prefix));
    if (line === undefined) {
        throw new Error(`TypeScript did not report the ${label} metric.`);
    }
    return line.slice(prefix.length).trim();
}

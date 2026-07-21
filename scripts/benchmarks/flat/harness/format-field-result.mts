import type { FlatBenchmarkConfig } from './flat-benchmark-config.mts';
import { scaleWarmup, scaleWork } from './flat-benchmark-config.mts';

export interface NamedMeasurement {
    readonly name: string;
    readonly opsPerSecond: number;
}

export function formatFieldResult(
    fieldCount: number,
    measurements: readonly NamedMeasurement[],
    config: FlatBenchmarkConfig,
): Readonly<Record<string, unknown>> {
    const happyPath = Math.max(
        findMeasurement(measurements, 'handwritten-for-in-happy').opsPerSecond,
        findMeasurement(measurements, 'handwritten-object-keys-happy').opsPerSecond,
    );
    const spread = findMeasurement(
        measurements,
        'handwritten-spread-historical',
    ).opsPerSecond;
    const equivalent = findMeasurement(
        measurements,
        'handwritten-equivalent',
    ).opsPerSecond;

    return {
        fieldCount,
        iterations: scaleWork(config.baseIterations, fieldCount),
        measurements: measurements.map(({ name, opsPerSecond }) => ({
            name,
            nanosecondsPerRecord: Math.round(1_000_000_000 / opsPerSecond),
            opsPerSecond: Math.round(opsPerSecond),
            relativeToEquivalent: Number((opsPerSecond / equivalent).toFixed(3)),
            relativeToHappyPathCeiling: Number((opsPerSecond / happyPath).toFixed(3)),
            relativeToHistoricalSpread: Number((opsPerSecond / spread).toFixed(3)),
        })),
        warmupIterations: scaleWarmup(config.warmupBase, fieldCount),
    };
}

function findMeasurement(
    measurements: readonly NamedMeasurement[],
    name: string,
): NamedMeasurement {
    const measurement = measurements.find((candidate) => candidate.name === name);
    if (measurement === undefined) {
        throw new Error(`The ${name} benchmark baseline is missing.`);
    }
    return measurement;
}

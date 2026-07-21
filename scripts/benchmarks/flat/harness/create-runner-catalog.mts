import type {
    BenchmarkMapper,
    BenchmarkRunner,
} from './benchmark-types.mts';
import { createBenchmarkRunner } from './benchmark-consumer.mts';
import type { GeneratedMapper } from '../mappers/generated-mapper.mts';
import { runHandwrittenEquivalent } from '../mappers/handwritten/equivalent-mapper.mts';
import { runHandwrittenForInHappy } from '../mappers/handwritten/for-in-happy.mts';
import { runHandwrittenObjectKeysHappy } from '../mappers/handwritten/object-keys-happy.mts';
import { runHandwrittenSpreadHistorical } from '../mappers/handwritten/spread-historical.mts';
import {
    runWandofmagicChecked,
    runWandofmagicCheckedCollect,
    runWandofmagicCheckedDiscard,
    runWandofmagicTrusted,
} from '../mappers/wandofmagic-mappers.mts';

export function createRunnerCatalog(
    generatedMapper: GeneratedMapper | undefined,
): readonly BenchmarkRunner[] {
    return Object.freeze([
        createBenchmarkRunner('handwritten-for-in-happy', runHandwrittenForInHappy),
        createBenchmarkRunner('handwritten-object-keys-happy', runHandwrittenObjectKeysHappy),
        createBenchmarkRunner('handwritten-equivalent', runHandwrittenEquivalent),
        createBenchmarkRunner('handwritten-spread-historical', runHandwrittenSpreadHistorical),
        createBenchmarkRunner('wandofmagic-checked-collect', runWandofmagicCheckedCollect),
        createBenchmarkRunner('wandofmagic-checked-discard', runWandofmagicCheckedDiscard),
        createBenchmarkRunner('wandofmagic-checked-run', runWandofmagicChecked),
        createBenchmarkRunner('wandofmagic-trusted-run', runWandofmagicTrusted),
        createBenchmarkRunner('wandofmagic-generated', requireGeneratedMapper(generatedMapper)),
    ]);
}

function requireGeneratedMapper(mapper: GeneratedMapper | undefined): BenchmarkMapper {
    return (input) => {
        if (mapper === undefined) {
            throw new Error('The generated benchmark mapper was not initialized.');
        }
        return mapper(input);
    };
}

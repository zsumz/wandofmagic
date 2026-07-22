import { emitTrustedMapperModule } from '../../../../dist/compiler.js';
import { WandError } from '../../../../dist/index.js';
import { materializeGeneratedMapper } from '../../shared/materialize-generated-mapper.mts';
import type { BenchmarkInput, BenchmarkOutput } from '../harness/benchmark-types.mts';
import { normalize } from '../scenario/wandofmagic-spell.mts';

export type GeneratedMapper = (input: BenchmarkInput) => BenchmarkOutput;

export async function createGeneratedMapper(): Promise<GeneratedMapper> {
    const artifact = emitTrustedMapperModule(normalize);
    const mapper = await materializeGeneratedMapper(artifact, WandError);
    if (typeof mapper !== 'function') {
        throw new TypeError('The generated flat benchmark mapper is not callable.');
    }
    return mapper as GeneratedMapper;
}

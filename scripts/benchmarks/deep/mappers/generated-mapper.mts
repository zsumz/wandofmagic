import { emitTrustedMapperModule } from '../../../../dist/compiler.js';
import { WandError } from '../../../../dist/index.js';
import { materializeGeneratedMapper } from '../../shared/materialize-generated-mapper.mts';
import { deepSpell } from '../scenario/deep-spell.mts';
import type { DeepBenchmarkMapper } from '../scenario/model.mts';

export async function createDeepGeneratedMapper(): Promise<DeepBenchmarkMapper> {
    const artifact = emitTrustedMapperModule(deepSpell);
    const mapper = await materializeGeneratedMapper(artifact, WandError);
    if (typeof mapper !== 'function') {
        throw new TypeError('The generated deep benchmark mapper is not callable.');
    }
    return mapper as DeepBenchmarkMapper;
}

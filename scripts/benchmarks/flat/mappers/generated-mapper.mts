import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { emitTrustedMapperModule } from '../../../../dist/compiler.js';
import { WandError } from '../../../../dist/index.js';
import type { BenchmarkInput, BenchmarkOutput } from '../harness/benchmark-types.mts';
import { normalize } from '../scenario/wandofmagic-spell.mts';

export type GeneratedMapper = (input: BenchmarkInput) => BenchmarkOutput;

export async function createGeneratedMapper(): Promise<GeneratedMapper> {
    const artifact = emitTrustedMapperModule(normalize);
    const directory = await mkdtemp(join(tmpdir(), 'wandofmagic-benchmark-'));
    const modulePath = join(directory, 'generated.mjs');
    try {
        await writeFile(modulePath, artifact.source, 'utf8');
        const generatedModule: unknown = await import(pathToFileURL(modulePath).href);
        const factory = readGeneratedFactory(generatedModule);
        return factory(artifact.bindings, WandError) as GeneratedMapper;
    } finally {
        await rm(directory, { force: true, recursive: true });
    }
}

function readGeneratedFactory(
    generatedModule: unknown,
): (bindings: readonly unknown[], errorType: typeof WandError) => unknown {
    if (
        typeof generatedModule !== 'object'
        || generatedModule === null
        || !('createTrustedMapper' in generatedModule)
        || typeof generatedModule.createTrustedMapper !== 'function'
    ) {
        throw new TypeError('The generated benchmark module is invalid.');
    }
    const factory = generatedModule.createTrustedMapper;
    return (bindings, errorType) => {
        const mapper: unknown = Reflect.apply(factory, undefined, [bindings, errorType]);
        return mapper;
    };
}

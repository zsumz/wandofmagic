import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

interface GeneratedArtifact {
    readonly bindings: readonly unknown[];
    readonly source: string;
}

export async function materializeGeneratedMapper(
    artifact: GeneratedArtifact,
    errorType: unknown,
): Promise<unknown> {
    const directory = await mkdtemp(join(tmpdir(), 'wandofmagic-benchmark-'));
    const modulePath = join(directory, 'generated.mjs');
    try {
        await writeFile(modulePath, artifact.source, 'utf8');
        const generatedModule: unknown = await import(pathToFileURL(modulePath).href);
        const factory = readGeneratedFactory(generatedModule);
        return factory(artifact.bindings, errorType);
    } finally {
        await rm(directory, { force: true, recursive: true });
    }
}

function readGeneratedFactory(
    generatedModule: unknown,
): (bindings: readonly unknown[], errorType: unknown) => unknown {
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

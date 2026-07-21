import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { WandError } from '../../../src/core/execution/wand-error.js';

interface GeneratedModule {
    createTrustedMapper(
        bindings: readonly unknown[],
        ErrorConstructor: typeof WandError,
    ): (input: object) => object;
}

export async function materializeGeneratedMapper(
    source: string,
    bindings: readonly unknown[],
): Promise<(input: object) => object> {
    const directory = await mkdtemp(join(tmpdir(), 'wandofmagic-compiler-'));
    const modulePath = join(directory, 'generated.mjs');
    try {
        await writeFile(modulePath, source, 'utf8');
        const imported: unknown = await import(pathToFileURL(modulePath).href);
        if (!isGeneratedModule(imported)) {
            throw new TypeError('The emitted module did not expose createTrustedMapper().');
        }
        return imported.createTrustedMapper(bindings, WandError);
    } finally {
        await rm(directory, { force: true, recursive: true });
    }
}

function isGeneratedModule(value: unknown): value is GeneratedModule {
    return typeof value === 'object'
        && value !== null
        && 'createTrustedMapper' in value
        && typeof value.createTrustedMapper === 'function';
}

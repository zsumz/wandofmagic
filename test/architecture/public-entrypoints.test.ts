import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
    inspectPublicEntrypointContract,
    inspectPublicEntrypointValues,
} from '../../scripts/architecture/entrypoint/public-entrypoint-contract.mts';

const root = fileURLToPath(new URL('../../', import.meta.url));

describe('public entrypoint contract', () => {
    it('keeps build, package, and type entrypoints aligned', async () => {
        await expect(inspectPublicEntrypointContract(root)).resolves.toEqual([]);
    });

    it('reports package export drift', async () => {
        const [packageJson, typeConfig] = await readContractValues();
        const mismatchedPackage = { ...asRecord(packageJson), exports: {} };

        expect(inspectPublicEntrypointValues(mismatchedPackage, typeConfig)).toContain(
            'package.json exports do not match the public entrypoint manifest.',
        );
    });

    it('reports legacy type-resolution drift', async () => {
        const [packageJson, typeConfig] = await readContractValues();
        const mismatchedPackage = { ...asRecord(packageJson), typesVersions: {} };

        expect(inspectPublicEntrypointValues(mismatchedPackage, typeConfig)).toContain(
            'package.json typesVersions do not match the public entrypoint manifest.',
        );
    });

    it('reports root entrypoint drift', async () => {
        const [packageJson, typeConfig] = await readContractValues();
        const mismatchedPackage = { ...asRecord(packageJson), main: './dist/wrong.cjs' };

        expect(inspectPublicEntrypointValues(mismatchedPackage, typeConfig)).toContain(
            'package.json root entrypoints do not match the public entrypoint manifest.',
        );
    });

    it('reports source type-path drift', async () => {
        const [packageJson, typeConfig] = await readContractValues();
        const compilerOptions = asRecord(asRecord(typeConfig)['compilerOptions']);
        const mismatchedTypeConfig = {
            ...asRecord(typeConfig),
            compilerOptions: { ...compilerOptions, paths: {} },
        };

        expect(inspectPublicEntrypointValues(packageJson, mismatchedTypeConfig)).toContain(
            'tsconfig.types.json paths do not match the public entrypoint manifest.',
        );
    });
});

async function readContractValues(): Promise<readonly [unknown, unknown]> {
    return Promise.all([
        readJson('package.json'),
        readJson('tsconfig.types.json'),
    ]);
}

async function readJson(relative: string): Promise<unknown> {
    return JSON.parse(await readFile(new URL(`../../${relative}`, import.meta.url), 'utf8')) as unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== 'object' || value === null) {
        throw new TypeError('Expected an object fixture.');
    }
    return value as Record<string, unknown>;
}

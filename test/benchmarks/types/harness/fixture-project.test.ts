import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture } from '../../../../scripts/benchmarks/types/fixture/create-fixture.mts';
import {
    createFixtureProjectConfig,
} from '../../../../scripts/benchmarks/types/harness/fixture-project-config.mts';
import {
    prepareFixture,
} from '../../../../scripts/benchmarks/types/harness/prepare-fixture.mts';
import {
    readTypeBenchmarkConfig,
} from '../../../../scripts/benchmarks/types/harness/type-benchmark-config.mts';

const temporaryRoots: string[] = [];

afterEach(async () => {
    await Promise.all(temporaryRoots.splice(0).map(async (root) => {
        await rm(root, { force: true, recursive: true });
    }));
});

describe('type benchmark fixture project', () => {
    const config = readTypeBenchmarkConfig({});

    it('maps public source entrypoints into an isolated compiler project', () => {
        const fixturePath = '/temporary/10/fixture.ts';

        expect(createFixtureProjectConfig(fixturePath, config)).toEqual({
            extends: join(config.root, 'tsconfig.build.json'),
            compilerOptions: {
                baseUrl: config.root,
                noEmit: true,
                paths: {
                    wandofmagic: ['./src/index.ts'],
                    'wandofmagic/coerce': ['./src/coerce/index.ts'],
                    'wandofmagic/internal/path-program': ['./src/types/path-program.ts'],
                },
                rootDir: config.root,
                types: [],
            },
            files: [fixturePath],
        });
    });

    it('writes fixture source and compiler configuration together', async () => {
        const temporaryRoot = await mkdtemp(join(tmpdir(), 'wandofmagic-type-fixture-'));
        temporaryRoots.push(temporaryRoot);
        await prepareFixture(10, temporaryRoot, config);
        const fixturePath = join(temporaryRoot, '10', 'fixture.ts');
        const configPath = join(temporaryRoot, '10', 'tsconfig.json');

        await expect(readFile(fixturePath, 'utf8'))
            .resolves.toBe(createFixture(10, config));
        await expect(readFile(configPath, 'utf8')).resolves.toBe(
            `${JSON.stringify(createFixtureProjectConfig(fixturePath, config), null, 2)}\n`,
        );
    });
});

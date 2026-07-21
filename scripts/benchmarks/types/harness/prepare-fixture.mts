import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createFixture } from '../fixture/create-fixture.mts';
import { createFixtureProjectConfig } from './fixture-project-config.mts';
import type { TypeBenchmarkConfig } from './type-benchmark-config.mts';

export async function prepareFixture(
    operations: number,
    temporaryRoot: string,
    config: TypeBenchmarkConfig,
): Promise<void> {
    const fixtureRoot = join(temporaryRoot, String(operations));
    const fixturePath = join(fixtureRoot, 'fixture.ts');
    const configPath = join(fixtureRoot, 'tsconfig.json');
    const fixtureConfig = createFixtureProjectConfig(fixturePath, config);
    await mkdir(fixtureRoot, { recursive: true });
    await Promise.all([
        writeFile(fixturePath, createFixture(operations, config)),
        writeFile(configPath, `${JSON.stringify(fixtureConfig, null, 2)}\n`),
    ]);
}

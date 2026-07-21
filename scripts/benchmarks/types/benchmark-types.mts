import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import ts from 'typescript';
import { compileFixture } from './harness/compile-fixture.mts';
import { prepareFixture } from './harness/prepare-fixture.mts';
import { readTypeBenchmarkConfig } from './harness/type-benchmark-config.mts';

const config = readTypeBenchmarkConfig();
const cacheRoot = join(config.root, '.cache');
await mkdir(cacheRoot, { recursive: true });
const temporaryRoot = await mkdtemp(join(cacheRoot, 'type-benchmark-'));

try {
    await Promise.all(config.operationCounts.map(async (operations) => {
        await prepareFixture(operations, temporaryRoot, config);
    }));
    const results = config.operationCounts.map((operations) =>
        compileFixture(operations, temporaryRoot, config));
    const failures = results.filter(({ checkMilliseconds }) =>
        checkMilliseconds > config.checkBudgetMilliseconds);

    console.log(JSON.stringify({
        checkBudgetMilliseconds: config.checkBudgetMilliseconds,
        builderOperation: config.builderOperation,
        chainMode: config.chainMode,
        results,
        selectedOperation: config.selectedOperation ?? 'mixed',
        selectedDepth: config.selectedDepth ?? 'mixed',
        sequentialChainLimit: config.sequentialChainLimit,
        typescript: ts.version,
    }, null, 2));

    if (failures.length > 0) {
        const counts = failures.map(({ operations }) => String(operations)).join(', ');
        throw new Error(`Type-check budget exceeded for operation counts: ${counts}.`);
    }
} finally {
    await rm(temporaryRoot, { force: true, recursive: true });
}

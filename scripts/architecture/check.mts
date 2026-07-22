import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkModule } from './module/check-module.mts';
import {
    collectJavaScriptModuleFiles,
    collectModuleFiles,
    collectRootJavaScriptModuleFiles,
    relativePath,
} from './module/module-files.mts';
import { inspectRuntimeDependencyCycles } from './dependency/runtime-dependencies.mts';
import {
    inspectPublicEntrypointContract,
} from './entrypoint/public-entrypoint-contract.mts';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sourceRoot = path.join(root, 'src');
const testRoot = path.join(root, 'test');
const executableRoots = [path.join(root, 'scripts'), path.join(root, 'smoke')];
const inspectedRoots = [sourceRoot, testRoot, ...executableRoots];
const failures: string[] = [];

const packageJson: unknown = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
if (hasRuntimeDependencies(packageJson)) {
    failures.push('package.json: runtime dependencies require an accepted design decision.');
}
failures.push(...await inspectPublicEntrypointContract(root));

const sourceFiles = await collectModuleFiles(sourceRoot);
const nonSourceFiles = (await Promise.all(
    inspectedRoots.slice(1).map(collectModuleFiles),
)).flat();
const files = [...sourceFiles, ...nonSourceFiles];
const javascriptModules = [
    ...await collectRootJavaScriptModuleFiles(root),
    ...(await Promise.all(inspectedRoots.map(collectJavaScriptModuleFiles))).flat(),
];
for (const file of javascriptModules) {
    const relative = relativePath(root, file);
    failures.push(
        `${relative}: owned modules must use TypeScript, not JavaScript modules.`,
    );
}
for (const file of files) {
    const inspection = await checkModule(root, sourceRoot, file);
    failures.push(...inspection.failures);
}
failures.push(...await inspectRuntimeDependencyCycles(root, sourceRoot, sourceFiles));

if (failures.length > 0) {
    console.error('Architecture guardrails failed:\n');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exitCode = 1;
} else {
    console.log(`Architecture guardrails passed for ${String(files.length)} TypeScript modules.`);
}

function hasRuntimeDependencies(value: unknown): boolean {
    if (typeof value !== 'object' || value === null || !('dependencies' in value)) {
        return false;
    }
    const dependencies = value.dependencies;
    return typeof dependencies === 'object'
        && dependencies !== null
        && Object.keys(dependencies).length > 0;
}

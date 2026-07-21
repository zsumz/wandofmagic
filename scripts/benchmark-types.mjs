import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const cacheRoot = join(root, '.cache');
const operationCounts = [10, 25, 50, 100];
const checkBudgetMilliseconds = readPositiveInteger('WANDOFMAGIC_TYPE_BUDGET_MS', 5_000);
const sequentialChainLimit = readPositiveInteger('WANDOFMAGIC_TYPE_CHAIN_LIMIT', 100);
const selectedOperation = readOperation(process.env.WANDOFMAGIC_TYPE_OPERATION);
const selectedBuilderOperation = readBuilderOperation(process.env.WANDOFMAGIC_TYPE_BUILDER_OPERATION);
const selectedDepth = readDepth(process.env.WANDOFMAGIC_TYPE_DEPTH);
const chainMode = readChainMode(process.env.WANDOFMAGIC_TYPE_CHAIN_MODE);
const compilerPath = join(root, 'node_modules', 'typescript', 'bin', 'tsc');

await mkdir(cacheRoot, { recursive: true });
const temporaryRoot = await mkdtemp(join(cacheRoot, 'type-benchmark-'));

try {
    await Promise.all(operationCounts.map(prepareFixture));
    const results = operationCounts.map(compileFixture);
    const failures = results.filter(({ checkMilliseconds }) =>
        checkMilliseconds > checkBudgetMilliseconds);

    console.log(JSON.stringify({
        checkBudgetMilliseconds,
        builderOperation: selectedBuilderOperation,
        chainMode,
        results,
        selectedOperation: selectedOperation ?? 'mixed',
        selectedDepth: selectedDepth ?? 'mixed',
        sequentialChainLimit,
        typescript: ts.version,
    }, null, 2));

    if (failures.length > 0) {
        const counts = failures.map(({ operations }) => String(operations)).join(', ');
        throw new Error(`Type-check budget exceeded for operation counts: ${counts}.`);
    }
} finally {
    await rm(temporaryRoot, { force: true, recursive: true });
}

async function prepareFixture(operations) {
    const fixtureRoot = join(temporaryRoot, String(operations));
    const fixturePath = join(fixtureRoot, 'fixture.ts');
    const configPath = join(fixtureRoot, 'tsconfig.json');
    const config = {
        extends: join(root, 'tsconfig.build.json'),
        compilerOptions: {
            baseUrl: root,
            noEmit: true,
            paths: {
                wandofmagic: ['./src/index.ts'],
                'wandofmagic/coerce': ['./src/coerce/index.ts'],
                'wandofmagic/internal/path-program': ['./src/types/path-program.ts'],
            },
            rootDir: root,
            types: [],
        },
        files: [fixturePath],
    };
    await mkdir(fixtureRoot, { recursive: true });
    await Promise.all([
        writeFile(fixturePath, createFixture(operations)),
        writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`),
    ]);
}

function compileFixture(operations) {
    const configPath = join(temporaryRoot, String(operations), 'tsconfig.json');
    const started = performance.now();
    const result = spawnSync(process.execPath, [
        compilerPath,
        '--extendedDiagnostics',
        '--pretty',
        'false',
        '--project',
        configPath,
    ], {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
    });
    const wallMilliseconds = performance.now() - started;
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`The ${String(operations)}-operation fixture failed:\n${result.stdout}${result.stderr}`);
    }
    return {
        checkMilliseconds: parseSeconds(result.stdout, 'Check time') * 1_000,
        instantiations: parseInteger(result.stdout, 'Instantiations'),
        memoryKilobytes: parseKilobytes(result.stdout, 'Memory used'),
        operations,
        types: parseInteger(result.stdout, 'Types'),
        wallMilliseconds: Math.round(wallMilliseconds),
    };
}

function parseInteger(output, label) {
    return Number.parseInt(readMetric(output, label), 10);
}

function parseKilobytes(output, label) {
    return Number.parseInt(readMetric(output, label).replace(/K$/u, ''), 10);
}

function parseSeconds(output, label) {
    return Number.parseFloat(readMetric(output, label).replace(/s$/u, ''));
}

function readMetric(output, label) {
    const prefix = `${label}:`;
    const line = output.split(/\r?\n/u).find((candidate) => candidate.startsWith(prefix));
    if (line === undefined) {
        throw new Error(`TypeScript did not report the ${label} metric.`);
    }
    return line.slice(prefix.length).trim();
}

function createFixture(operationCount) {
    const operationUtilities = ['ReplaceAtPath', 'RequireAtPath', 'AddAtPath', 'OmitAtPath'];
    const selectedUtilities = selectedOperation === undefined
        ? operationUtilities
        : [operationUtilities[selectedOperation]];
    const importedUtilities = chainMode === 'builder'
        ? ['InferOutput', 'PathOf', ...selectedUtilities]
        : ['PathOf', ...selectedUtilities];
    const imports = importedUtilities.sort().map((name) =>
        `    ${name},`).join('\n');
    const fields = Array.from({ length: operationCount }, (_, index) =>
        `    field${String(index)}?: ${nestedField(2)};`).join('\n');
    const independent = Array.from({ length: operationCount }, (_, index) =>
        operationType('BenchmarkModel', `Independent${String(index)}`, index)).join('\n');
    const independentResults = Array.from(
        { length: operationCount },
        (_, index) => `Independent${String(index)}`,
    ).join(', ');
    const chainCount = Math.min(operationCount, sequentialChainLimit);
    const chain = Array.from({ length: chainCount }, (_, index) =>
        chainMode === 'program'
            ? programOperationType(`Step${String(index)}`, `Step${String(index + 1)}`, index)
            : operationType(`Step${String(index)}`, `Step${String(index + 1)}`, index)).join('\n');
    const chainImports = chainMode === 'program'
        ? `import type {
    AppendPathTypeOperation,
    EvaluatePathTypeOperations,
} from 'wandofmagic/internal/path-program';\n\n`
        : chainMode === 'builder'
            ? `import { spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';\n`
            : '';
    const chainInput = chainMode === 'program' ? 'readonly []' : 'BenchmarkModel';
    const chainOutput = chainMode === 'program'
        ? `EvaluatePathTypeOperations<BenchmarkModel, Step${String(chainCount)}>`
        : chainMode === 'builder'
            ? 'InferOutput<typeof chainedBuilder>'
            : `Step${String(chainCount)}`;
    const chainDefinition = chainMode === 'builder'
        ? `const chainedBuilder = spell<BenchmarkModel>()
${Array.from({ length: chainCount }, (_, index) => builderOperation(index)).join('\n')}
    .build();
const sharedTransformBuilder = spell<BenchmarkModel>()
${Array.from({ length: chainCount }, (_, index) => builderSharedTransformOperation(index, false)).join('\n')}
    .build();
const sharedSkipTransformBuilder = spell<BenchmarkModel>()
${Array.from({ length: chainCount }, (_, index) => builderSharedTransformOperation(index, true)).join('\n')}
    .build();
const sharedCoerceBuilder = spell<BenchmarkModel>()
${Array.from({ length: chainCount }, () => builderSharedCoerceOperation(false)).join('\n')}
    .build();
const sharedSkipCoerceBuilder = spell<BenchmarkModel>()
${Array.from({ length: chainCount }, () => builderSharedCoerceOperation(true)).join('\n')}
    .build();
const sharedDefaultBuilder = spell<BenchmarkModel>()
${Array.from({ length: chainCount }, () => builderSharedDefaultOperation()).join('\n')}
    .build();
const sharedOmitBuilder = spell<BenchmarkModel>()
${Array.from({ length: chainCount }, () => builderSharedOmitOperation()).join('\n')}
    .build();`
        : `type Step0 = ${chainInput};
${chain}`;
    const sharedTransformObservation = chainMode === 'builder'
        ? `type SharedTransformOutput = InferOutput<typeof sharedTransformBuilder>;
type SharedTransformKeys = keyof SharedTransformOutput;
type SharedTransformValues = SharedTransformOutput[SharedTransformKeys];
declare const sharedTransformKey: SharedTransformKeys;
declare const sharedTransformValue: SharedTransformValues;
type SharedSkipTransformOutput = InferOutput<typeof sharedSkipTransformBuilder>;
type SharedSkipTransformKeys = keyof SharedSkipTransformOutput;
type SharedSkipTransformValues = SharedSkipTransformOutput[SharedSkipTransformKeys];
declare const sharedSkipTransformKey: SharedSkipTransformKeys;
declare const sharedSkipTransformValue: SharedSkipTransformValues;
type SharedCoerceOutput = InferOutput<typeof sharedCoerceBuilder>;
type SharedCoerceKeys = keyof SharedCoerceOutput;
type SharedCoerceValues = SharedCoerceOutput[SharedCoerceKeys];
declare const sharedCoerceKey: SharedCoerceKeys;
declare const sharedCoerceValue: SharedCoerceValues;
type SharedSkipCoerceOutput = InferOutput<typeof sharedSkipCoerceBuilder>;
type SharedSkipCoerceKeys = keyof SharedSkipCoerceOutput;
type SharedSkipCoerceValues = SharedSkipCoerceOutput[SharedSkipCoerceKeys];
declare const sharedSkipCoerceKey: SharedSkipCoerceKeys;
declare const sharedSkipCoerceValue: SharedSkipCoerceValues;
type SharedDefaultOutput = InferOutput<typeof sharedDefaultBuilder>;
type SharedDefaultKeys = keyof SharedDefaultOutput;
type SharedDefaultValues = SharedDefaultOutput[SharedDefaultKeys];
declare const sharedDefaultKey: SharedDefaultKeys;
declare const sharedDefaultValue: SharedDefaultValues;
type SharedOmitOutput = InferOutput<typeof sharedOmitBuilder>;
type SharedOmitKeys = keyof SharedOmitOutput;
type SharedOmitValues = SharedOmitOutput[SharedOmitKeys];
declare const sharedOmitKey: SharedOmitKeys;
declare const sharedOmitValue: SharedOmitValues;
void sharedTransformKey;
void sharedTransformValue;
void sharedSkipTransformKey;
void sharedSkipTransformValue;
void sharedCoerceKey;
void sharedCoerceValue;
void sharedSkipCoerceKey;
void sharedSkipCoerceValue;
void sharedDefaultKey;
void sharedDefaultValue;
void sharedOmitKey;
void sharedOmitValue;`
        : '';

    return `${chainImports}import type {
${imports}
} from 'wandofmagic';

interface RecursiveNode {
    child?: RecursiveNode;
    value?: string;
}

interface BenchmarkModel {
${fields}
    recursive?: RecursiveNode;
}

${chainDefinition}
${independent}
type BenchmarkPaths = PathOf<BenchmarkModel>;
type IndependentResults = readonly [${independentResults}];
type ChainedOutput = ${chainOutput};
type ChainedKeys = keyof ChainedOutput;
type ChainedValues = ChainedOutput[ChainedKeys];
${sharedTransformObservation}
declare const chainedKey: ChainedKeys;
declare const chainedValue: ChainedValues;
declare const independentOutput: IndependentResults;
declare const path: BenchmarkPaths;
void chainedKey;
void chainedValue;
void independentOutput;
void path;
`;
}

function builderOperation(index) {
    if (selectedBuilderOperation === 'set' || selectedBuilderOperation === 'mixed' &&
        index % 6 === 0) {
        return builderSetOperation(index);
    }
    if (selectedBuilderOperation === 'default' || selectedBuilderOperation === 'mixed' &&
        index % 6 === 1) {
        return builderDefaultOperation(index);
    }
    if (selectedBuilderOperation === 'omit' || selectedBuilderOperation === 'mixed' &&
        index % 6 === 4) {
        return builderOmitOperation(index);
    }
    if (selectedBuilderOperation === 'coerce' || selectedBuilderOperation === 'mixed' &&
        index % 6 === 3) {
        return builderCoerceOperation(index);
    }
    if (selectedBuilderOperation === 'move' || selectedBuilderOperation === 'mixed' &&
        index % 6 === 5) {
        return builderMoveOperation(index);
    }
    return builderTransformOperation(index);
}

function builderMoveOperation(index) {
    const depth = selectedDepth ?? index % 8 + 1;
    const source = existingPath(index, depth).replace(/^readonly /u, '');
    const destination = movedPath(index, depth).replace(/^readonly /u, '');
    const options = index % 3 === 1
        ? `, { conflict: 'overwrite', missing: 'skip' }`
        : index % 3 === 2 ? `, { conflict: 'preserve' }` : '';
    return `    .move(${source} as const, ${destination} as const${options})`;
}

function builderSetOperation(index) {
    const depth = selectedDepth ?? index % 8 + 1;
    const path = additionPath(index, depth).replace(/^readonly /u, '');
    return `    .set(${path} as const, ${String(index)})`;
}

function builderDefaultOperation(index) {
    const depth = selectedDepth ?? index % 8 + 1;
    const path = additionPath(index, depth).replace(/^readonly /u, '');
    return `    .default(${path} as const, 'fallback${String(index)}')`;
}

function builderOmitOperation(index) {
    const depth = selectedDepth ?? index % 8 + 1;
    const path = existingPath(index, depth).replace(/^readonly /u, '');
    return `    .omit([${path} as const])`;
}

function readBuilderOperation(value) {
    if (value === undefined || value === 'mixed') {
        return 'mixed';
    }
    if (value === 'coerce' || value === 'default' || value === 'move' || value === 'omit' || value === 'set' ||
        value === 'transform') {
        return value;
    }
    throw new TypeError(
        'WANDOFMAGIC_TYPE_BUILDER_OPERATION must be coerce, default, move, omit, set, transform, or mixed.',
    );
}

function builderTransformOperation(index) {
    const depth = selectedDepth ?? index % 8 + 1;
    const path = existingPath(index, depth).replace(/^readonly /u, '');
    return `    .transform(${path} as const, (value) => String(value).length + ${String(index)})`;
}

function builderSharedTransformOperation(index, skip) {
    const path = existingPath(0, selectedDepth ?? 8).replace(/^readonly /u, '');
    const options = skip ? `, { missing: 'skip' }` : '';
    return `    .transform(${path} as const, (value) => String(value).length + ${String(index)}${options})`;
}

function builderCoerceOperation(index) {
    const depth = Math.max(2, selectedDepth ?? index % 8 + 1);
    const path = existingPath(index, depth).replace(/^readonly /u, '');
    return `    .coerce(${path} as const, number())`;
}

function builderSharedCoerceOperation(skip) {
    const path = existingPath(0, Math.max(2, selectedDepth ?? 8)).replace(/^readonly /u, '');
    const options = skip ? `, { missing: 'skip' }` : '';
    return `    .coerce(${path} as const, number()${options})`;
}

function builderSharedDefaultOperation() {
    const path = existingPath(0, selectedDepth ?? 8).replace(/^readonly /u, '');
    return `    .default(${path} as const, 'fallback')`;
}

function builderSharedOmitOperation() {
    const path = existingPath(0, selectedDepth ?? 8).replace(/^readonly /u, '');
    return `    .omit([${path} as const])`;
}

function programOperationType(input, output, index) {
    const depth = selectedDepth ?? index % 8 + 1;
    const operation = selectedOperation ?? index % 4;
    const path = operation === 2
        ? additionPath(index, depth)
        : existingPath(index, depth);
    const kind = ['replace', 'require', 'add', 'omit'][operation];
    const replacement = operation === 3 ? '' : '; readonly replacement: number';
    return `type ${output} = AppendPathTypeOperation<${input}, { readonly kind: '${kind}'; readonly path: ${path}${replacement} }>;`;
}

function operationType(input, output, index) {
    const depth = selectedDepth ?? index % 8 + 1;
    const operation = selectedOperation ?? index % 4;
    const path = operation === 2
        ? additionPath(index, depth)
        : existingPath(index, depth);
    const utility = ['ReplaceAtPath', 'RequireAtPath', 'AddAtPath', 'OmitAtPath'][operation];
    const replacement = operation === 3 ? '' : ', number';
    return `type ${output} = ${utility}<${input}, ${path}${replacement}>;`;
}

function readDepth(value) {
    if (value === undefined || value === 'mixed') {
        return undefined;
    }
    const depth = Number(value);
    if (!Number.isSafeInteger(depth) || depth < 1 || depth > 8) {
        throw new TypeError('WANDOFMAGIC_TYPE_DEPTH must be an integer from 1 through 8 or mixed.');
    }
    return depth;
}

function readOperation(value) {
    if (value === undefined || value === 'mixed') {
        return undefined;
    }
    const index = ['replace', 'require', 'add', 'omit'].indexOf(value);
    if (index === -1) {
        throw new TypeError('WANDOFMAGIC_TYPE_OPERATION must be replace, require, add, omit, or mixed.');
    }
    return index;
}

function readChainMode(value) {
    if (value === undefined || value === 'builder') {
        return 'builder';
    }
    if (value === 'materialized' || value === 'program') {
        return value;
    }
    throw new TypeError('WANDOFMAGIC_TYPE_CHAIN_MODE must be builder, program, or materialized.');
}

function nestedField(level) {
    if (level > 7) {
        return '{ retained: boolean; value?: string }';
    }
    return `{ level${String(level)}?: ${nestedField(level + 1)}; retained: boolean; value?: string }`;
}

function existingPath(index, depth) {
    return tuplePath(index, depth, 'value');
}

function additionPath(index, depth) {
    if (depth === 1) {
        return `readonly ['added${String(index)}']`;
    }
    return tuplePath(index, depth, 'added');
}

function movedPath(index, depth) {
    if (depth === 1) {
        return `readonly ['moved${String(index)}']`;
    }
    return tuplePath(index, depth, 'moved');
}

function tuplePath(index, depth, leaf) {
    const segments = [`'field${String(index)}'`];
    for (let level = 2; level < depth; level += 1) {
        segments.push(`'level${String(level)}'`);
    }
    if (depth > 1) {
        segments.push(`'${leaf}'`);
    }
    return `readonly [${segments.join(', ')}]`;
}

function readPositiveInteger(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined) {
        return fallback;
    }
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new TypeError(`${name} must be a positive integer.`);
    }
    return value;
}

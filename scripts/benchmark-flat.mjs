import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { emitTrustedMapperModule } from '../dist/compiler.js';
import { spell, WandError } from '../dist/index.js';
import { boolean, number } from '../dist/coerce.js';
import {
    deriveDisplayName,
    runHandwrittenEquivalent,
    runHandwrittenForInHappy,
    runHandwrittenObjectKeysHappy,
    runHandwrittenSpreadHistorical,
} from './flat-benchmark-mappers.mjs';

const fieldCounts = [10, 50, 200];
const baseIterations = readPositiveInteger('WANDOFMAGIC_BENCH_ITERATIONS', 20_000);
const corpusSize = readPositiveInteger('WANDOFMAGIC_BENCH_CORPUS', 256);
const rounds = readPositiveInteger('WANDOFMAGIC_BENCH_ROUNDS', 7);
const warmupBase = readPositiveInteger('WANDOFMAGIC_BENCH_WARMUP', 10_000);
const selectedRunner = process.env.WANDOFMAGIC_BENCH_RUNNER;
const checkedDiscard = Object.freeze({ receipt: 'discard' });
const trustedDiscard = Object.freeze({ input: 'trusted', receipt: 'discard' });
let generatedMapper;

const normalize = spell({ name: 'flat-benchmark', version: 1 })
    .rename({
        first_name: 'firstName',
        last_name: 'lastName',
        password_hash: 'passwordHash',
    })
    .trim(['firstName', 'lastName', 'email'])
    .coerce('age', number({ integer: true }))
    .coerce('active', boolean(), { missing: 'skip' })
    .default('active', false)
    .derive('displayName', ['firstName', 'lastName'], deriveDisplayName)
    .omit(['passwordHash'])
    .build();

const runners = [
    createRunner('handwritten-for-in-happy', runHandwrittenForInHappy),
    createRunner('handwritten-object-keys-happy', runHandwrittenObjectKeysHappy),
    createRunner('handwritten-equivalent', runHandwrittenEquivalent),
    createRunner('handwritten-spread-historical', runHandwrittenSpreadHistorical),
    createRunner('wandofmagic-checked-collect', runWandofmagicCheckedCollect),
    createRunner('wandofmagic-checked-discard', runWandofmagicCheckedDiscard),
    createRunner('wandofmagic-checked-run', runWandofmagicChecked),
    createRunner('wandofmagic-trusted-run', runWandofmagicTrusted),
    createRunner('wandofmagic-generated', runWandofmagicGenerated),
];

if (selectedRunner === undefined) {
    await initializeGeneratedMapper();
    runCoordinator();
} else {
    if (selectedRunner === 'wandofmagic-generated') {
        await initializeGeneratedMapper();
    }
    runWorker(selectedRunner);
}

function runCoordinator() {
    for (const fieldCount of fieldCounts) {
        assertEquivalent(createCorpus(fieldCount, corpusSize));
    }
    const isolatedResults = runners.map((runner) => runIsolatedRunner(runner.name));
    const results = fieldCounts.map((fieldCount) => {
        const measurements = isolatedResults.map(({ name, results: workerResults }) => {
            const measurement = workerResults.find((candidate) =>
                candidate.fieldCount === fieldCount);
            if (measurement === undefined) {
                throw new Error(`The ${name} worker omitted the ${String(fieldCount)}-field result.`);
            }
            return { name, opsPerSecond: measurement.opsPerSecond };
        });
        const happyPath = Math.max(
            findMeasurement(measurements, 'handwritten-for-in-happy').opsPerSecond,
            findMeasurement(measurements, 'handwritten-object-keys-happy').opsPerSecond,
        );
        const spread = findMeasurement(
            measurements,
            'handwritten-spread-historical',
        ).opsPerSecond;
        const equivalent = findMeasurement(
            measurements,
            'handwritten-equivalent',
        ).opsPerSecond;

        return {
            fieldCount,
            iterations: scaleWork(baseIterations, fieldCount),
            measurements: measurements.map(({ name, opsPerSecond }) => ({
                name,
                nanosecondsPerRecord: Math.round(1_000_000_000 / opsPerSecond),
                opsPerSecond: Math.round(opsPerSecond),
                relativeToEquivalent: Number((opsPerSecond / equivalent).toFixed(3)),
                relativeToHappyPathCeiling: Number((opsPerSecond / happyPath).toFixed(3)),
                relativeToHistoricalSpread: Number((opsPerSecond / spread).toFixed(3)),
            })),
            warmupIterations: scaleWarmup(warmupBase, fieldCount),
        };
    });

    console.log(JSON.stringify({
        corpusSize,
        isolatedRunners: true,
        node: process.version,
        results,
        rounds,
    }, null, 2));
}

function runWorker(name) {
    const runner = runners.find((candidate) => candidate.name === name);
    if (runner === undefined) {
        throw new Error(`Unknown benchmark runner: ${name}.`);
    }
    const results = fieldCounts.map((fieldCount) => ({
        fieldCount,
        opsPerSecond: benchmarkRunner(
            runner,
            createCorpus(fieldCount, corpusSize),
            fieldCount,
            scaleWork(baseIterations, fieldCount),
            scaleWarmup(warmupBase, fieldCount),
        ),
    }));
    console.log(JSON.stringify({ name, results }));
}

function runIsolatedRunner(name) {
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
        encoding: 'utf8',
        env: { ...process.env, WANDOFMAGIC_BENCH_RUNNER: name },
        maxBuffer: 10 * 1024 * 1024,
    });
    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${name} benchmark worker failed: ${result.stderr.trim()}`);
    }
    return JSON.parse(result.stdout);
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

function scaleWork(base, fieldCount) {
    return Math.max(1_000, Math.floor(base * (10 / fieldCount)));
}

function scaleWarmup(base, fieldCount) {
    return Math.max(10_000, Math.floor(base * (10 / fieldCount)));
}

function createCorpus(fieldCount, size) {
    return Object.freeze(Array.from({ length: size }, (_, index) => createInput(fieldCount, index)));
}

function createInput(fieldCount, index) {
    const input = {
        age: String(20 + index % 60),
        email: `  ada-${String(index)}@example.com  `,
        first_name: ` Ada${String(index % 17)} `,
        last_name: ` Lovelace${String(index % 13)} `,
        password_hash: `not-measured-${String(index)}`,
    };

    for (let field = Object.keys(input).length; field < fieldCount; field += 1) {
        input[`extra_${String(field)}`] = field + index;
    }

    return Object.freeze(input);
}

function runWandofmagicCheckedCollect(input) {
    return unwrap(normalize.safeRun(input));
}

function runWandofmagicCheckedDiscard(input) {
    return unwrap(normalize.safeRun(input, checkedDiscard));
}

function runWandofmagicChecked(input) {
    return normalize.run(input, checkedDiscard);
}

function runWandofmagicTrusted(input) {
    return normalize.run(input, trustedDiscard);
}

function runWandofmagicGenerated(input) {
    if (generatedMapper === undefined) {
        throw new Error('The generated benchmark mapper was not initialized.');
    }
    return generatedMapper(input);
}

function unwrap(result) {
    if (!result.ok) {
        throw new Error(result.issues[0]?.message ?? 'Benchmark execution failed.');
    }

    return result.value;
}

function assertEquivalent(corpus) {
    for (const input of corpus.slice(0, 16)) {
        compareEquivalentOutcome(input);
    }

    const base = corpus[0];
    if (base === undefined) {
        throw new Error('The benchmark corpus is empty.');
    }
    const missingAge = { ...base };
    const missingFirstName = { ...base };
    Reflect.deleteProperty(missingAge, 'age');
    Reflect.deleteProperty(missingFirstName, 'first_name');
    for (const input of [
        { ...base, firstName: 'existing' },
        { ...base, age: 'invalid' },
        missingAge,
        { ...base, email: 7 },
        { ...base, active: 'invalid' },
        { ...base, displayName: 'existing' },
        missingFirstName,
    ]) {
        compareEquivalentOutcome(input);
    }

    const nullPrototypeInput = Object.assign(Object.create(null), base);
    Object.defineProperty(nullPrototypeInput, '__proto__', {
        enumerable: true,
        value: { marker: true },
    });
    compareEquivalentOutcome(nullPrototypeInput);
}

function compareEquivalentOutcome(input) {
    const expected = captureOutcome(() => normalize.run(input, trustedDiscard));
    for (const [name, mapper] of [
        ['semantics-equivalent handwritten', runHandwrittenEquivalent],
        ['generated', runWandofmagicGenerated],
    ]) {
        const actual = captureOutcome(() => mapper(input));
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`The ${name} mapper diverged from Wandofmagic.`);
        }
    }
}

async function initializeGeneratedMapper() {
    const artifact = emitTrustedMapperModule(normalize);
    const directory = await mkdtemp(join(tmpdir(), 'wandofmagic-benchmark-'));
    const modulePath = join(directory, 'generated.mjs');
    try {
        await writeFile(modulePath, artifact.source, 'utf8');
        const generatedModule = await import(pathToFileURL(modulePath).href);
        if (typeof generatedModule.createTrustedMapper !== 'function') {
            throw new TypeError('The generated benchmark module is invalid.');
        }
        generatedMapper = generatedModule.createTrustedMapper(artifact.bindings, WandError);
    } finally {
        await rm(directory, { force: true, recursive: true });
    }
}

function captureOutcome(run) {
    try {
        const value = run();
        return {
            keys: Object.keys(value),
            nullPrototype: Object.getPrototypeOf(value) === null,
            ok: true,
            value,
        };
    } catch (error) {
        if (
            typeof error !== 'object'
            || error === null
            || !('toJSON' in error)
            || typeof error.toJSON !== 'function'
        ) {
            throw error;
        }
        return { error: error.toJSON(), ok: false };
    }
}

function benchmarkRunner(runner, corpus, fieldCount, iterations, warmupIterations) {
    const samples = [];
    runner.consume(corpus, fieldCount, warmupIterations);
    for (let round = 0; round < rounds; round += 1) {
        const started = performance.now();
        runner.consume(corpus, fieldCount, iterations);
        const elapsedMilliseconds = performance.now() - started;
        samples.push(iterations / (elapsedMilliseconds / 1_000));
    }
    samples.sort((left, right) => left - right);
    const median = samples[Math.floor(samples.length / 2)];
    if (median === undefined) {
        throw new Error(`No benchmark samples were captured for ${runner.name}.`);
    }
    return median;
}

function createRunner(name, run) {
    return Object.freeze({ consume: createConsumer(run), name });
}

function createConsumer(run) {
    return (corpus, fieldCount, count) => {
        const extraKey = `extra_${String(fieldCount - 1)}`;
        let checksum = 0;
        for (let iteration = 0; iteration < count; iteration += 1) {
            const input = corpus[iteration % corpus.length];
            const output = run(input);
            checksum += output.age
                + output.displayName.length
                + output.email.length
                + output.firstName.length
                + output.lastName.length
                + output[extraKey];
        }

        if (!Number.isFinite(checksum) || checksum === 0) {
            throw new Error('Benchmark output was not consumed.');
        }
    };
}

function findMeasurement(measurements, name) {
    const measurement = measurements.find((candidate) => candidate.name === name);
    if (measurement === undefined) {
        throw new Error(`The ${name} benchmark baseline is missing.`);
    }
    return measurement;
}

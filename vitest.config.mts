import { defineConfig } from 'vitest/config';
import {
    allowedSourceIndexes,
} from './scripts/architecture/entrypoint/allowed-source-indexes.mts';
import { facadeDirectories } from './scripts/architecture/module/source-facades.mts';

const facadeCoverageExclusions = [...facadeDirectories].map(
    (directory) => `${directory}/*.ts`,
);
const coverageExclusions = [...new Set([
    ...allowedSourceIndexes,
    ...facadeCoverageExclusions,
])];

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: coverageExclusions,
            reporter: ['text', 'json-summary', 'html'],
            reportsDirectory: 'coverage',
            thresholds: {
                statements: 95,
                branches: 90,
                functions: 95,
                lines: 95,
            },
        },
    },
});

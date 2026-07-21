import { defineConfig } from 'vitest/config';

const migrationShadowModules = [
    'src/builder/spell/**/*.ts',
    'src/builder/state/**/*.ts',
    'src/builder/wand/**/*.ts',
    'src/coerce/builtin/**/*.ts',
    'src/core/change/**/*.ts',
    'src/core/execution/**/*.ts',
    'src/core/issue/**/*.ts',
    'src/core/path/**/*.ts',
    'src/core/plan/**/*.ts',
    'src/instructions/coercer/**/*.ts',
    'src/instructions/flat/**/*.ts',
    'src/instructions/path/**/*.ts',
    'src/internal/type-boundary/**/*.ts',
    'src/runtime/clone-path-container/**/*.ts',
    'src/runtime/compiled-spell/**/*.ts',
    'src/runtime/data-record/**/*.ts',
    'src/runtime/execute-plan/**/*.ts',
    'src/runtime/path-container/**/*.ts',
    'src/runtime/path-mutation/**/*.ts',
    'src/runtime/path/**/*.ts',
    'src/runtime/project-record/**/*.ts',
    'src/runtime/projection-program/**/*.ts',
    'src/runtime/run-options/**/*.ts',
    'src/runtime/trusted-project-record/**/*.ts',
    'src/operations/flat/**/*.ts',
    'src/operations/path/**/*.ts',
];

export default defineConfig({
    test: {
        include: ['test/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: [
                'src/index.ts',
                'src/coerce/index.ts',
                ...migrationShadowModules,
            ],
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

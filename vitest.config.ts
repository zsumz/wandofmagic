import { defineConfig } from 'vitest/config';

const migrationShadowModules = [
    'src/coerce/builtin/**/*.ts',
    'src/core/change/**/*.ts',
    'src/core/execution/**/*.ts',
    'src/core/issue/**/*.ts',
    'src/core/path/**/*.ts',
    'src/core/plan/**/*.ts',
    'src/instructions/coercer/**/*.ts',
    'src/instructions/flat/**/*.ts',
    'src/instructions/path/**/*.ts',
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

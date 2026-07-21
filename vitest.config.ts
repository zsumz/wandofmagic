import { defineConfig } from 'vitest/config';

const migrationLegacyModules = [
    'src/builder/*.ts',
    'src/coerce/{boolean,iso-date,number,string}.ts',
    'src/compiler/*.ts',
    'src/operations/*.ts',
    'src/runtime/*.ts',
    'src/types/*.ts',
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
                ...migrationLegacyModules,
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

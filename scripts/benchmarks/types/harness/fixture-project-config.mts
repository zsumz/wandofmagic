import { join } from 'node:path';
import { findPublicEntrypoint } from '../../../shared/public-entrypoints.mts';
import type { TypeBenchmarkConfig } from './type-benchmark-config.mts';

export interface FixtureProjectConfig {
    readonly compilerOptions: {
        readonly baseUrl: string;
        readonly noEmit: true;
        readonly paths: Readonly<Record<string, readonly string[]>>;
        readonly rootDir: string;
        readonly types: readonly [];
    };
    readonly extends: string;
    readonly files: readonly [string];
}

export function createFixtureProjectConfig(
    fixturePath: string,
    config: TypeBenchmarkConfig,
): FixtureProjectConfig {
    return {
        extends: join(config.root, 'tsconfig.build.json'),
        compilerOptions: {
            baseUrl: config.root,
            noEmit: true,
            paths: {
                wandofmagic: [`./${findPublicEntrypoint('.').sourcePath}`],
                'wandofmagic/coerce': [`./${findPublicEntrypoint('./coerce').sourcePath}`],
                'wandofmagic/internal/path-program': ['./src/types/path-program.ts'],
            },
            rootDir: config.root,
            types: [],
        },
        files: [fixturePath],
    };
}

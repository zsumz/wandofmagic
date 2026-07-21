import { publicEntrypoints } from './scripts/shared/public-entrypoints.mts';

interface MutableInputOptions {
    define?: unknown;
    inject?: unknown;
}

export default {
    entry: Object.fromEntries(publicEntrypoints.map(
        ({ buildName, sourcePath }) => [buildName, sourcePath],
    )),
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    target: 'es2022',
    hash: false,
    inputOptions(options: MutableInputOptions): void {
        delete options.define;
        delete options.inject;
    },
};

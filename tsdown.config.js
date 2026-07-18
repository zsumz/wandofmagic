import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: {
        coerce: 'src/coerce/index.ts',
        index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    target: 'es2022',
    hash: false,
    inputOptions(options) {
        delete options.define;
        delete options.inject;
    },
});

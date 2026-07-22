export const commonJsEntrypointSmoke = `
    import { createRequire } from 'node:module';

    const require = createRequire(import.meta.url);
    const { spell } = require('wandofmagic');
    const { number } = require('wandofmagic/coerce');
    const { emitTrustedMapperModule } = require('wandofmagic/compiler');
    const normalize = spell()
        .rename({ raw_count: 'count' })
        .coerce('count', number({ integer: true }))
        .omit(['secret'])
        .build();
    const value = normalize.run({ raw_count: '9' });
    const deep = spell()
        .set(['metadata', 'source'], 'cjs')
        .transform(['metadata', 'source'], (source) => source.toUpperCase())
        .move(['metadata', 'source'], ['metadata', 'origin'])
        .set(['metadata', 'count'], '7')
        .coerce(['metadata', 'count'], number())
        .default(['metadata', 'region'], 'us')
        .set(['metadata', 'private'], 'remove')
        .omit([['metadata', 'private']])
        .build()
        .run({});
    const artifact = emitTrustedMapperModule(normalize);

    if (value.count !== 9 || deep.metadata.origin !== 'CJS' ||
        'source' in deep.metadata || deep.metadata.count !== 7 ||
        deep.metadata.region !== 'us' || 'private' in deep.metadata ||
        artifact.bindings.length !== 0) {
        throw new Error('CommonJS package entrypoints returned an invalid result');
    }
`;

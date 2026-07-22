export const commonJsEntrypointSmoke = `
    import { createRequire } from 'node:module';

    const require = createRequire(import.meta.url);
    const { collection, spell, WandError } = require('wandofmagic');
    const { number } = require('wandofmagic/coerce');
    const { emitTrustedMapperModule } = require('wandofmagic/compiler');
    const normalize = spell()
        .rename({ raw_count: 'count' })
        .coerce('count', number({ integer: true }))
        .omit(['secret'])
        .build();
    const value = normalize.run({ raw_count: '9' });
    const deepSpell = spell()
        .set(['metadata', 'source'], ' cjs ')
        .trim([['metadata', 'source']])
        .transform(['metadata', 'source'], (source) => source.toUpperCase())
        .move(['metadata', 'source'], ['metadata', 'origin'])
        .copy(['metadata', 'origin'], ['metadata', 'owner'])
        .set(['metadata', 'count'], '7')
        .coerce(['metadata', 'count'], number())
        .default(['metadata', 'region'], 'us')
        .derive(
            ['metadata', 'summary'],
            [['metadata', 'owner'], ['metadata', 'count']],
            ([owner, count]) => owner + ':' + count,
        )
        .set(['metadata', 'private'], 'remove')
        .omit([['metadata', 'private']])
        .pick([['metadata', 'origin'], ['metadata', 'owner'], ['metadata', 'count'],
            ['metadata', 'region'], ['metadata', 'summary']])
        .build();
    const deep = deepSpell.run({});
    const artifact = emitTrustedMapperModule(collection(deepSpell));
    const generatedModule = await import('data:text/javascript;base64,' +
        Buffer.from(artifact.source).toString('base64'));
    const generatedDeep = generatedModule
        .createTrustedMapper(artifact.bindings, WandError)([{}])[0];
    const collectionValue = collection(normalize).run([{ raw_count: '8' }]);

    if (value.count !== 9 || deep.metadata.origin !== 'CJS' ||
        generatedDeep.metadata.owner !== 'CJS' ||
        generatedDeep.metadata.summary !== 'CJS:7' ||
        'source' in deep.metadata || deep.metadata.count !== 7 ||
        deep.metadata.region !== 'us' || 'private' in deep.metadata ||
        artifact.mode !== 'trusted-discard' || collectionValue[0].count !== 8) {
        throw new Error('CommonJS package entrypoints returned an invalid result');
    }
`;

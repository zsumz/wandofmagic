export const esmEntrypointSmoke = `
    import { collection, spell } from 'wandofmagic';
    import { number } from 'wandofmagic/coerce';
    import { emitTrustedMapperModule } from 'wandofmagic/compiler';

    const normalize = spell()
        .rename({ raw_count: 'count' })
        .coerce('count', number({ integer: true }))
        .omit(['secret'])
        .build();
    const result = normalize.safeRun({ raw_count: '7' }, { receipt: 'discard' });
    const deep = spell()
        .set(['metadata', 'source'], 'esm')
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
    const collectionValue = collection(normalize).run([{ raw_count: '8' }]);
    if (!result.ok || result.changes.length !== 0 ||
        result.value.count !== 7 || 'raw_count' in result.value) {
        throw new Error('ESM package entrypoints returned an invalid result');
    }
    if (collectionValue[0].count !== 8) {
        throw new Error('ESM collection entrypoint returned an invalid result');
    }
    if (deep.metadata.origin !== 'ESM' || 'source' in deep.metadata ||
        deep.metadata.count !== 7 || deep.metadata.region !== 'us' ||
        'private' in deep.metadata) {
        throw new Error('ESM deep operations returned an invalid result');
    }
    if (artifact.mode !== 'trusted-discard' ||
        !artifact.source.includes('createTrustedMapper')) {
        throw new Error('ESM compiler entrypoint returned an invalid artifact');
    }
`;

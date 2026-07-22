export const esmEntrypointSmoke = `
    import { collection, spell, WandError } from 'wandofmagic';
    import { number } from 'wandofmagic/coerce';
    import { emitTrustedMapperModule } from 'wandofmagic/compiler';

    const normalize = spell()
        .rename({ raw_count: 'count' })
        .coerce('count', number({ integer: true }))
        .omit(['secret'])
        .build();
    const result = normalize.safeRun({ raw_count: '7' }, { receipt: 'discard' });
    const deepSpell = spell()
        .set(['metadata', 'source'], ' esm ')
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

    const artifact = emitTrustedMapperModule(deepSpell);
    const generatedModule = await import('data:text/javascript;base64,' +
        Buffer.from(artifact.source).toString('base64'));
    const generatedDeep = generatedModule
        .createTrustedMapper(artifact.bindings, WandError)({});
    const collectionValue = collection(normalize).run([{ raw_count: '8' }]);
    if (!result.ok || result.changes.length !== 0 ||
        result.value.count !== 7 || 'raw_count' in result.value) {
        throw new Error('ESM package entrypoints returned an invalid result');
    }
    if (collectionValue[0].count !== 8) {
        throw new Error('ESM collection entrypoint returned an invalid result');
    }
    if (deep.metadata.origin !== 'ESM' || generatedDeep.metadata.owner !== 'ESM' ||
        generatedDeep.metadata.summary !== 'ESM:7' || 'source' in deep.metadata ||
        deep.metadata.count !== 7 || deep.metadata.region !== 'us' ||
        'private' in deep.metadata) {
        throw new Error('ESM deep operations returned an invalid result');
    }
    if (artifact.mode !== 'trusted-discard' ||
        !artifact.source.includes('createTrustedMapper')) {
        throw new Error('ESM compiler entrypoint returned an invalid artifact');
    }
`;

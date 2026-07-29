export const typeConsumerSource = `
    import { collection, spell, type InferOutput } from 'wandofmagic';
    import { number } from 'wandofmagic/coerce';
    import {
        TRUSTED_MAPPER_FORMAT_VERSION,
        emitTrustedMapperModule,
    } from 'wandofmagic/compiler';

    const normalize = spell<{ count: string }>()
        .coerce('count', number())
        .build();
    const normalizeMany = collection(normalize);
    const value: InferOutput<typeof normalize> = normalize.run({ count: '7' });
    const values: Array<{ count: number }> = normalizeMany.run([{ count: '8' }]);
    const artifact = emitTrustedMapperModule(normalize);
    const format: 1 = artifact.formatVersion;
    const supportedFormat: 1 = TRUSTED_MAPPER_FORMAT_VERSION;

    void value;
    void values;
    void format;
    void supportedFormat;
`;

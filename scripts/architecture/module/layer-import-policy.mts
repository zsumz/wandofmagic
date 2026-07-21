/** Source-layer imports rejected by the architecture guard. */
export const forbiddenLayerImports: Readonly<Record<string, ReadonlySet<string>>> = {
    coerce: new Set(['builder', 'core', 'internal', 'operations', 'runtime', 'types']),
    compiler: new Set(['builder', 'coerce', 'operations', 'types']),
    core: new Set(['builder', 'coerce', 'internal', 'operations', 'runtime', 'types']),
    instructions: new Set(['builder', 'coerce', 'core', 'internal', 'operations', 'runtime', 'types']),
    operations: new Set(['builder', 'operations']),
    runtime: new Set(['builder', 'operations']),
    types: new Set(['builder', 'operations', 'runtime']),
};

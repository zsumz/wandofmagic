export function emitCollectionFactory(name: string, itemFactory: string): readonly string[] {
    return [
        `function ${name}($bindings, $WandError) {`,
        `    const $itemMapper = ${itemFactory}($bindings, $WandError);`,
        '    return function run(input) {',
        '        return $runCollection(input, $itemMapper, $WandError);',
        '    };',
        '}',
    ];
}

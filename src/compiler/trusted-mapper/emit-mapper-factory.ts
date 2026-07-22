export function emitMapperFactory(
    name: string,
    structuralLines: readonly string[],
    operationLines: readonly string[],
    bindings: ReadonlyArray<{ readonly index: number; readonly kind: string }>,
): readonly string[] {
    const lines = [
        `function ${name}($bindings, $WandError) {`,
        `    if (!Array.isArray($bindings) || $bindings.length !== ${String(bindings.length)}) {`,
        '        throw new TypeError("Generated Wandofmagic mapper bindings do not match the plan.");',
        '    }',
        '    if (typeof $WandError !== "function") {',
        '        throw new TypeError("Generated Wandofmagic mappers require the WandError constructor.");',
        '    }',
    ];
    for (const binding of bindings) {
        const bindingName = `$binding${String(binding.index)}`;
        lines.push(`    const ${bindingName} = $bindings[${String(binding.index)}];`);
        if (binding.kind === 'coercer' || binding.kind === 'derive' || binding.kind === 'transform') {
            lines.push(`    if (typeof ${bindingName} !== "function") {`);
            lines.push(
                '        throw new TypeError("A generated Wandofmagic callable binding is invalid.");',
            );
            lines.push('    }');
        }
    }
    lines.push('    return function run(input) {');
    lines.push(...structuralLines);
    lines.push(...operationLines);
    lines.push('        return $value;');
    lines.push('    };');
    lines.push('}');
    return lines;
}

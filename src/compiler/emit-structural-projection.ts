import type { RenameFieldInstruction } from '../instructions/flat-operation.js';
import type { StructuralProgram } from './structural-program.js';
import { sourceString } from './source-string.js';

interface KeyAction {
    destinationIndex: number;
    omitted: boolean;
    sourceIndex: number;
}

interface ProjectedRename extends RenameFieldInstruction {
    readonly index: number;
    readonly omitted: boolean;
}

/** Emit the proven one-pass rename/copy/omit projection at the mapper boundary. */
export function emitStructuralProjection(program: StructuralProgram): readonly string[] {
    const omittedKeys = new Set(program.omit.keys);
    const entries: readonly ProjectedRename[] = program.rename.entries
        .filter((entry) => entry.source !== entry.destination)
        .map((entry, index) => Object.freeze({
            ...entry,
            index,
            omitted: omittedKeys.has(entry.destination),
        }));
    const actions = compileActions(entries, omittedKeys);
    const lines = emitBoundary();

    for (const entry of entries) {
        lines.push(`        let $source${String(entry.index)};`);
        lines.push(`        let $source${String(entry.index)}Present = false;`);
        lines.push(`        let $destination${String(entry.index)}Present = false;`);
    }
    lines.push('        try {');
    lines.push('            for (const $key in input) {');
    lines.push('                const $current = input[$key];');
    lines.push('                switch ($key) {');
    for (const [key, action] of actions) {
        lines.push(...emitAction(key, action));
    }
    lines.push('                    default:');
    lines.push('                        $defineField($value, $key, $current);');
    lines.push('                }');
    lines.push('            }');
    lines.push('        } catch ($cause) {');
    lines.push('            $fail($WandError, "invalid_input", "Wandofmagic could not inspect the input record.", undefined, undefined, undefined, undefined, $cause);');
    lines.push('        }');

    for (const entry of entries) {
        const index = String(entry.index);
        lines.push(`        if ($source${index}Present && $destination${index}Present) {`);
        lines.push(`            $fail($WandError, "destination_conflict", ${sourceString(`Cannot rename ${entry.source} to ${entry.destination}; the destination already exists.`)}, ${sourceString(entry.destination)}, ${sourceString(program.rename.id)}, "rename");`);
        lines.push('        }');
    }
    for (const entry of entries) {
        if (!entry.omitted) {
            const index = String(entry.index);
            lines.push(`        if ($source${index}Present) {`);
            lines.push(`            $value[${sourceString(entry.destination)}] = $source${index};`);
            lines.push('        }');
        }
    }
    return lines;
}

function emitBoundary(): string[] {
    return [
        '        let $prototype;',
        '        try {',
        '            $prototype = Object.getPrototypeOf(input);',
        '        } catch ($cause) {',
        '            $fail($WandError, "invalid_input", "Wandofmagic could not inspect the input record.", undefined, undefined, undefined, undefined, $cause);',
        '        }',
        '        if ($prototype !== $objectPrototype && $prototype !== null) {',
        '            $fail($WandError, "invalid_input", Array.isArray(input)',
        '                ? "The v0 execution core accepts a plain object at the root, not an array."',
        '                : "Wandofmagic accepts plain objects and null-prototype objects at the root.");',
        '        }',
        '        const $value = $prototype === null ? Object.create(null) : {};',
    ];
}

function compileActions(
    entries: readonly ProjectedRename[],
    omittedKeys: ReadonlySet<string>,
): ReadonlyMap<string, KeyAction> {
    const actions: Map<string, KeyAction> = new Map();
    for (const entry of entries) {
        actionFor(actions, entry.source).sourceIndex = entry.index;
        actionFor(actions, entry.destination).destinationIndex = entry.index;
    }
    for (const key of omittedKeys) {
        actionFor(actions, key).omitted = true;
    }
    return actions;
}

function actionFor(actions: Map<string, KeyAction>, key: string): KeyAction {
    const existing = actions.get(key);
    if (existing !== undefined) {
        return existing;
    }
    const created = { destinationIndex: -1, omitted: false, sourceIndex: -1 };
    actions.set(key, created);
    return created;
}

function emitAction(key: string, action: KeyAction): string[] {
    const lines = [`                    case ${sourceString(key)}:`];
    if (action.sourceIndex >= 0) {
        const index = String(action.sourceIndex);
        lines.push(`                        $source${index}Present = true;`);
        lines.push(`                        $source${index} = $current;`);
    } else if (action.destinationIndex >= 0) {
        lines.push(`                        $destination${String(action.destinationIndex)}Present = true;`);
        if (!action.omitted) {
            lines.push('                        $defineField($value, $key, $current);');
        }
    }
    lines.push('                        break;');
    return lines;
}

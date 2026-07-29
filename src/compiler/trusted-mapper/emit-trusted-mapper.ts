import type { Spell } from '../../core/execution/spell.js';
import { getOperationProgram } from '../../runtime/compiled-spell/operation-program-registry.js';
import { getCollectionItemSpell } from '../../runtime/collection/collection-item-registry.js';
import { CompilerError } from '../error/compiler-error.js';
import { emitOperation } from '../emitter/emit-operation.js';
import { createEmitterState } from '../emitter/emitter-state.js';
import { operationReadPaths } from '../emitter/operation-read-paths.js';
import { emitPathDeclarations } from '../emitter/path-source.js';
import { beginReadPrefixScope, endReadPrefixScope } from '../emitter/read-prefix-scope.js';
import {
    TRUSTED_MAPPER_FORMAT_VERSION,
    type TrustedMapperModule,
} from './emitted-mapper.js';
import { collectionRuntimeSource } from '../generated-runtime/collection-runtime-source.js';
import { generatedRuntimeSource } from '../generated-runtime/generated-runtime-source.js';
import { analyzeStructuralProgram } from '../structural-program/analyze-structural-program.js';
import { emitStructuralProjection } from '../structural-projection/emit-structural-projection.js';
import { emitTrustedSnapshot } from '../structural-projection/emit-trusted-snapshot.js';
import { emitCollectionFactory } from './emit-collection-factory.js';
import { emitMapperFactory } from './emit-mapper-factory.js';
import { emitModuleSource } from './emit-module-source.js';

/** Emit an ESM factory specialized for trusted input with discarded receipts. */
export function emitTrustedMapperModule<Input extends object, Output extends object>(
    spell: Spell<Input, Output>,
): TrustedMapperModule {
    const resolved = resolveCollection(spell);
    const program = getOperationProgram(resolved.itemSpell);
    if (program === undefined) {
        throw new CompilerError(
            'unsupported_spell',
            'Static mapper emission requires a spell built by this package instance.',
        );
    }

    const structural = analyzeStructuralProgram(program);
    const operations = structural?.middle ?? program;
    const state = createEmitterState();
    const operationLines: string[] = [];
    for (let index = 0; index < operations.length; index += 1) {
        const instruction = operations[index];
        if (instruction !== undefined) {
            operationLines.push(...beginReadPrefixScope(
                operationReadPaths(instruction),
                index,
                state,
            ));
            operationLines.push(...emitOperation(instruction, index, state));
            endReadPrefixScope(state);
        }
    }
    const includeIsoDate = operations.some((instruction) =>
        (instruction.kind === 'coerce' || instruction.kind === 'coerce-path')
        && instruction.coercer.kind === 'iso-date');
    const includePaths = operations.some((instruction) => instruction.kind.includes('path')
        || instruction.kind === 'copy'
        || instruction.kind === 'move'
        || instruction.kind === 'omit-paths'
        || instruction.kind === 'pick'
        || instruction.kind === 'set');
    const runtimeLines = [
        ...generatedRuntimeSource(includeIsoDate, includePaths),
        ...resolved.depth > 0 ? collectionRuntimeSource : [],
        ...emitPathDeclarations(state),
    ];
    const factories = [
        ...emitMapperFactory(
            '$createMapper0',
            structural === undefined ? emitTrustedSnapshot() : emitStructuralProjection(structural),
            operationLines,
            state.bindingDescriptions,
            includePaths,
        ),
    ];
    for (let depth = 1; depth <= resolved.depth; depth += 1) {
        factories.push('');
        factories.push(...emitCollectionFactory(
            `$createMapper${String(depth)}`,
            `$createMapper${String(depth - 1)}`,
        ));
    }
    const source = emitModuleSource(
        runtimeLines,
        factories,
        `$createMapper${String(resolved.depth)}`,
    );

    return Object.freeze({
        bindingDescriptions: Object.freeze([...state.bindingDescriptions]),
        bindings: Object.freeze([...state.bindings]),
        formatVersion: TRUSTED_MAPPER_FORMAT_VERSION,
        mode: 'trusted-discard',
        source,
    });
}

function resolveCollection(owner: object): { readonly depth: number; readonly itemSpell: object } {
    const seen: Set<object> = new Set([owner]);
    let itemSpell = owner;
    let depth = 0;
    let item = getCollectionItemSpell(itemSpell);
    while (item !== undefined) {
        if (seen.has(item)) {
            throw new CompilerError('unsupported_spell', 'Collection spell composition is cyclic.');
        }
        seen.add(item);
        depth += 1;
        itemSpell = item;
        item = getCollectionItemSpell(itemSpell);
    }
    return { depth, itemSpell };
}

import type { Spell } from '../../core/execution/spell.js';
import { getOperationProgram } from '../../runtime/compiled-spell/operation-program-registry.js';
import { CompilerError } from '../error/compiler-error.js';
import { emitOperation } from '../emitter/emit-operation.js';
import { createEmitterState } from '../emitter/emitter-state.js';
import type { TrustedMapperModule } from './emitted-mapper.js';
import { analyzeStructuralProgram } from '../structural-program/analyze-structural-program.js';
import { emitStructuralProjection } from '../structural-projection/emit-structural-projection.js';
import { emitTrustedSnapshot } from '../structural-projection/emit-trusted-snapshot.js';
import { emitModuleSource } from './emit-module-source.js';

/** Emit an ESM factory specialized for trusted input with discarded receipts. */
export function emitTrustedMapperModule<Input extends object, Output extends object>(
    spell: Spell<Input, Output>,
): TrustedMapperModule {
    const program = getOperationProgram(spell);
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
            operationLines.push(...emitOperation(instruction, index, state));
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
    const source = emitModuleSource(
        structural === undefined ? emitTrustedSnapshot() : emitStructuralProjection(structural),
        operationLines,
        state.bindingDescriptions,
        includeIsoDate,
        includePaths,
    );

    return Object.freeze({
        bindingDescriptions: Object.freeze([...state.bindingDescriptions]),
        bindings: Object.freeze([...state.bindings]),
        mode: 'trusted-discard',
        source,
    });
}

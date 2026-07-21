import type { Spell } from '../../core/execution/spell.js';
import { getFlatProgram } from '../../runtime/compiled-spell/flat-program-registry.js';
import { CompilerError } from '../error/compiler-error.js';
import { emitOperation } from '../emitter/emit-operation.js';
import { createEmitterState } from '../emitter/emitter-state.js';
import type { TrustedMapperModule } from './emitted-mapper.js';
import { analyzeStructuralProgram } from '../structural-program/analyze-structural-program.js';
import { emitStructuralProjection } from '../structural-projection/emit-structural-projection.js';
import { emitModuleSource } from './emit-module-source.js';

/** Emit an ESM factory specialized for trusted input with discarded receipts. */
export function emitTrustedMapperModule<Input extends object, Output extends object>(
    spell: Spell<Input, Output>,
): TrustedMapperModule {
    const program = getFlatProgram(spell);
    if (program === undefined) {
        throw new CompilerError(
            'unsupported_spell',
            'Static mapper emission requires a supported flat spell built by this package instance.',
        );
    }

    const structural = analyzeStructuralProgram(program);
    const state = createEmitterState();
    const operationLines: string[] = [];
    for (let index = 0; index < structural.middle.length; index += 1) {
        const instruction = structural.middle[index];
        if (instruction !== undefined) {
            operationLines.push(...emitOperation(instruction, index, state));
        }
    }
    const includeIsoDate = structural.middle.some((instruction) =>
        instruction.kind === 'coerce' && instruction.coercer.kind === 'iso-date');
    const source = emitModuleSource(
        emitStructuralProjection(structural),
        operationLines,
        state.bindingDescriptions,
        includeIsoDate,
    );

    return Object.freeze({
        bindingDescriptions: Object.freeze([...state.bindingDescriptions]),
        bindings: Object.freeze([...state.bindings]),
        mode: 'trusted-discard',
        source,
    });
}

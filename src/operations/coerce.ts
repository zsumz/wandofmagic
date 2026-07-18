import type { CoerceResult, Coercer } from '../coerce/types.js';
import { freezeChange, type WandChange } from '../core/change.js';
import type { DataRecord } from '../core/data-record.js';
import type { StepDescription } from '../core/description.js';
import type {
    ChangeCollector,
    ExecutableStep,
    PlanExecutor,
    StepOutcome,
} from '../core/executable-step.js';
import { createIssue } from '../core/issue.js';
import type { MissingPolicy } from '../core/options.js';
import { fieldPath } from '../core/path.js';
import { resolveCoercerInstruction } from '../instructions/coercer-instruction.js';
import { hasOwn, valueKind } from '../runtime/data-record.js';
import { assertSafeKey } from '../runtime/safe-key.js';

export function createCoerceStep(
    key: string,
    coercer: Coercer<unknown, unknown>,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    assertSafeKey(key);
    const coercerName = coercer.name;
    const coerce = coercer.run;
    const path = fieldPath(key);
    const description: StepDescription = {
        id,
        kind: 'coerce',
        reads: [path],
        removes: [],
        writes: [path],
    };
    const instruction = Object.freeze({
        coercer: resolveCoercerInstruction(coercer, coercerName, coerce),
        id,
        key,
        kind: 'coerce' as const,
        missing,
    });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            let cachedChange: WandChange | undefined;
            let cachedFromType: string | undefined;
            let cachedToType: string | undefined;

            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                let current: unknown;
                if (hasOwn(value, key)) {
                    current = value[key];
                }
                if (current === undefined) {
                    if (missing === 'skip') {
                        return next?.(value, changes);
                    }

                    return createIssue({
                        code: 'missing_field',
                        message: `Cannot coerce ${key}; the field is missing or undefined.`,
                        path,
                        step: { id, kind: 'coerce' },
                    });
                }

                let converted: CoerceResult<unknown>;
                try {
                    converted = coerce(current);
                } catch (cause) {
                    return createIssue({
                        cause,
                        code: 'coercion_failed',
                        details: { coercer: coercerName },
                        message: `The ${coercerName} coercer threw while processing ${key}.`,
                        path,
                        step: { id, kind: 'coerce' },
                    });
                }

                if (!converted.ok) {
                    return createIssue({
                        code: 'coercion_failed',
                        details: {
                            ...converted.code === undefined ? {} : { coercerCode: converted.code },
                            coercer: coercerName,
                        },
                        message: converted.message,
                        path,
                        step: { id, kind: 'coerce' },
                    });
                }

                if (Object.is(current, converted.value)) {
                    return next?.(value, changes);
                }

                value[key] = converted.value;
                if (changes !== undefined) {
                    const fromType = valueKind(current);
                    const toType = valueKind(converted.value);
                    if (
                        cachedChange === undefined ||
                        cachedFromType !== fromType ||
                        cachedToType !== toType
                    ) {
                        cachedFromType = fromType;
                        cachedToType = toType;
                        cachedChange = freezeChange({
                            coercer: coercerName,
                            fromType,
                            kind: 'coerce',
                            path,
                            stepId: id,
                            toType,
                        });
                    }
                    changes.push(cachedChange);
                }
                return next?.(value, changes);
            };
        },
        id,
        instruction,
        kind: 'coerce' as const,
        describe(): StepDescription {
            return description;
        },
    });
}

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
import { attachIssueStep, createIssue } from '../core/issue.js';
import type { MissingPolicy } from '../core/options.js';
import type { Path } from '../core/path.js';
import { resolveCoercerInstruction } from '../instructions/coercer-instruction.js';
import { commitSetPathValue } from '../runtime/commit-set-path-value.js';
import { valueKind } from '../runtime/data-record.js';
import { normalizePath } from '../runtime/normalize-path.js';
import { readPath } from '../runtime/read-path.js';

export function createCoercePathStep(
    pathInput: Path,
    coercer: Coercer<unknown, unknown>,
    missing: MissingPolicy,
    id: string,
): ExecutableStep {
    const path = normalizePath(pathInput);
    const coercerName = coercer.name;
    const coerce = coercer.run;
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
        kind: 'coerce-path' as const,
        missing,
        path,
    });

    return Object.freeze({
        compile(next: PlanExecutor | undefined): PlanExecutor {
            let cachedChange: WandChange | undefined;
            let cachedFromType: string | undefined;
            let cachedToType: string | undefined;
            return (value: DataRecord, changes: ChangeCollector): StepOutcome => {
                const read = readPath(value, path);
                if (read.status === 'failed') {
                    return attachIssueStep(read.issue, { id, kind: 'coerce' });
                }
                if (read.status === 'missing' || read.value === undefined) {
                    return missing === 'skip'
                        ? next?.(value, changes)
                        : createIssue({
                            code: 'missing_field',
                            message: 'Cannot coerce the selected path; it is missing or undefined.',
                            path,
                            step: { id, kind: 'coerce' },
                        });
                }

                let converted: CoerceResult<unknown>;
                try {
                    converted = coerce(read.value);
                } catch (cause) {
                    return createIssue({
                        cause,
                        code: 'coercion_failed',
                        details: { coercer: coercerName },
                        message: `The ${coercerName} coercer threw while processing the selected path.`,
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
                if (Object.is(read.value, converted.value)) {
                    return next?.(value, changes);
                }

                const write = commitSetPathValue(value, path, converted.value);
                if (!write.ok) {
                    return attachIssueStep(write.issue, { id, kind: 'coerce' });
                }
                if (changes !== undefined) {
                    const fromType = valueKind(read.value);
                    const toType = valueKind(converted.value);
                    if (cachedChange === undefined || cachedFromType !== fromType ||
                        cachedToType !== toType) {
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

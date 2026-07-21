import type { WandIssueCode } from '../../core/issue/issue-types.js';
import type { StepKind } from '../../core/plan/step-kind.js';
import { sourceString } from './source-string.js';

export interface FailureStepSource {
    readonly id: string;
    readonly kind: StepKind;
}

export interface FailureCallSourceInput {
    readonly cause?: string;
    readonly code: WandIssueCode;
    readonly details?: string;
    readonly message: string;
    readonly path?: string;
    readonly step?: FailureStepSource;
}

/** Compose a call to the generated runtime's positional failure ABI. */
export function failureCallSource(input: FailureCallSourceInput): string {
    const optionalArguments = [
        input.path,
        input.step?.id,
        input.step === undefined ? undefined : sourceString(input.step.kind),
        input.details,
        input.cause,
    ];
    while (optionalArguments.length > 0 && optionalArguments.at(-1) === undefined) {
        optionalArguments.pop();
    }

    const argumentsSource = [
        '$WandError',
        sourceString(input.code),
        input.message,
        ...optionalArguments.map((argument) => argument ?? 'undefined'),
    ];
    return `$fail(${argumentsSource.join(', ')});`;
}

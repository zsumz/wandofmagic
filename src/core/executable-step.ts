import type { WandChange } from './change.js';
import type { DataRecord } from './data-record.js';
import type { StepDescription } from './description.js';
import type { WandIssue } from './issue.js';
import type { OperationInstruction } from '../instructions/operation.js';
import type { ProjectionStep } from './projection-step.js';
import type { StepKind } from './step-kind.js';

export type ChangeCollector = WandChange[] | undefined;
export type PlanExecutor = (value: DataRecord, changes: ChangeCollector) => StepOutcome;
export type StepOutcome = WandIssue | undefined;

/** Internal executable unit produced by an operation factory. */
export interface ExecutableStep {
    readonly id: string;
    readonly instruction: OperationInstruction;
    readonly kind: StepKind;
    readonly projection?: ProjectionStep;
    compile(next: PlanExecutor | undefined): PlanExecutor;
    describe(): StepDescription;
}

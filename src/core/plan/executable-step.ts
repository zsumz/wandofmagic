import type { OperationInstruction } from '../../instructions/path/path-operation.js';
import type { WandChange } from '../change/receipt-types.js';
import type { DataRecord } from '../execution/data-record.js';
import type { WandIssue } from '../issue/issue-types.js';
import type { StepDescription } from './description-types.js';
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

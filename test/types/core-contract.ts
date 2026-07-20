import type {
    SpellDescription,
    StepKind,
    WandChange,
    WandIssueCode,
    WandResult,
} from 'wandofmagic';

function readResult(result: WandResult<{ readonly value: string }>): unknown {
    if (result.ok) {
        return [result.changes, result.value.value];
    }

    return [result.changes, result.issues];
}

function readDescription(description: SpellDescription): unknown {
    return [description.name, description.steps, description.version];
}

function readChange(change: WandChange): unknown {
    switch (change.kind) {
        case 'coerce':
            return [change.coercer, change.fromType, change.path, change.stepId, change.toType];
        case 'default':
        case 'omit':
        case 'set':
        case 'transform':
        case 'trim':
            return [change.path, change.stepId];
        case 'derive':
            return [change.path, change.sources, change.stepId];
        case 'move':
        case 'rename':
            return [change.from, change.stepId, change.to];
        default:
            return assertNever(change);
    }
}

function readIssueCode(code: WandIssueCode): string {
    switch (code) {
        case 'coercion_failed':
        case 'destination_conflict':
        case 'invalid_input':
        case 'missing_field':
        case 'transform_failed':
        case 'unexpected_type':
        case 'unsupported_accessor':
            return code;
        default:
            return assertNever(code);
    }
}

function readStepKind(kind: StepKind): string {
    switch (kind) {
        case 'coerce':
        case 'default':
        case 'derive':
        case 'move':
        case 'omit':
        case 'rename':
        case 'set':
        case 'transform':
        case 'trim':
            return kind;
        default:
            return assertNever(kind);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unexpected contract member: ${String(value)}`);
}

void readChange;
void readDescription;
void readIssueCode;
void readResult;
void readStepKind;

import type { FlatOperationInstruction } from '../../instructions/flat/flat-operation.js';

export function touchesKey(instruction: FlatOperationInstruction, key: string): boolean {
    switch (instruction.kind) {
        case 'coerce':
        case 'default':
        case 'transform':
            return instruction.key === key;
        case 'derive':
            return instruction.key === key || instruction.dependencies.includes(key);
        case 'trim':
        case 'omit':
            return instruction.keys.includes(key);
        case 'rename':
            return instruction.entries.some((entry) =>
                entry.source === key || entry.destination === key);
    }
}

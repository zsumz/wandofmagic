import type { WandError } from '../../../../dist/index.js';

export function captureMapperOutcome(
    run: () => object,
): Readonly<Record<string, unknown>> {
    try {
        const value = run();
        return {
            keys: Object.keys(value),
            nullPrototype: Object.getPrototypeOf(value) === null,
            ok: true,
            value,
        };
    } catch (error) {
        if (!isSerializableWandError(error)) {
            throw error;
        }
        return { error: error.toJSON(), ok: false };
    }
}

function isSerializableWandError(error: unknown): error is WandError {
    return typeof error === 'object'
        && error !== null
        && 'toJSON' in error
        && typeof error.toJSON === 'function';
}

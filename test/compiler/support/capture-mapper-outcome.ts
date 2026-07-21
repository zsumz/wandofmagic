import { WandError } from '../../../src/core/execution/wand-error.js';

export function captureMapperOutcome(run: () => object): string {
    try {
        const value = run();
        return JSON.stringify({
            keys: Object.keys(value),
            nullPrototype: Object.getPrototypeOf(value) === null,
            ok: true,
            value,
        });
    } catch (error) {
        if (error instanceof WandError) {
            return JSON.stringify({ error: error.toJSON(), ok: false });
        }
        throw error;
    }
}

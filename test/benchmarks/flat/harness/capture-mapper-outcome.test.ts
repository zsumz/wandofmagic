import { describe, expect, it } from 'vitest';
import { captureMapperOutcome } from '../../../../scripts/benchmarks/flat/harness/capture-mapper-outcome.mts';

describe('flat benchmark mapper outcome', () => {
    it('captures keys, prototype shape, and value', () => {
        const value = Object.assign(Object.create(null) as object, { answer: 42 });

        expect(captureMapperOutcome(() => value)).toEqual({
            keys: ['answer'],
            nullPrototype: true,
            ok: true,
            value,
        });
    });

    it('serializes WandError-compatible failures', () => {
        const serialized = { message: 'failed', name: 'WandError' };
        const failure = new SerializableFailure(serialized);

        expect(captureMapperOutcome(() => {
            throw failure;
        })).toEqual({ error: serialized, ok: false });
    });

    it('rethrows ordinary failures', () => {
        const failure = new Error('unexpected');

        expect(() => captureMapperOutcome(() => {
            throw failure;
        })).toThrow(failure);
    });
});

class SerializableFailure extends Error {
    readonly #serialized: Readonly<Record<string, unknown>>;

    constructor(serialized: Readonly<Record<string, unknown>>) {
        super(String(serialized['message']));
        this.#serialized = serialized;
    }

    public toJSON(): Readonly<Record<string, unknown>> {
        return this.#serialized;
    }
}

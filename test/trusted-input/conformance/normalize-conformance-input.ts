import { spell } from '../../../src/index.js';
import type { ConformanceInput } from './create-conformance-input.js';

export const normalizeConformanceInput = spell<ConformanceInput>()
    .rename({
        first_name: 'firstName',
        last_name: 'lastName',
        password_hash: 'passwordHash',
    })
    .trim(['firstName', 'lastName', 'email'])
    .coerce('age', {
        name: 'test-number',
        run(value) {
            const converted = Number(value);
            return Number.isFinite(converted)
                ? { ok: true, value: converted }
                : { message: 'Expected a finite number.', ok: false };
        },
    }, { missing: 'skip' })
    .coerce('active', {
        name: 'test-boolean',
        run(value) {
            return value === 'true'
                ? { ok: true, value: true }
                : value === 'false'
                    ? { ok: true, value: false }
                    : { message: 'Expected a boolean string.', ok: false };
        },
    }, { missing: 'skip' })
    .default('active', false)
    .derive('displayName', ['firstName', 'lastName'], ([firstName, lastName]) =>
        [firstName, lastName].filter(Boolean).join(' '))
    .omit(['passwordHash'])
    .build();

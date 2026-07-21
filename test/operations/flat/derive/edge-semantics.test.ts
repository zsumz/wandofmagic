import { describe, expect, it } from 'vitest';
import { spell } from '../../../../src/index.js';

describe('derive edge semantics', () => {
    it('rejects promise-like callback outputs at the runtime boundary', () => {
        const asyncDerive = (async ([value]: readonly [string]) => Promise.resolve(value.toUpperCase())) as unknown as
            (values: readonly [string]) => string;
        const result = spell<{ value: string }>()
            .derive('label', ['value'], asyncDerive)
            .build()
            .safeRun({ value: 'hello' });

        expect(result).toMatchObject({ issues: [{ code: 'transform_failed' }], ok: false });
    });

    it('reports conflicts, missing dependencies, and callback failures', () => {
        const derive = spell<{ source?: string }>()
            .derive('target', ['source'], ([source]) => source.toUpperCase())
            .build();

        expect(
            derive.safeRun({ source: 'x', target: 'existing' } as { source?: string }),
        ).toMatchObject({ issues: [{ code: 'destination_conflict' }], ok: false });
        expect(derive.safeRun({})).toMatchObject({ issues: [{ code: 'missing_field' }], ok: false });

        const throwing = spell<{ source: string }>()
            .derive('target', ['source'], () => {
                throw new Error('derive exploded');
            })
            .build();
        expect(throwing.safeRun({ source: 'x' })).toMatchObject({
            issues: [{ code: 'transform_failed' }],
            ok: false,
        });
    });
});

import { describe, expect, it } from 'vitest';

import { emitTrustedMapperModule } from '../../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('deep omit guardrails', () => {
    it('rejects cycles and unsafe paths and supports static emission', () => {
        interface Cyclic {
            self?: Cyclic;
            secret?: string;
        }
        const node: Cyclic = { secret: 'private' };
        node.self = node;
        const result = spell<{ node: Cyclic }>()
            .omit([['node', 'self', 'secret']])
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });

        // Deliberately bypass the strict API to prove the runtime plan guard.
        const dangerous = ['node', 'constructor'] as unknown as readonly ['node', 'secret'];
        expectPlanError(
            () => spell<{ node: Cyclic }>().omit([dangerous]),
            'dangerous_key',
        );
        const deep = spell<{ node: Cyclic }>().omit([['node', 'secret']]).build();
        expect(emitTrustedMapperModule(deep).mode).toBe('trusted-discard');
    });
});

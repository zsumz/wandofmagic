import { describe, expect, it } from 'vitest';

import { number } from '../../../../src/coerce/builtin/number.js';
import { CompilerError } from '../../../../src/compiler/error/compiler-error.js';
import { emitTrustedMapperModule } from '../../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import { spell } from '../../../../src/index.js';
import { expectPlanError } from '../../../support/expect-plan-error.js';

describe('deep coerce guardrails', () => {
    it('rejects cycles and unsafe paths and fails closed in the static compiler', () => {
        interface Cyclic {
            self?: Cyclic;
            value: string;
        }
        const node: Cyclic = { value: '1' };
        node.self = node;
        const result = spell<{ node: Cyclic }>()
            .coerce(['node', 'self', 'value'], number())
            .build()
            .safeRun({ node });
        expect(result).toMatchObject({
            changes: [],
            issues: [{ code: 'invalid_input', path: ['node', 'self'] }],
            ok: false,
        });

        const dangerous = ['profile', 'constructor'] as unknown as
            readonly ['profile', 'count'];
        expectPlanError(
            () => spell<{ profile: { count: string } }>().coerce(dangerous, number()),
            'dangerous_key',
        );
        const deep = spell<{ profile: { count: string } }>()
            .coerce(['profile', 'count'], number())
            .build();
        expect(() => emitTrustedMapperModule(deep)).toThrow(CompilerError);
    });
});

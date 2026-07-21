import type { ApplyOptionalAddAtRoot, ApplyOptionalizeAtRoot } from './apply-root-conditional.js';
import type { ApplyOmitAtRoot } from './apply-root-omit.js';
import type { ApplyWriteAtRoot } from './apply-root-write.js';
import type { PathTypeOperation } from './operation.js';
import type { RootState } from './root-state.js';

export type ApplyOperationAtRoot<
    State extends RootState,
    Operation extends PathTypeOperation,
> = Operation extends {
    readonly kind: infer Kind extends 'add' | 'replace' | 'require';
    readonly path: readonly [string, ...infer Rest];
    readonly replacement: infer Replacement;
}
    ? ApplyWriteAtRoot<State, Rest, Kind, Replacement>
    : Operation extends { readonly kind: 'omit'; readonly path: readonly [string, ...infer Rest] }
        ? ApplyOmitAtRoot<State, Rest>
        : Operation extends {
            readonly kind: 'optionalize';
            readonly path: readonly [string, ...infer Rest];
        }
            ? ApplyOptionalizeAtRoot<State, Rest>
            : Operation extends {
                readonly kind: 'optional-add';
                readonly path: readonly [string, ...infer Rest];
                readonly replacement: infer Replacement;
            }
                ? ApplyOptionalAddAtRoot<State, Rest, Replacement>
                : State;

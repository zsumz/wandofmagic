import { boolean } from '../../../src/coerce/builtin/boolean.js';
import { isoDate } from '../../../src/coerce/builtin/iso-date.js';
import { number } from '../../../src/coerce/builtin/number.js';
import { string } from '../../../src/coerce/builtin/string.js';
import { defineCoercer } from '../../../src/coerce/types.js';
import { spell } from '../../../src/builder/spell/spell.js';

interface DeepInput {
    readonly metadata: { readonly owner?: string; readonly source?: string };
    readonly profile: {
        readonly active: boolean | string;
        readonly code: bigint | boolean | number | string;
        readonly count: number | string;
        readonly current?: string;
        readonly legacy: string;
        readonly name: string;
        readonly role?: string;
        readonly secret: string;
        readonly stamp: Date | string;
        readonly tag: string;
    };
    readonly rows: Array<{ readonly label: string }>;
}

const tag = defineCoercer<string, string>({
    name: 'tag',
    run(value) {
        return value === 'invalid'
            ? { code: 'invalid_tag', message: 'Tag is invalid.', ok: false }
            : { ok: true, value: String(value).toUpperCase() };
    },
});

const privateSource = Object.freeze({ marker: 'not-serialized' });

export const pathOperationConformanceSpell = spell<DeepInput>()
    .trim([['profile', 'name'], ['rows', 2, 'label']])
    .coerce(['profile', 'count'], number({ integer: true }))
    .coerce(['profile', 'active'], boolean({ caseSensitive: true }))
    .coerce(['profile', 'code'], string())
    .coerce(['profile', 'stamp'], isoDate())
    .coerce(['profile', 'tag'], tag)
    .default(['profile', 'role'], 'user')
    .set(['metadata', 'source'], privateSource)
    .transform(['profile', 'name'], (name) => {
        if (name === 'throw') {
            throw new Error('deep callback failure');
        }
        return name.toUpperCase();
    })
    .copy(['profile', 'name'], ['metadata', 'owner'])
    .move(['profile', 'legacy'], ['profile', 'current'])
    .derive(
        ['summary', 'label'],
        [['profile', 'name'], ['profile', 'count']],
        ([name, count]) => `${name}:${String(count)}`,
    )
    .omit([['profile', 'secret'], ['metadata', 'source']])
    .pick([
        ['profile', 'name'],
        ['profile', 'count'],
        ['profile', 'active'],
        ['profile', 'code'],
        ['profile', 'stamp'],
        ['profile', 'tag'],
        ['profile', 'role'],
        ['profile', 'current'],
        ['metadata', 'owner'],
        ['summary', 'label'],
        ['rows', 2, 'label'],
    ])
    .build();

const valid = createInput();

export const pathOperationConformanceInputs: readonly DeepInput[] = [
    valid,
    createInput({ count: '7.5' }),
    createInput({ active: 'TRUE' }),
    createInput({ stamp: 'invalid' }),
    createInput({ tag: 'invalid' }),
    createInput({ name: 'throw' }),
    createInput({}, { owner: 'existing' }),
    createInput({ current: 'existing' }),
    createInput({}, {}, { label: 'existing' }),
    createAccessorInput(),
    createNullPrototypeInput(),
];

function createInput(
    profileOverrides: Partial<DeepInput['profile']> = {},
    metadata: DeepInput['metadata'] = {},
    summary?: { readonly label?: string },
): DeepInput {
    const rows: Array<{ label: string }> = [];
    rows.length = 3;
    rows[2] = { label: ' row ' };
    return {
        metadata,
        profile: {
            active: 'true',
            code: 42,
            count: '7',
            legacy: 'previous',
            name: ' Ada ',
            secret: 'hidden',
            stamp: '2026-07-20T12:00:00Z',
            tag: 'alpha',
            ...profileOverrides,
        },
        rows,
        ...summary === undefined ? {} : { summary },
    };
}

function createAccessorInput(): DeepInput {
    const input = createInput();
    Object.defineProperty(input.profile, 'count', {
        enumerable: true,
        get() {
            throw new Error('must not execute');
        },
    });
    return input;
}

function createNullPrototypeInput(): DeepInput {
    const root = { ...createInput() };
    Object.setPrototypeOf(root, null);
    return root;
}

export { privateSource };

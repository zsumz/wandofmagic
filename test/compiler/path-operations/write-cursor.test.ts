import { describe, expect, it } from 'vitest';

import { spell } from '../../../src/builder/spell/spell.js';
import { emitTrustedMapperModule } from '../../../src/compiler/trusted-mapper/emit-trusted-mapper.js';
import type { Spell } from '../../../src/core/execution/spell.js';
import { captureMapperOutcome } from '../support/capture-mapper-outcome.js';
import { materializeGeneratedMapper } from '../support/materialize-generated-mapper.js';

describe('static trusted mapper write cursors', () => {
    it('emits an operation-local ancestor for deep stable writes', () => {
        const compiled = spell<DeepInput>()
            .trim([
                ['profile', 'account', 'name'],
                ['profile', 'account', 'contact', 'email'],
            ])
            .transform(
                ['profile', 'account', 'contact', 'email'],
                (email) => email.toLowerCase(),
            )
            .build();
        const source = emitTrustedMapperModule(compiled).source;

        expect(source).toContain('$ownership.get($ownedAncestor) === 1');
        expect(source).toMatch(
            /\$ownership, true, \$trimParent0_0 \?\? \$readPrefix0_\d+\.containers\[2\]/u,
        );
        expect(source).toMatch(
            /\$transformRead1, \$pathTransformed1, \$ownership\);/u,
        );
    });

    it('isolates frozen aliases through a depth-four write', async () => {
        const compiled = createDeepTrim();
        const contact = Object.freeze({ email: ' USER@EXAMPLE.COM ' });
        const account = Object.freeze({ contact, name: ' Name ' });
        const profile = Object.freeze({ account });
        const input = Object.freeze({ mirror: profile, profile });
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);

        expect(generated(input)).toEqual({
            mirror: { account: { contact: { email: ' USER@EXAMPLE.COM ' }, name: ' Name ' } },
            profile: { account: { contact: { email: 'USER@EXAMPLE.COM' }, name: 'Name' } },
        });
        expect(input.profile).toBe(profile);
        expect(input.profile.account.contact.email).toBe(' USER@EXAMPLE.COM ');
    });

    it('rejects accessors encountered while cloning the cursor parent', async () => {
        const compiled = createDeepTrim();
        const contact: { email: string; secret?: string } = { email: ' EMAIL ' };
        Object.defineProperty(contact, 'secret', {
            enumerable: true,
            get: expect.unreachable,
        });
        const input = {
            profile: { account: { contact, name: ' Name ' } },
        };

        await expectGeneratedParity(compiled, input);
        expect(input.profile.account.name).toBe(' Name ');
        expect(input.profile.account.contact.email).toBe(' EMAIL ');
    });

    it('preserves sparse cursor parents', async () => {
        interface SparseInput {
            profile: { label: string; rows: string[] };
        }
        const rows: string[] = [];
        rows.length = 3;
        rows[2] = ' value ';
        const compiled = spell<SparseInput>()
            .trim([['profile', 'label'], ['profile', 'rows', 2]])
            .build();
        const artifact = emitTrustedMapperModule(compiled);
        const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);
        const output = generated({ profile: { label: ' Label ', rows } }) as SparseInput;

        expect(output.profile.label).toBe('Label');
        expect(output.profile.rows[2]).toBe('value');
        expect(0 in output.profile.rows).toBe(false);
        expect(rows[2]).toBe(' value ');
    });

    it('retains cycle rejection before any cursor write', async () => {
        interface CyclicProfile {
            name: string;
            self?: CyclicProfile;
        }
        const profile: CyclicProfile = { name: ' Name ' };
        profile.self = profile;
        const compiled = spell<{ profile: CyclicProfile }>()
            .trim([['profile', 'name'], ['profile', 'self', 'name']])
            .build();

        await expectGeneratedParity(compiled, { profile });
        expect(profile.name).toBe(' Name ');
    });
});

interface DeepInput {
    readonly profile: {
        readonly account: {
            readonly contact: { readonly email: string };
            readonly name: string;
        };
    };
}

function createDeepTrim(): Spell<DeepInput, DeepInput> {
    return spell<DeepInput>()
        .trim([
            ['profile', 'account', 'name'],
            ['profile', 'account', 'contact', 'email'],
        ])
        .build();
}

async function expectGeneratedParity<Input extends object, Output extends object>(
    compiled: Spell<Input, Output>,
    input: Input,
): Promise<void> {
    const artifact = emitTrustedMapperModule(compiled);
    const generated = await materializeGeneratedMapper(artifact.source, artifact.bindings);
    expect(captureMapperOutcome(() => generated(input))).toBe(
        captureMapperOutcome(() => compiled.run(
            input,
            { input: 'trusted', receipt: 'discard' },
        )),
    );
}

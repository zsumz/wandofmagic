import type {
    DeepBenchmarkInput,
    DeepBenchmarkOutput,
} from '../scenario/model.mts';

export function runHandwrittenDeepHappy(input: DeepBenchmarkInput): DeepBenchmarkOutput {
    const first = input.profile.first.trim();
    const last = input.profile.last.trim();
    return {
        profile: {
            first,
            last,
            age: Number(input.profile.age),
            active: input.profile.active === true || input.profile.active === 'true',
            contact: { email: input.profile.contact.legacyEmail.trim().toLowerCase() },
        },
        metadata: { owner: first },
        summary: { displayName: `${first} ${last}` },
    };
}

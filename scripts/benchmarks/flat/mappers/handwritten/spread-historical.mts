import type { BenchmarkInput, BenchmarkOutput } from '../../harness/benchmark-types.mts';

export function runHandwrittenSpreadHistorical(input: BenchmarkInput): BenchmarkOutput {
    const firstName = input.first_name.trim();
    const lastName = input.last_name.trim();
    const output = {
        ...input,
        active: false,
        age: Number(input.age),
        displayName: `${firstName} ${lastName}`,
        email: input.email.trim(),
        firstName,
        lastName,
    };
    Reflect.deleteProperty(output, 'first_name');
    Reflect.deleteProperty(output, 'last_name');
    Reflect.deleteProperty(output, 'password_hash');
    return output;
}

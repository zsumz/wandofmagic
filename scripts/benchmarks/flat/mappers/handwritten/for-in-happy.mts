import type { BenchmarkInput, BenchmarkOutput } from '../../harness/benchmark-types.mts';

export function runHandwrittenForInHappy(input: BenchmarkInput): BenchmarkOutput {
    const output: Record<string, unknown> = {};
    let firstName = '';
    let lastName = '';

    for (const key in input) {
        switch (key) {
            case 'age':
                output['age'] = Number(input.age);
                break;
            case 'email':
                output['email'] = input.email.trim();
                break;
            case 'first_name':
                firstName = input.first_name.trim();
                output['firstName'] = firstName;
                break;
            case 'last_name':
                lastName = input.last_name.trim();
                output['lastName'] = lastName;
                break;
            case 'password_hash':
                break;
            default:
                output[key] = input[key];
        }
    }

    output['active'] = false;
    output['displayName'] = `${firstName} ${lastName}`;
    return output as BenchmarkOutput;
}

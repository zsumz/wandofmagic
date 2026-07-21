export interface ConformanceInput {
    active?: 'false' | 'true';
    age?: string;
    email?: string | null;
    firstName?: string;
    first_name?: string;
    last_name?: string | null;
    password_hash?: string;
    sequence: number;
}

export function createConformanceInput(index: number): ConformanceInput {
    const input = (index % 2 === 0 ? {} : Object.create(null)) as ConformanceInput;
    input.sequence = index;
    if (index % 3 !== 0) {
        input.first_name = ` Ada ${String(index)} `;
    }
    if (index % 4 !== 0) {
        input.last_name = index % 5 === 0 ? null : ` Lovelace ${String(index)} `;
    }
    if (index % 6 === 0) {
        input.firstName = 'existing destination';
    }
    if (index % 7 !== 0) {
        input.age = index % 11 === 0 ? 'invalid' : String(index);
    }
    if (index % 8 !== 0) {
        input.active = index % 2 === 0 ? 'true' : 'false';
    }
    if (index % 9 !== 0) {
        input.email = index % 10 === 0 ? null : ` user-${String(index)}@example.com `;
    }
    if (index % 5 !== 0) {
        input.password_hash = `secret-${String(index)}`;
    }
    return input;
}

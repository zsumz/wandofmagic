import {
    spell,
    type Spell,
} from '../../../src/index.js';

interface ProjectedInput {
    firstName?: string;
    first_name?: string;
    keep: number;
    passwordHash?: string;
    password_hash?: string;
}

interface ProjectedOutput {
    firstName?: string;
    keep: number;
}

export function createProjectedSpell(): Spell<ProjectedInput, ProjectedOutput> {
    return spell<ProjectedInput>()
        .rename({ first_name: 'firstName', password_hash: 'passwordHash' })
        .trim(['firstName'])
        .omit(['passwordHash'])
        .build();
}

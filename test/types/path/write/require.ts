import type { RequireAtPath } from 'wandofmagic';

import type { PathExample } from '../model.js';

type RequiredAge = RequireAtPath<PathExample, readonly ['profile', 'age'], number>;
declare const requiredAge: RequiredAge;
const presentProfile: { readonly age: number; readonly name: string } = requiredAge.profile;
const presentProfileAge: number = requiredAge.profile.age;
void [presentProfile, presentProfileAge];

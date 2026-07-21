import type { InferOutput } from 'wandofmagic';

import type { User } from './model.js';
import type { normalize } from './program.js';

declare const inferredOutput: InferOutput<typeof normalize>;
const inferredIsAssignableToExpected: User = inferredOutput;
void inferredIsAssignableToExpected;

declare const expectedOutput: User;
const expectedIsAssignableToInferred: InferOutput<typeof normalize> = expectedOutput;
void expectedIsAssignableToInferred;

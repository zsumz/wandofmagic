import type { ProgramOutput } from './program.js';
import type { SequentialOutput } from './sequential.js';

declare const sequentialOutput: SequentialOutput;
declare const programOutput: ProgramOutput;
const programMatchesSequential: SequentialOutput = programOutput;
const sequentialMatchesProgram: ProgramOutput = sequentialOutput;
void [programMatchesSequential, sequentialMatchesProgram];

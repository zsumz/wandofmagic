import { emitTrustedMapperModule, type TrustedMapperModule } from 'wandofmagic/compiler';

import { normalize } from './program.js';

const generatedArtifact: TrustedMapperModule = emitTrustedMapperModule(normalize);
void generatedArtifact;

import {
    TRUSTED_MAPPER_FORMAT_VERSION,
    emitTrustedMapperModule,
    type TrustedMapperModule,
} from 'wandofmagic/compiler';

import { normalize } from './program.js';

const generatedArtifact: TrustedMapperModule = emitTrustedMapperModule(normalize);
const generatedFormat: 1 = generatedArtifact.formatVersion;
const supportedFormat: 1 = TRUSTED_MAPPER_FORMAT_VERSION;
void generatedFormat;
void supportedFormat;
void generatedArtifact;

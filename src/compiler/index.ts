export { CompilerError, type CompilerErrorCode } from './compiler-error.js';
export type {
    MapperBindingDescription,
    MapperBindingKind,
    TrustedMapperModule,
} from './trusted-mapper/emitted-mapper.js';
export { TRUSTED_MAPPER_FORMAT_VERSION } from './trusted-mapper/emitted-mapper.js';
export { emitTrustedMapperModule } from './trusted-mapper/emit-trusted-mapper.js';

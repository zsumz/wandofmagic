import type { TypeBenchmarkConfig } from '../harness/type-benchmark-config.mts';
import { pathOperationUtility } from './path-operation/select-path-operation.mts';

export function fixtureImportSource(config: TypeBenchmarkConfig): string {
    const selectedUtilities = config.selectedOperation === undefined
        ? ['ReplaceAtPath', 'RequireAtPath', 'AddAtPath', 'OmitAtPath']
        : [pathOperationUtility(config.selectedOperation)];
    const importedUtilities = config.chainMode === 'builder'
        ? ['InferOutput', 'PathOf', ...selectedUtilities]
        : ['PathOf', ...selectedUtilities];
    const imports = importedUtilities.sort().map((name) => `    ${name},`).join('\n');
    return `${chainImportSource(config)}import type {
${imports}
} from 'wandofmagic';`;
}

function chainImportSource(config: TypeBenchmarkConfig): string {
    if (config.chainMode === 'program') {
        return `import type {
    AppendPathTypeOperation,
    EvaluatePathTypeOperations,
} from 'wandofmagic/internal/path-program';\n\n`;
    }
    return config.chainMode === 'builder'
        ? `import { spell } from 'wandofmagic';
import { number } from 'wandofmagic/coerce';\n`
        : '';
}

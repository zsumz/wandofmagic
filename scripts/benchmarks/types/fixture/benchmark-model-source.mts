import { nestedField } from './fixture-paths.mts';

export function benchmarkModelSource(operationCount: number): string {
    const fields = Array.from({ length: operationCount }, (_, index) =>
        `    field${String(index)}?: ${nestedField(2)};`).join('\n');
    return `interface RecursiveNode {
    child?: RecursiveNode;
    value?: string;
}

interface BenchmarkModel {
${fields}
    recursive?: RecursiveNode;
}`;
}

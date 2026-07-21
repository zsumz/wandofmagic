import { findDependencyCycles } from './find-dependency-cycles.mts';
import { createRuntimeDependencyGraph } from './runtime-dependency-graph.mts';

export async function inspectRuntimeDependencyCycles(
    root: string,
    sourceRoot: string,
    files: readonly string[],
): Promise<string[]> {
    const graph = await createRuntimeDependencyGraph(root, sourceRoot, files);
    return findDependencyCycles(graph).map(
        (cycle) => `src: circular dependency ${cycle.join(' -> ')}`,
    );
}

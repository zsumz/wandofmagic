export function nestedField(level: number): string {
    if (level > 7) {
        return '{ retained: boolean; value?: string }';
    }
    return `{ level${String(level)}?: ${nestedField(level + 1)}; retained: boolean; value?: string }`;
}

export function existingPath(index: number, depth: number): string {
    return tuplePath(index, depth, 'value');
}

export function additionPath(index: number, depth: number): string {
    return depth === 1 ? `readonly ['added${String(index)}']` : tuplePath(index, depth, 'added');
}

export function movedPath(index: number, depth: number): string {
    return depth === 1 ? `readonly ['moved${String(index)}']` : tuplePath(index, depth, 'moved');
}

function tuplePath(index: number, depth: number, leaf: string): string {
    const segments = [`'field${String(index)}'`];
    for (let level = 2; level < depth; level += 1) {
        segments.push(`'level${String(level)}'`);
    }
    if (depth > 1) {
        segments.push(`'${leaf}'`);
    }
    return `readonly [${segments.join(', ')}]`;
}

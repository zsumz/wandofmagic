export function pathName(index: number): string {
    return `$path${String(index)}`;
}

export function readPathName(pathIndex: number, prefixIndex?: number): string {
    return prefixIndex === undefined
        ? `$readPath${String(pathIndex)}`
        : `$readPath${String(pathIndex)}From${String(prefixIndex)}`;
}

export function readPrefixName(index: number): string {
    return `$readPrefix${String(index)}`;
}

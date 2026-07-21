export function valueKind(value: unknown): string {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'array';
    }
    if (value instanceof Date) {
        return 'date';
    }
    return typeof value;
}

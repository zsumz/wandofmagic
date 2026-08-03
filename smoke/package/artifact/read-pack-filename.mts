export function readPackFilename(value: unknown): string {
    const results = Array.isArray(value)
        ? value
        : packageResults(value);
    if (results.length !== 1) {
        throw new TypeError('npm pack returned an invalid result.');
    }
    const result: unknown = results[0];
    if (typeof result !== 'object' || result === null
        || !('filename' in result) || typeof result.filename !== 'string') {
        throw new TypeError('npm pack did not return a filename.');
    }
    return result.filename;
}

function packageResults(value: unknown): readonly unknown[] {
    if (typeof value !== 'object' || value === null) {
        return [];
    }
    return Object.values(value);
}

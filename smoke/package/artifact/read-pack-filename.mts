export function readPackFilename(value: unknown): string {
    if (!Array.isArray(value) || value.length !== 1) {
        throw new TypeError('npm pack returned an invalid result.');
    }
    const result: unknown = value[0];
    if (typeof result !== 'object' || result === null
        || !('filename' in result) || typeof result.filename !== 'string') {
        throw new TypeError('npm pack did not return a filename.');
    }
    return result.filename;
}

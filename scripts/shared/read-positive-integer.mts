export type Environment = Readonly<Record<string, string | undefined>>;

export function readPositiveInteger(
    name: string,
    fallback: number,
    environment: Environment = process.env,
): number {
    const raw = environment[name];
    if (raw === undefined) {
        return fallback;
    }

    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new TypeError(`${name} must be a positive integer.`);
    }
    return value;
}

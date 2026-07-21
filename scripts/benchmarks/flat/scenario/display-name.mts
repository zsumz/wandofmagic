export function deriveDisplayName(values: readonly unknown[]): string {
    const [firstName, lastName] = values as readonly [string, string];
    return `${firstName} ${lastName}`;
}

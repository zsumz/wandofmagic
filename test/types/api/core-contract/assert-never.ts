export function assertNever(value: never): never {
    throw new Error(`Unexpected contract member: ${String(value)}`);
}

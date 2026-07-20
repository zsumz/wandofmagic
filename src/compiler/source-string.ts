/** Render a structural string as a JavaScript literal without accepting arbitrary source text. */
export function sourceString(value: string): string {
    return JSON.stringify(value);
}

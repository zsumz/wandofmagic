/** Render emitter-controlled data as a JavaScript literal without accepting arbitrary source. */
export function sourceString(value: string): string {
    return JSON.stringify(value);
}

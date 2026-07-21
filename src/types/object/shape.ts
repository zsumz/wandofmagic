/** Flatten intersections so editor hovers stay readable. */
export type Simplify<Value> = { [Key in keyof Value]: Value[Key] } & {};

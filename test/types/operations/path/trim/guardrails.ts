import { spell } from 'wandofmagic';

interface Model {
    readonly profile: { readonly age: number; readonly name: string };
}

// @ts-expect-error -- deep trim paths must resolve to strings, null, or undefined.
spell<Model>().trim([['profile', 'age']]);

// @ts-expect-error -- deep trim paths must be known.
spell<Model>().trim([['profile', 'missing']]);

// @ts-expect-error -- dangerous path segments are rejected.
spell<Model>().trim([['profile', '__proto__']]);

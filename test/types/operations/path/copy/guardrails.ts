import { spell } from 'wandofmagic';

interface Model {
    readonly profile: { readonly name: string };
}

// @ts-expect-error -- copy sources must be known paths.
spell<Model>().copy(['missing', 'value'], ['profile', 'copy']);

// @ts-expect-error -- dangerous destination segments are rejected statically.
spell<Model>().copy(['profile', 'name'], ['__proto__', 'name']);

// @ts-expect-error -- copy destinations must retain literal tuple segments.
spell<Model>().copy(['profile', 'name'], ['profile', 'copy'] as string[]);

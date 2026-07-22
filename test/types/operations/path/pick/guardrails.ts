import { spell } from 'wandofmagic';

interface Model {
    readonly id: string;
    readonly profile: { readonly name: string };
}

// @ts-expect-error -- pick requires at least one path.
spell<Model>().pick([]);

// @ts-expect-error -- top-level selections must be known fields.
spell<Model>().pick(['missing']);

// @ts-expect-error -- deep selections must be known paths.
spell<Model>().pick([['profile', 'missing']]);

// @ts-expect-error -- dangerous paths are rejected statically.
spell<Model>().pick([['__proto__', 'name']]);

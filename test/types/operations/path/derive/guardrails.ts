import { spell } from 'wandofmagic';

interface Model {
    readonly profile: { readonly first: string; readonly label?: string };
}

// @ts-expect-error -- a deep derive destination cannot already be a known path.
spell<Model>().derive(['profile', 'label'], [['profile', 'first']], ([first]) => first);

// @ts-expect-error -- dependencies must be known paths.
spell<Model>().derive(['profile', 'next'], [['profile', 'missing']], ([value]) => value);

// @ts-expect-error -- derive requires at least one dependency.
spell<Model>().derive(['profile', 'next'], [], () => 'value');

// @ts-expect-error -- the synchronous core rejects promise-like callback outputs.
spell<Model>().derive(
    ['profile', 'next'],
    [['profile', 'first']],
    async ([first]) => {
        await Promise.resolve();
        return first;
    },
);

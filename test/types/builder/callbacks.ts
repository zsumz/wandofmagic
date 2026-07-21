import { spell } from 'wandofmagic';

interface Input {
    profile: {
        name: string;
        tags: string[];
    };
}

spell<Input>().transform('profile', (profile) => {
    // @ts-expect-error -- callback inputs are deeply readonly to discourage input mutation.
    profile.name = 'mutated';
    // @ts-expect-error -- nested arrays are readonly inside callbacks.
    profile.tags[0] = 'mutated';

    return { name: profile.name, tags: [...profile.tags] };
});

spell<Input>().derive('label', ['profile'], ([profile]) => {
    // @ts-expect-error -- derive dependencies are deeply readonly.
    profile.name = 'mutated';
    return profile.name;
});

// @ts-expect-error -- the core is synchronous and transform callbacks cannot return promises.
spell<Input>().transform('profile', async (profile) => {
    await Promise.resolve();
    return profile;
});

// @ts-expect-error -- the core is synchronous and derive callbacks cannot return promises.
spell<Input>().derive('copy', ['profile'], async ([profile]) => {
    await Promise.resolve();
    return profile;
});

import {
    type InputPolicy,
    type ReceiptPolicy,
    type RunOptions,
    spell,
    wand,
} from 'wandofmagic';

const input: InputPolicy = 'trusted';
const receipt: ReceiptPolicy = 'discard';
const options: RunOptions = { input, receipt };
const normalize = spell<{ label: string }>().trim(['label']).build();

normalize.run({ label: '  ready  ' }, options);
normalize.safeRun({ label: '  ready  ' }, options);
wand({ label: '  ready  ' }).trim(['label']).result(options);
wand({ label: '  ready  ' }).trim(['label']).value(options);

// @ts-expect-error -- receipt allocation uses an explicit literal policy.
normalize.safeRun({ label: 'ready' }, { receipt: 'retain' });

// @ts-expect-error -- trusted input execution requires an explicit supported policy.
normalize.run({ label: 'ready' }, { input: 'assumed' });

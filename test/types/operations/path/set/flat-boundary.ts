import { spell } from 'wandofmagic';

const flatBoundary = spell<Record<never, never>>()
    .set('label', '  ready  ')
    .trim(['label'])
    .build();
const flatBoundaryLabel: string = flatBoundary.run({}).label;
void flatBoundaryLabel;

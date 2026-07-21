import type { SpellDescription } from 'wandofmagic';

function readDescription(description: SpellDescription): unknown {
    return [description.name, description.steps, description.version];
}

void readDescription;

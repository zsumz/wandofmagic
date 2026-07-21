import { wand } from 'wandofmagic';

const oneOff = wand({ stable: true }).set(['metadata', 'source'], 'wand').value();
const oneOffSource: 'wand' = oneOff.metadata.source;
void oneOffSource;

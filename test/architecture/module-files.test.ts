import { describe, expect, it } from 'vitest';
import { isJavaScriptModule } from '../../scripts/architecture/module/module-files.mts';

describe('owned module extensions', () => {
    it.each(['config.js', 'script.mjs', 'entry.cjs'])(
        'recognizes JavaScript module %s',
        (name) => {
            expect(isJavaScriptModule(name)).toBe(true);
        },
    );

    it.each(['config.mts', 'source.ts', 'package.json'])(
        'allows non-JavaScript module %s',
        (name) => {
            expect(isJavaScriptModule(name)).toBe(false);
        },
    );
});

import type { NpmFixture, PathRef, SmokeContext } from 'smoque';

import { typeConsumerSource } from './type-consumer-source.mts';

export async function checkTypeConsumers(
    t: SmokeContext,
    root: PathRef,
    fixture: NpmFixture,
): Promise<void> {
    const compiler = root.path('node_modules', 'typescript', 'bin', 'tsc');
    await Promise.all([
        t.fs.writeText(fixture.path('consumer.mts'), typeConsumerSource),
        t.fs.writeText(fixture.path('consumer.cts'), typeConsumerSource),
        t.fs.writeText(fixture.path('bundler.ts'), typeConsumerSource),
    ]);

    await t.step('installed declarations compile for NodeNext ESM and CommonJS', async () => {
        await t.cmd('node', [
            compiler,
            '--module', 'NodeNext',
            '--moduleResolution', 'NodeNext',
            '--noEmit',
            '--skipLibCheck', 'false',
            '--strict',
            '--target', 'ES2022',
            'consumer.mts',
            'consumer.cts',
        ], { cwd: fixture.path() });
    });
    await t.step('installed declarations compile for bundlers', async () => {
        await t.cmd('node', [
            compiler,
            '--module', 'ESNext',
            '--moduleResolution', 'Bundler',
            '--noEmit',
            '--skipLibCheck', 'false',
            '--strict',
            '--target', 'ES2022',
            'bundler.ts',
        ], { cwd: fixture.path() });
    });
}

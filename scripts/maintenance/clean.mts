import { rm } from 'node:fs/promises';

const generatedDirectories = ['.cache', 'coverage', 'dist'];

await Promise.all(generatedDirectories.map(async (directory) => {
    await rm(new URL(`../../${directory}`, import.meta.url), { force: true, recursive: true });
}));

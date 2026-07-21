const version = process.env.npm_package_version ?? '';
const tag = process.env.npm_config_tag ?? 'latest';

if (version === '0.0.0') {
    console.error('wandofmagic@0.0.0 is a repository-only development version and cannot be published.');
    process.exitCode = 1;
} else if (version.includes('-') && tag !== 'alpha') {
    console.error('Publish prereleases with --tag alpha.');
    process.exitCode = 1;
}

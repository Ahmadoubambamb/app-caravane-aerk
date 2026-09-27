import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiBaseUrl = process.env.API_BASE_URL?.trim();
if (!apiBaseUrl) {
  throw new Error('API_BASE_URL must be set to the deployed Spring Boot service URL.');
}

const parsedUrl = new URL(apiBaseUrl);
if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') {
  throw new Error('API_BASE_URL must use HTTPS outside local development.');
}

execFileSync(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'build', '--configuration', 'production'], {
  stdio: 'inherit',
});

const runtimeConfigPath = resolve('dist/front-end/browser/runtime-config.js');
writeFileSync(
  runtimeConfigPath,
  `window.AERK_CONFIG = ${JSON.stringify({ apiBaseUrl: apiBaseUrl.replace(/\/+$/, '') })};\n`,
);

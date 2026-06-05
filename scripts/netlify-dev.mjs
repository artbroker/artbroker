import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const appData = resolve('.netlify-local-config/AppData');
const localAppData = resolve('.netlify-local-config/LocalAppData');

mkdirSync(appData, { recursive: true });
mkdirSync(localAppData, { recursive: true });

const env = {
  ...process.env,
  APPDATA: appData,
  LOCALAPPDATA: localAppData,
  ASTRO_TELEMETRY_DISABLED: '1',
  NETLIFY_CLI_DISABLE_UPDATE_CHECK: '1',
};

const command = process.platform === 'win32' ? 'netlify.cmd' : 'netlify';
const args = process.argv.slice(2);
const child = spawn(command, args.length ? args : ['dev'], {
  env,
  shell: false,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

import { ask } from '@tauri-apps/plugin-dialog';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { appName } from './client';
import { listen } from '@tauri-apps/api/event';

export async function checkForUpdates() {
  const update = await check();
  console.log('update', update);

  if (update) {
    console.log('New update available:', update);

    const releaseNotes = (update.body || 'Bug fixes')
      .split('\n')
      .filter(line => line.trim())
      .map(line => `  • ${line}`)
      .join('\n');

    const yes = await ask(
      `${await appName()} ${update.version} is now available -- you have ${update.currentVersion}.

Release notes:
${releaseNotes}
`,
      {
        title: 'New Version Available',
        kind: 'info',
        okLabel: 'Upgrade Now',
        cancelLabel: 'Later',
      },
    );

    if (yes) {
      await update.downloadAndInstall();
      await relaunch();
    }
  }
}

await listen('tauri://update', event => {
  console.log('Update event received:', event);
});

import { ask } from '@tauri-apps/plugin-dialog';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { appName } from './client';

export async function checkForUpdates() {
  const update = await check();
  console.log('check-for-update response:', update);

  if (update) {
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

import { ask } from '@tauri-apps/plugin-dialog';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { getName } from '@tauri-apps/api/app';
import { useSettingsStore } from './stores/settings';
import { toast } from 'vue3-toastify';

export async function checkForUpdates() {
  const update = await check();
  console.log({ update });

  const settings = useSettingsStore();
  settings.clearUpdateAvailable();

  if (update) {
    settings.setUpdateAvailable(update.version, update.currentVersion);
    const releaseNotes = (update.body || 'Bug fixes')
      .split('\n')
      .filter(line => line.trim())
      .map(line => `  • ${line}`)
      .join('\n');

    const appName: string = await getName();

    const yes = await ask(
      `${appName} ${update.version} is now available -- you have ${update.currentVersion}.

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
      doUpdate(update);
    }
  }
}

async function doUpdate(update: Update) {
  await update.downloadAndInstall(progress => {
    switch (progress.event) {
      case 'Started':
        toast.info('Downloading update...', {
          autoClose: false,
        });
        break;
      case 'Progress':
        break;
      case 'Finished':
        toast.success('Update installed!');
        break;
    }
  });
  await relaunch();
}

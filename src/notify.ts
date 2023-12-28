import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";

async function canNotify() {
  return isPermissionGranted();
}

export async function requestNotificationPermission() {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === "granted";
  }
}

export async function notify(title: string, body: string) {
  const permissionGranted = await canNotify();

  if (!permissionGranted) {
    return;
  }

  sendNotification({
    title,
    body,
  });
}

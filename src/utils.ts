import { invoke } from "@tauri-apps/api";
import { useLogStore } from "./stores/logs";
import { useSettingsStore } from "./stores/settings";
import { useUserStore } from "./stores/user";

export async function lichessFetch(
  path: string,
  options?: object,
): Promise<Response> {
  const settings = useSettingsStore();
  const user = useUserStore();

  return fetch(`${settings.lichessUrl}${path}`, {
    headers: new Headers({
      Authorization: `Bearer ${user.accessToken?.access_token}`,
      // "User-Agent": `${system.uaPrefix()} as:${user.username?.toLowerCase() ?? "anon"}`,
    }),
    ...options,
  }).then((response) => {
    if (!response.ok) handleFetchError(response);

    return response;
  });
}

function handleFetchError(response: Response) {
  const logs = useLogStore();

  if (response.status === 401) {
    logs.error(
      "Error: Invalid/expired session. Please log out and log back in.",
    );
  } else {
    logs.error(`Error: ${response.status} ${response.statusText} - ${response.body}`);
  }

  throw new Error(`${response.status} ${response.statusText}`);
}

export async function openPath(path: string) {
  await invoke("open_path", { path });
}

export function timestampToLocalDatetime(timestamp?: number) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export function relativeTimeDisplay(timestamp?: number) {
  if (!timestamp) {
    return "";
  }

  const then = new Date(timestamp).getTime();
  const deltaSeconds = Math.round((then - Date.now()) / 1000);

  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];
  const units: Intl.RelativeTimeFormatUnit[] = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
  ];
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds),
  );
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

export function delayDisplay(delay?: number): string {
  if (!delay) {
    return "";
  }

  return [
    {
      value: Math.floor(delay / 60),
      label: "minute",
    },
    {
      value: delay % 60,
      label: "second",
    },
  ]
    .filter(({ value }) => value > 0)
    .map(({ value, label }) => {
      return `${value} ${label}${value > 1 ? "s" : ""}`;
    })
    .join(" ");
}

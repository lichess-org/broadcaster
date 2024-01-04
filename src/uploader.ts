import { readTextFile } from "@tauri-apps/api/fs";
import { useLogStore } from "./stores/logs";
import { useQueueStore } from "./stores/queue";
import { PgnPushResponse } from "./types";
import { lichessFetch } from "./utils";

export async function startQueueWorker() {
  const queue = useQueueStore();

  while (true) {
    const toUpload = queue.next();

    if (toUpload) {
      await uploadPgnToLichess(toUpload.roundId, toUpload.path);
      queue.remove(toUpload);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function uploadPgnToLichess(roundId: string, path: string) {
  const pgn = await readTextFile(path);

  const now = new Date();
  return lichessFetch(`/api/broadcast/round/${roundId}/push`, {
    method: "POST",
    body: pgn,
  })
    .then((response) => response.json() as Promise<PgnPushResponse>)
    .then((data) => {
      const durationMs = new Date().getTime() - now.getTime();
      const logs = useLogStore();
      logs.info(`Uploaded: ${data.moves} moves in ${durationMs}ms from ${path}`, "blue");
      logs.files.add(path);
      logs.moveCount += data.moves;
    });
}

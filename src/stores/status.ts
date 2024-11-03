import { UnlistenFn } from '@tauri-apps/api/event';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';

type Status = 'Idle' | 'Broadcasting';

interface WatchProcess {
  folder: string;
  unlisten: UnlistenFn;
}

export const useStatusStore = defineStore('status', () => {
  const rounds = ref<
    {
      tourId: string;
      roundId: string;
      watchProcess: WatchProcess;
      hasMultiGamePgn?: boolean;
    }[]
  >([]);

  const hasRound = (roundId: string) => {
    return rounds.value.some(round => round.roundId === roundId);
  };

  const hasTournament = (tourId: string) => {
    return rounds.value.some(round => round.tourId === tourId);
  };

  const activeCount = computed(() => rounds.value.length);

  const friendly = computed<Status>(() => {
    if (activeCount.value > 0) return 'Broadcasting';
    return 'Idle';
  });

  const getRound = (roundId: string) => {
    return rounds.value.find(round => round.roundId === roundId);
  };

  const startRound = (tourId: string, roundId: string, folder: string, unlisten: UnlistenFn) => {
    rounds.value.push({
      tourId,
      roundId,
      watchProcess: {
        folder,
        unlisten,
      },
    });
  };

  const stopRound = (roundId: string) => {
    const round = getRound(roundId);
    if (round) {
      round.watchProcess.unlisten();
    }

    rounds.value = rounds.value.filter(round => round.roundId !== roundId);
  };

  const setRoundHasMultiGamePgn = (roundId: string) => {
    const round = getRound(roundId);
    if (round) {
      round.hasMultiGamePgn = true;
    }
  };

  const roundHasMultiGamePgn = (roundId: string): boolean => {
    const round = getRound(roundId);
    return round?.hasMultiGamePgn ?? false;
  };

  return {
    activeCount,
    friendly,
    getRound,
    hasRound,
    hasTournament,
    startRound,
    stopRound,
    setRoundHasMultiGamePgn,
    roundHasMultiGamePgn,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStatusStore, import.meta.hot));
}

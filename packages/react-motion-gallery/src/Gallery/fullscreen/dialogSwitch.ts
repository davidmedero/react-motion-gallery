export type FullscreenDialogSwitch = {
  id: number;
  overlay: HTMLDivElement | null;
  durationMs: number;
  easing: string;
  claimed: boolean;
  waiters: Set<(claimed: boolean) => void>;
};

let activeSwitch: FullscreenDialogSwitch | null = null;
let nextSwitchId = 1;

function resolveWaiters(
  switchState: FullscreenDialogSwitch,
  claimed: boolean
) {
  const waiters = Array.from(switchState.waiters);
  switchState.waiters.clear();
  waiters.forEach((resolve) => resolve(claimed));
}

export function beginFullscreenDialogSwitch(args: {
  overlay: HTMLDivElement | null;
  durationMs: number;
  easing: string;
}) {
  if (activeSwitch && !activeSwitch.claimed) {
    resolveWaiters(activeSwitch, false);
  }

  activeSwitch = {
    id: nextSwitchId++,
    overlay: args.overlay,
    durationMs: args.durationMs,
    easing: args.easing,
    claimed: false,
    waiters: new Set(),
  };

  return activeSwitch;
}

export function claimFullscreenDialogSwitch() {
  const switchState = activeSwitch;
  if (!switchState || switchState.claimed) return null;

  switchState.claimed = true;
  resolveWaiters(switchState, true);
  return switchState;
}

export function getActiveFullscreenDialogSwitch() {
  return activeSwitch && !activeSwitch.claimed ? activeSwitch : null;
}

export function waitForFullscreenDialogSwitchClaim(
  switchState: FullscreenDialogSwitch,
  timeoutMs: number
) {
  if (switchState.claimed) return Promise.resolve(true);

  const timeout = Math.max(0, timeoutMs);

  return new Promise<boolean>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = (claimed: boolean) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      switchState.waiters.delete(finish);
      resolve(claimed);
    };

    switchState.waiters.add(finish);

    timer = setTimeout(() => {
      finish(switchState.claimed);
    }, timeout);
  });
}

export function cancelFullscreenDialogSwitch(
  switchState: FullscreenDialogSwitch
) {
  if (activeSwitch?.id !== switchState.id) return;
  resolveWaiters(switchState, false);
  activeSwitch = null;
}

export function finishFullscreenDialogSwitch(
  switchState: FullscreenDialogSwitch
) {
  if (activeSwitch?.id !== switchState.id) return;
  activeSwitch = null;
}

export function resetFullscreenDialogSwitchForTests() {
  if (activeSwitch) {
    resolveWaiters(activeSwitch, false);
  }
  activeSwitch = null;
}

import { useCallback, useRef } from "react";

export function useWheelLock(wheelLockMs = 140) {
  const wheelIgnoreUntilTsRef = useRef(0);
  const lastWheelSeenTsRef = useRef(0);

  const lockWheelFor = useCallback(
    (ms = wheelLockMs) => {
      const now = performance.now();
      wheelIgnoreUntilTsRef.current = Math.max(
        wheelIgnoreUntilTsRef.current,
        now + ms
      );
    },
    [wheelLockMs]
  );

  const unlockWheelNow = useCallback(() => {
    wheelIgnoreUntilTsRef.current = 0;
  }, []);

  const markWheelSeen = useCallback((now = performance.now()) => {
    lastWheelSeenTsRef.current = now;
    return now;
  }, []);

  const isWheelLocked = useCallback(
    (now = performance.now()) => now < wheelIgnoreUntilTsRef.current,
    []
  );

  return {
    wheelLockMs,
    lockWheelFor,
    unlockWheelNow,
    markWheelSeen,
    isWheelLocked,
  };
}


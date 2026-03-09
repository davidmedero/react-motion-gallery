'use client';

import * as React from 'react';
import type {
  VideoRuntimeRegistration,
  VideoSnapshotStore,
} from '../video/videoSnapshotStore';

export type RmgSlideContextValue = {
  normIdx: number;
  isClone: boolean;
  registerVideoRuntime?: (runtime: VideoRuntimeRegistration | null) => void;
  videoSnapshotStore?: VideoSnapshotStore;
};

const RmgSlideContext = React.createContext<RmgSlideContextValue | null>(null);

export function RmgSlideProvider({
  value,
  children,
}: {
  value: RmgSlideContextValue;
  children: React.ReactNode;
}) {
  return <RmgSlideContext.Provider value={value}>{children}</RmgSlideContext.Provider>;
}

export function useRmgSlide() {
  return React.useContext(RmgSlideContext);
}

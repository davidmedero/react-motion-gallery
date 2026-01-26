'use client';

import * as React from 'react';

export type RmgSlideContextValue = {
  normIdx: number;
  isClone: boolean;
  registerPlyr?: (api: any | null) => void;
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
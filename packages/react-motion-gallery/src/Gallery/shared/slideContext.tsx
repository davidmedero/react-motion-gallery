'use client';

import * as React from 'react';
import type { APITypes } from 'plyr-react';
import type { RmgSlideStoreBag } from './slideStoreBag';

export type RmgSlideContextValue = {
  normIdx: number;
  isClone: boolean;
  storeBag?: RmgSlideStoreBag;
  registerApiByIndex?: (index: number, api: APITypes | null) => void;
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

'use client';

import * as React from 'react';
import type { APITypes } from 'plyr-react';
import type { SliderIndexChannel } from '../slider/sliderSub';
import type { RmgSlideStoreBag } from './slideStoreBag';

export type RmgSlideContextValue = {
  normIdx: number;
  isClone: boolean;
  storeBag?: RmgSlideStoreBag;
  indexChannel?: SliderIndexChannel;
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

"use client";

import * as React from "react";

export type MasonryLayoutSeed = {
  scopeId?: string;
  initialHeights?: ReadonlyArray<number | undefined>;
  responsiveCss?: string;
  shellReserveCss?: string;
  shellReserveSafariCss?: string;
};

const MasonryLayoutSeedContext = React.createContext<MasonryLayoutSeed | null>(null);

export function MasonryLayoutSeedProvider(props: {
  value: MasonryLayoutSeed | null;
  children: React.ReactNode;
}) {
  return (
    <MasonryLayoutSeedContext.Provider value={props.value}>
      {props.children}
    </MasonryLayoutSeedContext.Provider>
  );
}

export function useMasonryLayoutSeed() {
  return React.useContext(MasonryLayoutSeedContext);
}

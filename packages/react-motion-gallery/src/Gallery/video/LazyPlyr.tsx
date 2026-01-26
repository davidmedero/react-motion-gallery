/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';

function resolvePlyrComponent(mod: any) {
  return mod?.Plyr ?? mod?.default?.Plyr ?? mod?.default;
}

const LazyPlyr = React.lazy(async () => {
  const mod = await import('plyr-react');
  const Comp = resolvePlyrComponent(mod);

  if (!Comp) {
    throw new Error(
      `LazyPlyr: could not resolve Plyr component from plyr-react import. Keys: ${Object.keys(mod ?? {}).join(
        ', '
      )}`
    );
  }

  return { default: Comp };
}) as unknown as React.ComponentType<any>;

export const Plyr = React.forwardRef<any, any>(function PlyrForwarded(props, ref) {
  return <LazyPlyr {...props} ref={ref} />;
});
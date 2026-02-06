'use client';

import * as React from 'react';

type Props = {
  setMountEl: (el: HTMLDivElement | null) => void;
  style?: React.CSSProperties;
  className?: string;
};

export function FsEntryOverlayMount({ setMountEl, style, className }: Props) {
  return (
    <div
      ref={setMountEl}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        ...style,
      }}
    />
  );
}
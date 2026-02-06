'use client';

import * as React from 'react';
import type { APITypes } from 'plyr-react';
import { Plyr } from './LazyPlyr';
import { useRmgSlide } from '../shared/slideContext';
import { installDblclickGuardWhenReady } from './plyrGuards';
import { detectProvider } from './plyr';

export type RmgPlyrSourceBuilder = (args: {
  src: string;
  poster?: string;
}) => any;

export type RmgPlyrOptionsResolver =
  | any
  | ((args: { src: string; poster?: string; index: number }) => any);

export type VideoProps = {
  src: string;
  poster?: string;
  alt?: string;
  source?: any;
  sourceBuilder?: RmgPlyrSourceBuilder;
  options?: RmgPlyrOptionsResolver;
  className?: string;
  style?: React.CSSProperties;
  posterClassName?: string;
  posterStyle?: React.CSSProperties;
  onApi?: (api: APITypes | null) => void;
  registerApiByIndex?: (index: number, api: APITypes | null) => void;
};

const baseWrap: React.CSSProperties = { width: '100%', height: '100%' };
const basePoster: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

export function Video(props: VideoProps) {
  const ctx = useRmgSlide();
  const isClone = ctx?.isClone ?? false;
  const index = ctx?.normIdx ?? 0;

  if (isClone) {
    return (
      <img
        src={props.poster || ''}
        alt={props.alt ?? ''}
        draggable={false}
        className={['rmg__plyr__image', 'rmg__plyr__video-preview', props.posterClassName]
          .filter(Boolean)
          .join(' ')}
        style={{ ...basePoster, ...(props.posterStyle || {}) }}
      />
    );
  }

  const source =
    props.source ??
    props.sourceBuilder?.({ src: props.src, poster: props.poster }) ??
    ({
      type: 'video',
      sources: [{ src: props.src }],
      poster: props.poster,
    } as any);

  const options =
    typeof props.options === 'function'
      ? props.options({ src: props.src, poster: props.poster, index })
      : props.options;

  const provider = detectProvider(source);

  return (
    <div
      className={['rmg__plyr__video', props.className].filter(Boolean).join(' ')}
      style={{ ...baseWrap, ...(props.style || {}) }}
      data-rmg-plyr="true"
      data-rmg-plyr-index={String(index)}
      data-rmg-plyr-provider={provider}
    >
      <Plyr
        ref={(api: any) => {
          const apiOrNull = (api ?? null) as APITypes | null;
          ctx?.registerPlyr?.(apiOrNull);
          props.onApi?.(apiOrNull);
          props.registerApiByIndex?.(index, apiOrNull);
          installDblclickGuardWhenReady(api);
        }}
        source={source}
        options={options}
      />
    </div>
  );
}
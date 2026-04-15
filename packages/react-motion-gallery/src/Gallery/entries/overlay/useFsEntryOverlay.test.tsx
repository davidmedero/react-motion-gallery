import * as React from 'react';
import { Children } from 'react';
import { describe, expect, test, vi } from 'vitest';

import {
  buildFullscreenCaptionZoomMotion,
  resolveFullscreenCaptionZoomSettings,
} from '../../fullscreen/captionZoomMotion';
import { renderFsEntryOverlayTree } from './useFsEntryOverlay';

function createBaseArgs() {
  return {
    layers: [
      { key: 1, index: 0, opacity: 1 },
      { key: 2, index: 1, opacity: 0 },
    ],
    entriesObject: {
      items: [
        {
          title: 'Alpha',
          media: [{ kind: 'image', src: 'https://example.com/alpha.jpg', alt: 'Alpha' }],
        },
        {
          title: 'Bravo',
          media: [{ kind: 'image', src: 'https://example.com/bravo.jpg', alt: 'Bravo' }],
        },
      ],
      render: {
        overlay: ({ entry }: { entry: { title: string } }) => <span>{entry.title}</span>,
      },
    },
    entryMap: [
      { entryIndex: 0, mediaIndex: 0 },
      { entryIndex: 1, mediaIndex: 0 },
    ],
    overlayZoomMotion: buildFullscreenCaptionZoomMotion({
      phase: 'visible',
      isZoomed: false,
      settings: resolveFullscreenCaptionZoomSettings(undefined),
    }),
    viewportWidth: 1280,
    viewportHeight: 720,
    fadeOutMs: 300,
    resolveFsCaptionPlacement: () => null,
  };
}

describe('fullscreen entry overlay rendering', () => {
  test('defaults entry overlays to the existing bottom placement', () => {
    const tree = renderFsEntryOverlayTree(createBaseArgs()) as React.ReactElement<any>;
    const shells = Children.toArray(tree.props.children) as React.ReactElement<any>[];
    const shell = shells[0];
    const surface = shell?.props.children as React.ReactElement<any>;

    expect(shells).toHaveLength(2);
    expect(shell?.props['data-rmg-fs-entry-overlay']).toBe('true');
    expect(shell?.props.style.bottom).toBe(0);
    expect(shell?.props.style.left).toBe(0);
    expect(shell?.props.style.right).toBe(0);
    expect(shell?.props.style.height).toBeUndefined();
    expect(surface.props['data-rmg-fs-entry-overlay-surface']).toBe('true');
    expect(surface.props.style.background).toBe(
      'linear-gradient(to top, rgba(0,0,0,0.75), transparent)'
    );
  });

  test('resolves viewport-relative entry overlay widths for side placements', () => {
    const resolveFsCaptionPlacement = vi.fn(() => 'right' as const);

    const tree = renderFsEntryOverlayTree({
      ...createBaseArgs(),
      entriesObject: {
        ...createBaseArgs().entriesObject,
        overlay: {
          placement: {
            xs: 'bottom',
            lg: 'right',
          },
          width: '50%',
        },
      },
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement,
    }) as React.ReactElement<any>;

    const shells = Children.toArray(tree.props.children) as React.ReactElement<any>[];
    const shell = shells[0];
    const surface = shell?.props.children as React.ReactElement<any>;

    expect(resolveFsCaptionPlacement).toHaveBeenCalledWith(
      {
        xs: 'bottom',
        lg: 'right',
      },
      undefined,
      1440
    );
    expect(shell?.props.style.top).toBe(0);
    expect(shell?.props.style.bottom).toBe(0);
    expect(shell?.props.style.right).toBe(0);
    expect(shell?.props.style.width).toBe(720);
    expect(surface.props.style.background).toBe(
      'linear-gradient(to left, rgba(0,0,0,0.75), transparent)'
    );
  });

  test('resolves viewport-relative entry overlay heights for top and bottom placements', () => {
    const tree = renderFsEntryOverlayTree({
      ...createBaseArgs(),
      entriesObject: {
        ...createBaseArgs().entriesObject,
        overlay: {
          placement: 'top',
          height: '25%',
        },
      },
      viewportWidth: 1440,
      viewportHeight: 900,
      resolveFsCaptionPlacement: () => 'top',
    }) as React.ReactElement<any>;

    const shells = Children.toArray(tree.props.children) as React.ReactElement<any>[];
    const shell = shells[0];
    const surface = shell?.props.children as React.ReactElement<any>;

    expect(shell?.props.style.top).toBe(0);
    expect(shell?.props.style.left).toBe(0);
    expect(shell?.props.style.right).toBe(0);
    expect(shell?.props.style.height).toBe(225);
    expect(surface.props.style.background).toBe(
      'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)'
    );
  });
});

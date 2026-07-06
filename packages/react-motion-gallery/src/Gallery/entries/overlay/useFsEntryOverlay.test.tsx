import * as React from 'react';
import { Children } from 'react';
import { describe, expect, test, vi } from 'vitest';

import {
  buildFullscreenCaptionZoomMotion,
  resolveFullscreenCaptionZoomSettings,
} from '../../fullscreen/captionZoomMotion';
import {
  renderFsEntryOverlayTree,
  resolveFsEntryOverlayCrossfadeDurationMs,
  resolveFsEntryOverlayCrossfadeEasing,
  resolveFsEntryOverlayCrossfadeTarget,
  shouldCrossfadeEntryOverlayIndexChange,
} from './useFsEntryOverlay';

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
    fadeOutEasing: 'cubic-bezier(.4,0,.22,1)',
    resolveFsCaptionPlacement: () => null,
  };
}

describe('fullscreen entry overlay rendering', () => {
  test('defaults entry overlays to whole-overlay crossfades', () => {
    expect(resolveFsEntryOverlayCrossfadeTarget(undefined)).toBe('overlay');
    expect(resolveFsEntryOverlayCrossfadeTarget(createBaseArgs().entriesObject)).toBe('overlay');
    expect(resolveFsEntryOverlayCrossfadeDurationMs(undefined)).toBe(300);
    expect(resolveFsEntryOverlayCrossfadeEasing(undefined)).toBe('cubic-bezier(.4,0,.22,1)');
  });

  test('resolves entry overlay crossfade duration and easing', () => {
    expect(
      resolveFsEntryOverlayCrossfadeDurationMs({
        overlay: {
          overlayCrossfadeDurationMs: 520,
        },
      })
    ).toBe(520);
    expect(
      resolveFsEntryOverlayCrossfadeDurationMs({
        overlay: {
          overlayCrossfadeDurationMs: -80,
        },
      })
    ).toBe(0);
    expect(
      resolveFsEntryOverlayCrossfadeEasing({
        overlay: {
          overlayCrossfadeEasing: 'linear',
        },
      })
    ).toBe('linear');
  });

  test('content target crossfades every fullscreen index change', () => {
    expect(
      shouldCrossfadeEntryOverlayIndexChange({
        prevEntryIndex: 1,
        nextEntryIndex: 1,
        crossfadeTarget: 'content',
      })
    ).toBe(true);
    expect(
      shouldCrossfadeEntryOverlayIndexChange({
        prevEntryIndex: 1,
        nextEntryIndex: 1,
        crossfadeTarget: 'overlay',
      })
    ).toBe(false);
    expect(
      shouldCrossfadeEntryOverlayIndexChange({
        prevEntryIndex: 1,
        nextEntryIndex: 2,
        crossfadeTarget: 'overlay',
      })
    ).toBe(true);
  });

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

  test('renders entry overlays without zoom motion state', () => {
    const args: any = createBaseArgs();
    args.overlayZoomMotion = undefined;

    const tree = renderFsEntryOverlayTree(args) as React.ReactElement<any>;
    const shells = Children.toArray(tree.props.children) as React.ReactElement<any>[];
    const surface = shells[0]?.props.children as React.ReactElement<any>;

    expect(surface.props.style.transform).toBeUndefined();
    expect(surface.props.children).toBeTruthy();
  });

  test('passes the active media item to entry overlay renderers', () => {
    const seen: unknown[] = [];
    renderFsEntryOverlayTree({
      ...createBaseArgs(),
      layers: [{ key: 1, index: 1, opacity: 1 }],
      entriesObject: {
        ...createBaseArgs().entriesObject,
        render: {
          overlay: ({ media }) => {
            seen.push(media);
            return <span />;
          },
        },
      },
    });

    expect(seen).toEqual([
      { kind: 'image', src: 'https://example.com/bravo.jpg', alt: 'Bravo' },
    ]);
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
      fadeOutMs: 520,
      fadeOutEasing: 'linear',
      resolveFsCaptionPlacement: () => 'top',
    }) as React.ReactElement<any>;

    const shells = Children.toArray(tree.props.children) as React.ReactElement<any>[];
    const shell = shells[0];
    const surface = shell?.props.children as React.ReactElement<any>;

    expect(shell?.props.style.top).toBe(0);
    expect(shell?.props.style.left).toBe(0);
    expect(shell?.props.style.right).toBe(0);
    expect(shell?.props.style.height).toBe(225);
    expect(shell?.props.style.transition).toBe('opacity 520ms linear');
    expect(surface.props.style.background).toBe(
      'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)'
    );
  });

  test('renders one stable shell and only fades entry overlay content when requested', () => {
    const tree = renderFsEntryOverlayTree({
      ...createBaseArgs(),
      entriesObject: {
        ...createBaseArgs().entriesObject,
        overlay: {
          overlayCrossfadeTarget: 'content',
        },
        render: {
          overlay: ({ entry }: { entry: { title: string } }) => (
            <div className="entry-overlay-shell" data-shell="true">
              <span>{entry.title}</span>
            </div>
          ),
        },
      },
    }) as React.ReactElement<any>;

    expect(tree.type).toBe('div');
    expect(tree.props['data-rmg-fs-entry-overlay']).toBe('true');
    expect(String(tree.props.style.opacity)).toBe('var(--rmg-entry-overlay-opacity, 1)');

    const surface = tree.props.children as React.ReactElement<any>;
    expect(surface.props['data-rmg-fs-entry-overlay-surface']).toBe('true');

    const stack = surface.props.children as React.ReactElement<any>;
    const contentLayers = Children.toArray(stack.props.children) as React.ReactElement<any>[];

    expect(stack.props.activeKey).toBe(2);
    expect(stack.props.activeReady).toBe(false);
    expect(stack.props.durationMs).toBe(300);
    expect(stack.props.easing).toBe('cubic-bezier(.4,0,.22,1)');
    expect(contentLayers).toHaveLength(2);
    expect(
      contentLayers.every((layer) => layer.props['data-rmg-fs-entry-overlay-content'] === 'true')
    ).toBe(true);
    expect(
      contentLayers.map((layer) => layer.props['data-rmg-overlay-height-layer-key'])
    ).toEqual(['1', '2']);
    expect(contentLayers[1]?.props['data-rmg-overlay-height-active']).toBe('true');
    expect(contentLayers.map((layer) => layer.props.style.opacity)).toEqual([1, 0]);
    expect(contentLayers[0]?.props.style.transition).toBe('opacity 300ms linear');
    expect(contentLayers[1]?.props.style.transition).toBe('opacity 300ms linear');
    expect(contentLayers[0]?.props.style.position).toBe('relative');
    expect(contentLayers[0]?.props.style.zIndex).toBe(2);
    expect(contentLayers[1]?.props.style.position).toBe('relative');
    expect(contentLayers[1]?.props.style.zIndex).toBe(1);
    expect(contentLayers[0]?.props.children.props.className).toBe('entry-overlay-shell');
    expect(contentLayers[1]?.props.children.props.className).toBe('entry-overlay-shell');
    expect(contentLayers[0]?.props.children.props.children.type).toBe('span');
    expect(contentLayers[1]?.props.children.props.children.type).toBe('span');
  });

  test('keeps entry overlay height stable until the incoming content starts fading in', () => {
    const tree = renderFsEntryOverlayTree({
      ...createBaseArgs(),
      layers: [
        { key: 1, index: 0, opacity: 0 },
        { key: 2, index: 1, opacity: 1 },
      ],
      entriesObject: {
        ...createBaseArgs().entriesObject,
        overlay: {
          overlayCrossfadeTarget: 'content',
        },
      },
    }) as React.ReactElement<any>;

    const surface = tree.props.children as React.ReactElement<any>;
    const stack = surface.props.children as React.ReactElement<any>;
    const contentLayers = Children.toArray(stack.props.children) as React.ReactElement<any>[];

    expect(stack.props.activeKey).toBe(2);
    expect(stack.props.activeReady).toBe(true);
    expect(
      contentLayers.map((layer) => layer.props['data-rmg-overlay-height-layer-key'])
    ).toEqual(['1', '2']);
    expect(contentLayers[0]?.props.style.position).toBe('relative');
    expect(contentLayers[0]?.props.style.zIndex).toBe(2);
    expect(contentLayers[1]?.props.style.position).toBe('relative');
    expect(contentLayers[1]?.props.style.zIndex).toBe(1);
  });

});

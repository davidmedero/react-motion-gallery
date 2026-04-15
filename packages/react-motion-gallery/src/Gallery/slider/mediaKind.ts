import * as React from 'react';

export type SliderMediaKind = 'video' | 'image';

type MediaTaggedType = {
  rmgMediaKind?: string;
};

type SliderMediaCandidateProps = {
  children?: React.ReactNode;
  poster?: unknown;
  source?: unknown;
  sourceBuilder?: unknown;
  src?: unknown;
};

function getCandidateProps(element: React.ReactElement): SliderMediaCandidateProps {
  return (element.props ?? {}) as SliderMediaCandidateProps;
}

export function isRmgVideoElement(child: React.ReactElement) {
  return (child.type as MediaTaggedType | undefined)?.rmgMediaKind === 'video';
}

export function detectKindFromChild(child: React.ReactElement): SliderMediaKind {
  if (isRmgVideoElement(child)) return 'video';

  if (typeof child.type === 'string') {
    const tagName = child.type.toLowerCase();
    return tagName === 'video' || tagName === 'iframe' ? 'video' : 'image';
  }

  const props = getCandidateProps(child);
  if (props.poster || props.source || props.sourceBuilder) return 'video';

  return 'image';
}

export function collectImageSrcsFromReactNode(node: React.ReactNode): string[] {
  const out: string[] = [];

  const visit = (next: React.ReactNode) => {
    if (next == null || typeof next === 'boolean') return;

    if (Array.isArray(next)) {
      next.forEach(visit);
      return;
    }

    if (typeof next === 'string' || typeof next === 'number') return;

    if (!React.isValidElement(next)) return;

    const props = getCandidateProps(next);
    if (detectKindFromChild(next) !== 'video') {
      const src = props.src;
      if (typeof src === 'string' && src.length > 0) out.push(src);
    }

    if (props.children != null) visit(props.children);
  };

  visit(node);
  return out;
}

export function collectPredecodeImageUrls(
  node: React.ReactNode,
  lazyLoadEnabled: boolean
): string[] | undefined {
  if (lazyLoadEnabled) return undefined;
  return Array.from(new Set(collectImageSrcsFromReactNode(node).filter(Boolean)));
}

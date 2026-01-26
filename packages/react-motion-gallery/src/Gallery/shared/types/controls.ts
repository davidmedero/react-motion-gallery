export type ArrowRenderArgs = {
  ref: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
  hidden: boolean;
  disabled: boolean;
  createRipple: (el: HTMLElement) => void;
  className?: string;
};

export type DotsRenderArgs = {
  ref: React.RefObject<HTMLDivElement | null>;
  count: number;
  activeIndex: number;
  hidden: boolean;
  goTo: (index: number) => void;
  getDotRef: (index: number) => (el: HTMLDivElement | null) => void;
  createRipple: (el: HTMLElement) => void;
  classNameContainer?: string;
  classNameDot?: string;
};

export type ProgressRenderArgs = {
  ref: React.Ref<HTMLDivElement>;
  innerRef?: React.Ref<HTMLDivElement>;
  hidden: boolean;
  progress: number;
  axis: 'x' | 'y';
  className?: string;
  style?: React.CSSProperties;
  innerClassName?: string;
  innerStyle?: React.CSSProperties;
};
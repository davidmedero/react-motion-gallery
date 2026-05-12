type ResponsiveTextLineCount = number | Record<string, number>;
type ResponsiveTextBarHeight = number | Record<string, number>;
type ResponsiveTextLineHeight = number | Record<string, number>;
type TextBarWidth = number | string;
type TextBarWidths = TextBarWidth | TextBarWidth[];
type ResponsiveTextBarWidth = TextBarWidths | Record<string, TextBarWidths>;
type ResponsiveTextLastBarWidth = number | string | Record<string, number | string>;
type TextSkeletonResponsiveBy = "viewport" | "container";

export type { ResponsiveTextBarHeight as R, TextSkeletonResponsiveBy as T, ResponsiveTextBarWidth as a, ResponsiveTextLineHeight as b, ResponsiveTextLineCount as c, ResponsiveTextLastBarWidth as d };

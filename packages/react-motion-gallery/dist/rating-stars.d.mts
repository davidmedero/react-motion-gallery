import * as react_jsx_runtime from 'react/jsx-runtime';
import * as React from 'react';

type RatingStarsProps = {
    value: number;
    max?: number;
    precision?: number;
    fillMode?: "partial" | "floor" | "round" | "ceil";
    reviewCount?: number;
    showValue?: boolean;
    showReviewCount?: boolean;
    formatValue?: (value: number) => React.ReactNode;
    formatReviewCount?: (count: number) => React.ReactNode;
    className?: string;
    starsClassName?: string;
    starClassName?: string;
    labelClassName?: string;
    style?: React.CSSProperties;
    activeColor?: string;
    emptyColor?: string;
    gap?: number | string;
    ariaLabel?: string;
};
declare function RatingStars({ value, max, precision, fillMode, reviewCount, showValue, showReviewCount, formatValue, formatReviewCount, className, starsClassName, starClassName, labelClassName, style, activeColor, emptyColor, gap, ariaLabel, }: RatingStarsProps): react_jsx_runtime.JSX.Element;

export { RatingStars, type RatingStarsProps };

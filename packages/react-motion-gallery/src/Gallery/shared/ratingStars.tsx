"use client";

import * as React from "react";

export type RatingStarsProps = {
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

const STAR_PATH =
  "M12 2 14.81 8.63 22 9.24 16.54 13.97 18.18 21 12 17.27 5.82 21 7.46 13.97 2 9.24 9.19 8.63 12 2Z";
const STAR_CLIP_X = 2;
const STAR_CLIP_WIDTH = 20;
const STAR_AREA_CLIP_STOPS = [
  0, 0.197, 0.252, 0.286, 0.32, 0.355, 0.389, 0.42, 0.449, 0.475,
  0.5, 0.525, 0.551, 0.58, 0.611, 0.645, 0.68, 0.714, 0.748, 0.803, 1,
];

const reviewFormatter = new Intl.NumberFormat("en-US");

function clampRating(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, max));
}

function clampStarFill(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 1000) / 1000;
}

function getStarClipWidth(fill: number) {
  const scaledIndex = fill * (STAR_AREA_CLIP_STOPS.length - 1);
  const index = Math.floor(scaledIndex);
  const progress = scaledIndex - index;
  const start = STAR_AREA_CLIP_STOPS[index] ?? 0;
  const end = STAR_AREA_CLIP_STOPS[index + 1] ?? 1;

  return (start + (end - start) * progress) * STAR_CLIP_WIDTH;
}

function formatRatingValue(value: number, precision: number) {
  return value.toFixed(Math.max(0, precision | 0));
}

function formatReviews(count: number) {
  const normalizedCount = Math.max(0, count | 0);
  return `${reviewFormatter.format(normalizedCount)} ${
    normalizedCount === 1 ? "review" : "reviews"
  }`;
}

export function RatingStars({
  value,
  max = 5,
  precision = 1,
  fillMode = "partial",
  reviewCount,
  showValue = true,
  showReviewCount = reviewCount != null,
  formatValue,
  formatReviewCount,
  className,
  starsClassName,
  starClassName,
  labelClassName,
  style,
  activeColor = "#f5a524",
  emptyColor = "#d6dee4",
  gap = "0.08em",
  ariaLabel,
}: RatingStarsProps) {
  const clipPathIdPrefix = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const starCount = Math.max(1, max | 0);
  const rating = clampRating(value, starCount);
  const visualRating =
    fillMode === "floor"
      ? Math.floor(rating)
      : fillMode === "round"
        ? Math.round(rating)
        : fillMode === "ceil"
          ? Math.ceil(rating)
          : rating;
  const valueLabel = formatValue
    ? formatValue(rating)
    : formatRatingValue(rating, precision);
  const reviewLabel =
    reviewCount != null
      ? formatReviewCount
        ? formatReviewCount(reviewCount)
        : formatReviews(reviewCount)
      : null;

  const computedAriaLabel =
    ariaLabel ??
    [
      `${valueLabel} out of ${starCount}`,
      showReviewCount && reviewLabel ? reviewLabel : null,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45em",
        ...style,
      }}
      role="img"
      aria-label={computedAriaLabel}
      data-rmg-rating-stars="true"
    >
      <span
        className={starsClassName}
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap,
          lineHeight: 1,
        }}
      >
        {Array.from({ length: starCount }, (_, index) => {
          const fill = clampStarFill(visualRating - index);
          const clipPathId = `rmg-rating-star-${clipPathIdPrefix}-${index}`;

          return (
            <span
              key={index}
              className={starClassName}
              data-rmg-rating-star="true"
              data-state={fill >= 1 ? "full" : fill > 0 ? "partial" : "empty"}
              data-fill={fill}
              style={{
                position: "relative",
                display: "inline-block",
                width: "1em",
                height: "1em",
                lineHeight: 0,
              }}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                style={{ display: "block", overflow: "visible" }}
              >
                <path d={STAR_PATH} fill={emptyColor} />
                {fill > 0 && fill < 1 ? (
                  <defs>
                    <clipPath
                      id={clipPathId}
                      clipPathUnits="userSpaceOnUse"
                    >
                      <rect
                        x={STAR_CLIP_X}
                        y="0"
                        width={getStarClipWidth(fill)}
                        height="24"
                      />
                    </clipPath>
                  </defs>
                ) : null}
                {fill > 0 ? (
                  <path
                    d={STAR_PATH}
                    fill={activeColor}
                    clipPath={fill < 1 ? `url(#${clipPathId})` : undefined}
                  />
                ) : null}
              </svg>
            </span>
          );
        })}
      </span>
      {showValue || (showReviewCount && reviewLabel) ? (
        <span className={labelClassName} data-rmg-rating-label="true">
          {showValue ? valueLabel : null}
          {showValue && showReviewCount && reviewLabel ? " " : null}
          {showReviewCount && reviewLabel ? `(${reviewLabel})` : null}
        </span>
      ) : null}
    </span>
  );
}

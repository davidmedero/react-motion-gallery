import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  getSkeletonCacheCookieName,
  parseSkeletonCacheCookie,
} from "react-motion-gallery/skeleton/cache";
import DemosPageClient from "./DemosPageClient";
import {
  MASONRY_HORIZONTAL_ORDER_SKELETON_CACHE_KEY,
  MASONRY_HORIZONTAL_ORDER_SKELETON_ROUTE_KEY,
} from "./masonry/masonry-horizontal-order/cache";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Editable React Motion Gallery demo slots with a sticky sidebar for browsing planned layouts and patterns.",
};

type DemosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSearchParamsString(
  searchParams: Record<string, string | string[] | undefined>
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      nextSearchParams.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        nextSearchParams.append(key, entry);
      }
    }
  }

  return nextSearchParams.toString();
}

export default async function DemosPage({ searchParams }: DemosPageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const initialSearchParamsString = toSearchParamsString(resolvedSearchParams);
  const horizontalOrderSkeletonCacheSnapshot = parseSkeletonCacheCookie(
    cookieStore.get(
      getSkeletonCacheCookieName(MASONRY_HORIZONTAL_ORDER_SKELETON_CACHE_KEY)
    )?.value,
    {
      key: MASONRY_HORIZONTAL_ORDER_SKELETON_CACHE_KEY,
      kind: "masonry",
      routeKey: MASONRY_HORIZONTAL_ORDER_SKELETON_ROUTE_KEY,
    }
  );

  return (
    <DemosPageClient
      initialSearchParamsString={initialSearchParamsString}
      horizontalOrderSkeletonCacheSnapshot={horizontalOrderSkeletonCacheSnapshot}
    />
  );
}

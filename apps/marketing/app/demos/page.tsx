import type { Metadata } from "next";
import { cookies } from "next/headers";
import { parseSkeletonCacheCookie } from "react-motion-gallery/skeleton/cache";
import type { SkeletonCacheSnapshot } from "react-motion-gallery/skeleton/cache";
import DemosPageClient from "./DemosPageClient";

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

function parseSkeletonCacheSnapshots(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  const snapshots: Record<string, SkeletonCacheSnapshot> = {};

  for (const cookie of cookieStore.getAll()) {
    if (!cookie.name.startsWith("rmg_skel_cache_")) continue;

    const snapshot = parseSkeletonCacheCookie(cookie.value);
    if (snapshot) snapshots[snapshot.key] = snapshot;
  }

  return snapshots;
}

export default async function DemosPage({ searchParams }: DemosPageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const initialSearchParamsString = toSearchParamsString(resolvedSearchParams);
  const skeletonCacheSnapshots = parseSkeletonCacheSnapshots(cookieStore);

  return (
    <DemosPageClient
      initialSearchParamsString={initialSearchParamsString}
      skeletonCacheSnapshots={skeletonCacheSnapshots}
    />
  );
}

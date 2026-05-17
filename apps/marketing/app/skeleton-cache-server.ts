import "server-only";

import { cookies } from "next/headers";
import {
  parseSkeletonCacheCookie,
  type SkeletonCacheSnapshot,
} from "react-motion-gallery/skeleton/cache";

export async function readSkeletonCacheSnapshots() {
  const cookieStore = await cookies();
  const snapshots: Record<string, SkeletonCacheSnapshot> = {};

  for (const cookie of cookieStore.getAll()) {
    if (!cookie.name.startsWith("rmg_skel_cache_")) continue;

    const snapshot = parseSkeletonCacheCookie(cookie.value);
    if (snapshot) snapshots[snapshot.key] = snapshot;
  }

  return snapshots;
}

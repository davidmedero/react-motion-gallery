import type { Metadata } from "next";
import {
  getDemoById,
  getDemoDescription,
  getDemoPath,
  getDemoTitle,
} from "./demo-catalog";
import { JsonLd, buildDemosJsonLd } from "@/lib/seo/structured-data";
import { SafariReloadScrollRestorationGuard } from "../components/SafariReloadScrollRestorationGuard";
import { readSkeletonCacheSnapshots } from "../skeleton-cache-server";
import DemosPageClient from "./DemosPageClient";

const DEMOS_DESCRIPTION =
  "Editable React Motion Gallery demo slots with a sticky sidebar for browsing planned layouts and patterns.";

type DemosPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: DemosPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const selectedDemo = getDemoById(firstParam(resolvedSearchParams, "demo"));

  if (selectedDemo) {
    const title = getDemoTitle(selectedDemo);
    const description = getDemoDescription(selectedDemo);
    const canonical = getDemoPath(selectedDemo.id);

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
      },
    };
  }

  return {
    title: "Demos",
    description: DEMOS_DESCRIPTION,
    alternates: { canonical: "/demos" },
    openGraph: {
      title: "Demos",
      description: DEMOS_DESCRIPTION,
      url: "/demos",
    },
  };
}

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
  const selectedDemo = getDemoById(firstParam(resolvedSearchParams, "demo"));
  const initialSearchParamsString = toSearchParamsString(resolvedSearchParams);
  const skeletonCacheSnapshots = await readSkeletonCacheSnapshots();

  return (
    <>
      <JsonLd id="demos-json-ld" data={buildDemosJsonLd(selectedDemo)} />
      <SafariReloadScrollRestorationGuard />
      <DemosPageClient
        initialSearchParamsString={initialSearchParamsString}
        skeletonCacheSnapshots={skeletonCacheSnapshots}
      />
    </>
  );
}

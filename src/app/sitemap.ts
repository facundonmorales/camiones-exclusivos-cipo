import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { getUnidadesPublicas } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const unidades = await getUnidadesPublicas();
  return [
    { url: SITE.url, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...unidades.map((u) => ({
      url: `${SITE.url}/unidades/${u.slug}`,
      lastModified: new Date(u.updated_at),
      changeFrequency: "weekly" as const,
      priority: u.estado === "vendido" ? 0.3 : 0.8,
    })),
  ];
}

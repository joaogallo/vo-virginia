import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://vo-virginia.vercel.app"
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/guia-pedagogico`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/termos-de-uso`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politica-de-privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]
}

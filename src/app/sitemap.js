export default function sitemap() {
  const siteUrl = process.env.NEXTAUTH_URL || "https://your-restaurant.vercel.app";
  return [
    { url: siteUrl,          lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${siteUrl}/#menu`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${siteUrl}/#order`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/#story`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}

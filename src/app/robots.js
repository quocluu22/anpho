export default function robots() {
  const siteUrl = process.env.NEXTAUTH_URL || "https://your-restaurant.vercel.app";
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

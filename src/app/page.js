import LandingClient from "../components/LandingClient";

export const revalidate = 60;

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

async function fetchSheet(action) {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}`, { cache: "no-store" });
    return res.json();
  } catch (e) {
    console.error(`Failed to fetch ${action}:`, e);
    return [];
  }
}

async function fetchObject(action) {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}`, { cache: "no-store" });
    return res.json();
  } catch (e) {
    console.error(`Failed to fetch ${action}:`, e);
    return {};
  }
}

export async function generateMetadata() {
  const settings = await fetchObject("getSettings");
  const siteUrl  = process.env.NEXTAUTH_URL || "https://your-restaurant.vercel.app";
  const title    = settings.meta_title       || settings.salon_name || "AN PHỞ";
  const desc     = settings.meta_description || `${settings.salon_name} — Authentic Vietnamese restaurant. Book online!`;
  const ogImage  = settings.og_image         || settings.hero_image_url || "";

  return {
    title,
    description: desc,
    keywords: settings.keywords || "pho restaurant, vietnamese food, authentic pho",
    authors:  [{ name: settings.salon_name }],
    alternates: { canonical: siteUrl },
    robots: {
      index: true, follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website", url: siteUrl, title, description: desc,
      siteName: settings.salon_name, locale: "en_US",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image", title, description: desc,
      images: ogImage ? [ogImage] : [],
    },
    icons: settings.favicon_url ? { icon: settings.favicon_url, apple: settings.favicon_url } : undefined,
  };
}

export default async function HomePage() {
  const [menu, settings, gallery, reviews, about] = await Promise.all([
    fetchSheet("getMenu"),
    fetchObject("getSettings"),
    fetchSheet("getGallery"),
    fetchSheet("getReviews"),
    fetchObject("getAbout"),
  ]);

  return (
    <LandingClient
      services={Array.isArray(menu)      ? menu      : []}
      settings={typeof settings === "object" ? settings : {}}
      gallery={Array.isArray(gallery)    ? gallery   : []}
      testimonials={Array.isArray(reviews) ? reviews : []}
      about={typeof about === "object"   ? about     : {}}
      staffList={[]}
    />
  );
}

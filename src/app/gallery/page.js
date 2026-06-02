import GalleryClient from "../../components/GalleryClient";

export const dynamic = "force-dynamic";

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

async function fetchSheet(action) {
  if (!SCRIPT_URL) return [];
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}`, { cache: "no-store" });
    return res.json();
  } catch (e) { return []; }
}

async function fetchObject(action) {
  if (!SCRIPT_URL) return {};
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}`, { cache: "no-store" });
    return res.json();
  } catch (e) { return {}; }
}

export async function generateMetadata() {
  const settings = await fetchObject("getSettings");
  const name     = settings.salon_name || "AN PHỞ";
  const siteUrl  = process.env.NEXTAUTH_URL || "";
  return {
    title:       `Gallery — ${name}`,
    description: `Photos from ${name} — food, interior, team, and events.`,
    alternates:  { canonical: `${siteUrl}/gallery` },
  };
}

export default async function GalleryPage() {
  const [gallery, settings] = await Promise.all([
    fetchSheet("getGallery"),
    fetchObject("getSettings"),
  ]);
  return (
    <GalleryClient
      gallery={Array.isArray(gallery) ? gallery : []}
      settings={typeof settings === "object" ? settings : {}}
    />
  );
}

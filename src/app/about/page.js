import AboutClient from "../../components/AboutClient";

export const dynamic = "force-dynamic";

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

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
    title:       `Our Story — ${name}`,
    description: `Learn about the history and family behind ${name}. Authentic Vietnamese restaurant since 2010.`,
    alternates:  { canonical: `${siteUrl}/about` },
  };
}

export default async function AboutPage() {
  const [settings, about] = await Promise.all([
    fetchObject("getSettings"),
    fetchObject("getAbout"),
  ]);
  return (
    <AboutClient
      settings={typeof settings === "object" ? settings : {}}
      about={typeof about === "object" ? about : {}}
    />
  );
}

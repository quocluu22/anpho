import MenuClient from "../../components/MenuClient";

export const dynamic = "force-dynamic";

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

async function fetchSheet(action) {
  if (!SCRIPT_URL) return [];
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}`, { cache: "no-store" });
    return res.json();
  } catch (e) {
    console.error(`Failed to fetch ${action}:`, e);
    return [];
  }
}

async function fetchObject(action) {
  if (!SCRIPT_URL) return {};
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
  const name     = settings.salon_name || "AN PHỞ";
  const siteUrl  = process.env.NEXTAUTH_URL || "";
  return {
    title:       `Menu — ${name}`,
    description: `Explore our full menu at ${name}. Signature Phở, Small Bites, and more.`,
    alternates:  { canonical: `${siteUrl}/menu` },
  };
}

export default async function MenuPage() {
  const [menu, settings] = await Promise.all([
    fetchSheet("getMenu"),
    fetchObject("getSettings"),
  ]);

  return (
    <MenuClient
      menu={Array.isArray(menu) ? menu : []}
      settings={typeof settings === "object" ? settings : {}}
    />
  );
}

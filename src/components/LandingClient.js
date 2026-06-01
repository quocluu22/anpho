"use client";
import { useState, useEffect } from "react";
import Script from "next/script";

const TIMES = [
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM",
];

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// ── SCHEMA MARKUP ─────────────────────────────────────────────
function SchemaMarkup({ s, activeServices, displayTestimonials, settings }) {
  const siteUrl = settings.site_url || "https://your-restaurant.vercel.app";

  const cleanPhone = (p) => {
    if (!p) return undefined;
    const d = String(p).replace(/[^0-9]/g, "");
    return d.length === 10 ? `+1${d}` : `+${d}`;
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}/#business`,
    "name": s.salon_name,
    "url": siteUrl,
    "telephone": cleanPhone(s.phone),
    "priceRange": "$$",
    "servesCuisine": ["Vietnamese", "Pho", "Asian"],
    "description": settings.meta_description || `${s.salon_name} — Authentic Vietnamese restaurant. Book a table online!`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": s.address ? s.address.split(",")[0].trim() : "",
      "addressLocality": s.address && s.address.includes(",") ? s.address.split(",")[1].trim() : "",
      "addressRegion": "CA",
      "postalCode": s.address ? (String(s.address).match(/\d{5}/) || [""])[0] : "",
      "addressCountry": "US",
    },
    "openingHoursSpecification": [
      { "@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"opens":"11:00","closes":"21:00" },
      { "@type":"OpeningHoursSpecification","dayOfWeek":["Sunday"],"opens":"11:00","closes":"20:00" },
    ],
    "sameAs": [s.google_business_url, s.facebook_url, s.instagram_url, s.yelp_url].filter(Boolean),
    "menu": `${siteUrl}/#menu`,
    "acceptsReservations": "True",
  };

  if (s.hero_image_url) localBusiness.image = s.hero_image_url;
  if (s.google_business_url) localBusiness.hasMap = s.google_business_url;
  if (settings.geo_lat && settings.geo_lng) {
    localBusiness.geo = {
      "@type": "GeoCoordinates",
      "latitude": Number(settings.geo_lat),
      "longitude": Number(settings.geo_lng),
    };
  }
  if (displayTestimonials?.length > 0) {
    const total = displayTestimonials.reduce((sum, t) => sum + (Number(t.Stars) || 5), 0);
    localBusiness.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": (total / displayTestimonials.length).toFixed(1),
      "ratingCount": displayTestimonials.length,
      "bestRating": "5", "worstRating": "1",
    };
  }

  // Menu item list
  const menuSchema = activeServices?.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${s.salon_name} Menu`,
    "itemListElement": activeServices.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.Name,
      "description": item.Desc || item.Name,
    })),
  } : null;

  // FAQ
  const faqItems = [];
  let idx = 1;
  while (settings[`faq_${idx}_q`]) {
    faqItems.push({ q: String(settings[`faq_${idx}_q`]), a: String(settings[`faq_${idx}_a`] || "") });
    idx++;
  }

  const reviewSchemas = displayTestimonials?.slice(0, 3).map(t => ({
    "@context": "https://schema.org", "@type": "Review",
    "itemReviewed": { "@type": "Restaurant", "@id": `${siteUrl}/#business`, "name": s.salon_name },
    "author": { "@type": "Person", "name": String(t.Name || "Guest") },
    "reviewRating": { "@type": "Rating", "ratingValue": String(Number(t.Stars) || 5), "bestRating": "5", "worstRating": "1" },
    "reviewBody": String(t.Review || ""),
  })) || [];

  const schemas = [
    { "@context": "https://schema.org", ...localBusiness },
    { "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteUrl}/#website`, "url": siteUrl, "name": s.salon_name },
    ...reviewSchemas,
  ];
  if (menuSchema) schemas.push(menuSchema);
  if (faqItems.length > 0) {
    schemas.push({
      "@context": "https://schema.org", "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question", "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function LandingClient({
  services = [], settings = {}, gallery = [],
  testimonials = [], about = {}, staffList = []
}) {
  const [form, setForm]           = useState({ name:"",phone:"",email:"",date:"",time:"",guests:"",location:"",notes:"" });
  const [activePhoIdx, setActivePhoIdx] = useState(0); // active item trong Signature Phở
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const today = new Date().toISOString().split("T")[0];

  // Settings
  const s = {
    salon_name:    settings.salon_name    || "AN PHỞ",
    address:       settings.address       || "8250 Elk Grove Blvd, Elk Grove, CA",
    phone:         settings.phone         || "(916) 555-0123",
    email:         settings.email         || "",
    hours_weekday: settings.hours_weekday || "Mon–Sat 11AM–9PM",
    hours_weekend: settings.hours_weekend || "Sun 11AM–8PM",
    hero_title:    settings.hero_title    || "Our Menu",
    hero_subtitle: settings.hero_subtitle || "A Taste of Family Heritage",
    hero_image_url: settings.hero_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuBuMRViot_Tb6zvuRmOADMxQbhWkpY2rc3UiY2ayx_OFVZsG5GIysp690EMGW46vFGcOTmVXrXVRHuAMb3c_dSYeAI0VLb5W_T6oSqPjE_nE9MAGFZ8iCys6_tGbHrgq5vBUMyFva8y-RBAVN6blqPHBzqF_2H5JP1tS2BYd51ZaCo5_dWDrkXYvjELhMStnIWleJ3huBSC90BclR6r1mKeS8nRono9DEMfY9rVdLxA0Sc_nhc7nRXrCvPFt-im1WGvminyFP2ggTq9",
    logo_url:       settings.logo_url      || "",
    google_business_url: settings.google_business_url || "",
    facebook_url:   settings.facebook_url  || "",
    instagram_url:  settings.instagram_url || "",
    yelp_url:       settings.yelp_url      || "",
    tiktok_url:     settings.tiktok_url    || "",
    contact_map_embed: settings.contact_map_embed || "",
    review_embed_code: settings.review_embed_code || "",
    ga4_id:         settings.ga4_id        || "",
    // Ảnh sections — quản lý trong Settings Sheet
    pho_img_url:    settings.pho_img_url    || "https://lh3.googleusercontent.com/aida-public/AB6AXuAKegbVOoRVdyP-sq67nXbrFm-_vgqS1TV5WaUl3R4Oj20yWNg1zLtuFwHDBFtUKY2HTlh6jPn8ECBHSNBHq6zpllMI7dR7nV3H6rEXkOV268he2y5Zj-VNLpQe7a9xHGAnN2wY0eFxuJQiP0Xm8ElYWS4UI_kWSrjdNQ1DM4bUJvmyWaLldPA-v2lR1pfYTya63zSxQbpAIJQRGjklOd_QDFgLGdDpZhSdYz6OdGFGtfxdkeZY12SYJ1DYnhAphOhMvm1NodLHnvlw",
    beyond_img_url: settings.beyond_img_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDDHhMqP7KTmJKK26yIxl6R1kCTXbvXiFvEc5KEW5uWNfZrbottEzq396_1vtof-muh8vsLyZsefsuoAOdF02bvhYo169i0XlVFaOHCIsfeAnFCENw5Ukrn4gdSbgd01WkuhZtCHEuufjEWxdUWObAaT7MYxLId2cyREMnafL5c64FSkgosIZZeoMdVp5aZtZVLQ_igXd9ZGyUft-lPGHSHE-zbdZ1y0ZEjCDRq9eQd7voGWB9mlODoGi3vJzpWAcWfEsfBGLS_yUSA",
    // Chi nhánh — quản lý trong Settings Sheet: location_1, location_2...
    location_1:     settings.location_1    || "Elk Grove (Main)",
    location_2:     settings.location_2    || "Sacramento (Downtown)",
    location_3:     settings.location_3    || "",
  };

  const a = {
    story:         about.story         || "AN PHỞ was born from a simple belief: the best food comes from patience, love, and family tradition. Our grandmother started simmering her first pot of broth in Saigon — a recipe passed down through generations, never written, always felt.",
    story2:        about.story2        || "When we opened our first location, we brought that same 24-hour broth, those same hand-selected herbs, and that same warmth. Every bowl we serve is a piece of home — not just for us, but for every guest who walks through our doors.",
    mission:       about.mission       || "Organic & Toxin-Free Ingredients",
    est_year:      about.est_year      || "2010",
    stat_1_number: about.stat_1_number || "14+", stat_1_label: about.stat_1_label || "Years Open",
    stat_2_number: about.stat_2_number || "2",   stat_2_label: about.stat_2_label || "Locations",
    stat_3_number: about.stat_3_number || "24h", stat_3_label: about.stat_3_label || "Broth Simmered",
    circle_img_1:  about.circle_img_1  || "https://lh3.googleusercontent.com/aida-public/AB6AXuDHL64Lt-YjFCC4MDoemaeqIfbzoMXfpTsmez-RzIKi2s6uQpZGk7MFWNQ-i3xbcDxv3nk4Jai3pe8Kj4D0RGmYY19mQCrh8Rd_cU3O7zotv6O-DqVLgoEhe5nNRuNcwPXl1YiiAKCM4NieAI2nPdxruqRVQDXes1DplimvCE_izprb1ji1MFfFrOG1nASJU_CpnDwNAs5V-CazTro_Z7ONosrMZzUwbjm4lF-B6WJMrDPJxBMXOdecEtMwrcYCrffbMPVOylDTF5DQ",
    story_img:     about.story_img     || "https://lh3.googleusercontent.com/aida-public/AB6AXuBuMRViot_Tb6zvuRmOADMxQbhWkpY2rc3UiY2ayx_OFVZsG5GIysp690EMGW46vFGcOTmVXrXVRHuAMb3c_dSYeAI0VLb5W_T6oSqPjE_nE9MAGFZ8iCys6_tGbHrgq5vBUMyFva8y-RBAVN6blqPHBzqF_2H5JP1tS2BYd51ZaCo5_dWDrkXYvjELhMStnIWleJ3huBSC90BclR6r1mKeS8nRono9DEMfY9rVdLxA0Sc_nhc7nRXrCvPFt-im1WGvminyFP2ggTq9",
    chef_quote:    about.chef_quote    || "It's not just food, it's a hug in a bowl. My grandmother taught me that the secret is in the patience, never rushing the broth.",
    chef_name:     about.chef_name     || "Chef An",
  };

  // Menu groups — từ Google Sheet hoặc fallback
  const menuGroups = (() => {
    if (services.length === 0) return [
      {
        cat: "Small Bites & Rolls", icon: "🥢",
        items: [
          { Name:"Imperial Spring Rolls", Price:"$12", Desc:"Crispy pork and shrimp rolls served with fresh herbs and nước chấm.", Img:"https://lh3.googleusercontent.com/aida-public/AB6AXuBctzmAIMozIEr2msh9nSQye3jz8rQ-yog-NT6TFVJJgjj3mluC9r8lzuBqr0HsQRuO6wjfhWIICDoblaGQx3D-F3msr0fz14WrZkdZqpCjvJewavYEIKm9beO76M2ZlnP1BzClvK06ZSTEidPKZxTzk787In-h93lJC9hGMLoil191nSurRwWWO-iXDpvWw9lBGBW17PHWfFTCfd4kfqa_rZQ77ZRS5uMfZvqxgXen4gUvtxvFAva6rDHM3mvTT6Cil9EN3WUnUpNs", Featured:false },
          { Name:"Fresh Summer Rolls", Price:"$10", Desc:"Rice paper rolls with shrimp, vermicelli, mint, and peanut dip.", Img:"https://lh3.googleusercontent.com/aida-public/AB6AXuCZndYR4injMDn2mdGNvJ_XeykDXgTpGqt8ttPzdh8Zt-2HG-BQztrasKpvwGw8UtZXkorErfoNNVXaSEhqv1L7yRZcYAxCNrlgAzJagyZp-TkPu4IpUt6f230WV6_f_jeaJ8xo7u-IagtAnpmbAA3pIZGVHIXFLvu1mnarzEj0mdycQiWtfSNGh5sXVU_zgpiK8dRCah2Nm1d-Hr7RSUigAKrmVOtJknrM_5B_lAAjL60qz_JLJsTDFRFpJQ4BDvzuWdork9cR2B67", Featured:true },
          { Name:"Mini Banh Mi", Price:"$14", Desc:"Traditional trio of sliders: BBQ Pork, Chicken, and Tofu Pâté.", Img:"https://lh3.googleusercontent.com/aida-public/AB6AXuCM_H7mN4LzVpBI1KIAugbNlTlGhlBqtpRXwHtrnsJ7KVrsVJuBwfZqDlK2eS6nDcUAi6QOrp0yq_uik6dtumkkNhnbW79_5pRttL7fL0bStJ5lhLa3pn4iUkOyYnosGOC-W-wpS-eMrxoJv52JHi_jGhdSa00jKFWYLvy0LMoWkf5_bphgXaNJJvRl4TGyrpTs316_92otFj82fEuifKc41MER27RgArhznvERyd-MBPffWZmD0gsrmNFhmXmyTx7dMu-owGpYT8dV", Featured:false },
        ]
      },
      {
        cat: settings.pho_title || "Signature Phở", icon: "🍜",
        sub: settings.pho_sub || "Our broth is simmered for 24 hours with charred ginger, onions, and secret family spices.",
        items: [
          { Name:"Classic Beef Phở",      Price:"$18.50", Desc:"Thinly sliced rare ribeye, brisket, and meatballs in our 24-hour beef marrow broth.", Tags:["Popular","Gluten Free"] },
          { Name:"Phở Gà (Chicken)",      Price:"$17.50", Desc:"Shredded free-range chicken, fragrant lime leaves, and ginger in a light, golden poultry broth.", Tags:[] },
          { Name:"Vegetarian Garden Phở", Price:"$16.50", Desc:"Roasted daikon, carrots, and mushrooms in a 100% plant-based broth served with organic tofu.", Tags:["Vegan Option"] },
          { Name:"Wagyu Special Reserve", Price:"$32.00", Desc:"A5 Japanese Wagyu slices, truffle oil infusion, and hand-cut rice noodles. A decadent family favorite.", Tags:[] },
        ]
      },
      {
        cat: settings.beyond_title || "Beyond the Broth", icon: "🔥",
        dark: true,
        sub: settings.beyond_sub || "Discover our selection of stir-fried specialties and dry noodles.",
        items: [
          { Name:"Sizzling Lemongrass Pork", Price:"$19.50", Desc:"Grilled marinated pork served over cool vermicelli, herbs, and crispy shallots.", Icon:"🔥" },
          { Name:"Honey Glazed Chicken Noodle", Price:"$18.50", Desc:"Wok-charred chicken with honey-soy glaze, served with garlic egg noodles.", Icon:"🍯" },
        ]
      },
    ];
    // Group services by Category - giữ đúng thứ tự category
    const ICONS = { "Small Bites & Rolls":"🥢", "Signature Phở":"🍜", "Beyond the Broth":"🔥", "Drinks":"🥤", "Desserts":"🍮" };
    const groups = {};
    services.forEach(svc => {
      const cat = svc.Category || "Menu";
      if (!groups[cat]) groups[cat] = {
        cat,
        icon: ICONS[cat] || "🍽️",
        dark: cat === (settings.beyond_title || "Beyond the Broth"),
        sub: cat === (settings.pho_title || "Signature Phở") ? (settings.pho_sub || "") : cat === (settings.beyond_title || "Beyond the Broth") ? (settings.beyond_sub || "") : "",
        items: []
      };
      groups[cat].items.push(svc);
    });

    // Đọc thứ tự từ Settings Sheet (menu_category_order)
    let ORDER = ["Small Bites & Rolls", "Signature Phở", "Beyond the Broth", "Drinks", "Desserts"];
    if (settings.menu_category_order) {
      try {
        const saved = JSON.parse(settings.menu_category_order);
        if (Array.isArray(saved) && saved.length > 0) {
          ORDER = saved.map(c => c.name || c);
        }
      } catch (_) {}
    }

    // Sort theo thứ tự từ admin
    const sorted = ORDER.map(o => groups[o]).filter(Boolean);
    const others = Object.values(groups).filter(g => !ORDER.includes(g.cat));
    return [...sorted, ...others];
  })();

  const activeServices = services.length > 0 ? services : menuGroups.flatMap(g => g.items);

  const fallbackTestimonials = [
    { ID:1, Name:"Jennifer M.", Review:"The atmosphere here is unlike any other Vietnamese restaurant. The broth is extraordinary and the service is impeccable.", Stars:5 },
    { ID:2, Name:"Michael T.",  Review:"Best pho in Sacramento! The wagyu special is absolutely worth it. We come here every week.", Stars:5 },
    { ID:3, Name:"Lisa N.",     Review:"I've been coming here for years. The summer rolls are fresh and the beef pho is always consistent.", Stars:5 },
  ];
  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleReservation = async () => {
    if (!form.name || !form.phone || !form.date || !form.time || !form.guests) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sheets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submitBooking",
          name: form.name, phone: form.phone, email: form.email,
          service: `Table for ${form.guests}${form.location ? ` @ ${form.location}` : ""}`,
          date: form.date, time: form.time, notes: form.notes, staff: "",
        }),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const NAV_LINKS = [
    ["story","Our Story"],["menu","Menu"],["gallery","Gallery"],
    ["order","Order Now"],["locations","Locations"],
  ];

  return (
    <>
      {s.ga4_id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.ga4_id}`} strategy="afterInteractive"/>
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());gtag('config','${s.ga4_id}');
          `}</Script>
        </>
      )}

      <SchemaMarkup s={s} activeServices={activeServices} displayTestimonials={displayTestimonials} settings={settings}/>

      <div suppressHydrationWarning style={{ fontFamily:"'Be Vietnam Pro',sans-serif", background:"#fdf9f0", color:"#1c1c17" }}>
        <style suppressHydrationWarning>{`
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap');

          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          html{scroll-behavior:smooth;}
          img{display:block;max-width:100%;}
          button{cursor:pointer;border:none;font-family:inherit;}
          a{text-decoration:none;color:inherit;}

          ::-webkit-scrollbar{width:4px;}
          ::-webkit-scrollbar-track{background:#fdf9f0;}
          ::-webkit-scrollbar-thumb{background:#815500;}

          /* TOKENS */
          :root{
            --bg:#fdf9f0;--surf-cont:#f1eee5;--surf-low:#f6f3ea;--surf-high:#ece8df;
            --primary:#061b0e;--secondary:#815500;--sec-cont:#ffb22e;--sec-fixed:#ffddb2;--sec-fixed-dim:#ffb94d;
            --on-surf-var:#434843;--outline-var:#c3c8c1;
            --serif:'Bricolage Grotesque',sans-serif;--sans:'Be Vietnam Pro',sans-serif;
          }

          /* STAMP BORDER */
          .stamp{
            background:#fff;padding:20px;
            clip-path:polygon(0% 4%,4% 0%,8% 4%,12% 0%,16% 4%,20% 0%,24% 4%,28% 0%,32% 4%,36% 0%,40% 4%,44% 0%,48% 4%,52% 0%,56% 4%,60% 0%,64% 4%,68% 0%,72% 4%,76% 0%,80% 4%,84% 0%,88% 4%,92% 0%,96% 4%,100% 0%,100% 96%,96% 100%,92% 96%,88% 100%,84% 96%,80% 100%,76% 96%,72% 100%,68% 96%,64% 100%,60% 96%,56% 100%,52% 96%,48% 100%,44% 96%,40% 100%,36% 96%,32% 100%,28% 96%,24% 100%,20% 96%,16% 100%,12% 96%,8% 100%,4% 96%,0% 100%);
          }
          .hard-shadow:hover{transform:translateY(-2px);box-shadow:4px 4px 0 0 var(--primary);}
          .hard-shadow{transition:all 0.2s ease-out;}
          .hand-div{height:4px;background:url("data:image/svg+xml,%3Csvg width='100' height='4' viewBox='0 0 100 4' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 2C20 1 40 3 60 2C80 1 100 3 100 2' stroke='%23061b0e' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") repeat-x;}

          /* NAV */
          .pho-nav{position:sticky;top:0;z-index:50;background:rgba(253,249,240,0.96);backdrop-filter:blur(10px);border-bottom:1px solid rgba(6,27,14,0.06);}
          .pho-nav-inner{max-width:1280px;margin:0 auto;padding:0 32px;display:flex;align-items:center;justify-content:space-between;height:72px;}
          .pho-logo{font-family:var(--serif);font-size:26px;font-weight:800;color:var(--secondary);font-style:italic;letter-spacing:-0.02em;cursor:pointer;background:none;border:none;}
          .pho-nav-links{display:flex;gap:36px;align-items:center;}
          .pho-nav-a{font-size:14px;font-weight:600;letter-spacing:0.04em;color:var(--on-surf-var);cursor:pointer;background:none;border:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:all 0.2s;}
          .pho-nav-a:hover{color:var(--secondary);border-bottom-color:var(--secondary);}
          .pho-nav-btn{background:var(--sec-cont);color:var(--primary);font-family:var(--sans);font-size:14px;font-weight:700;padding:10px 24px;border-radius:8px;transition:all 0.2s;}
          .pho-nav-btn:hover{transform:translateY(-2px);box-shadow:4px 4px 0 0 var(--primary);}
          .pho-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;padding:4px;cursor:pointer;}
          .pho-hamburger span{display:block;width:22px;height:1.5px;background:var(--primary);}

          /* MOBILE MENU */
          .pho-mobile{position:fixed;inset:0;z-index:200;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;}
          .pho-mobile-close{position:absolute;top:20px;right:20px;font-size:28px;color:var(--primary);background:none;border:none;cursor:pointer;}
          .pho-mobile-a{font-family:var(--serif);font-size:28px;font-weight:700;color:var(--primary);cursor:pointer;background:none;border:none;}
          .pho-mobile-a:hover{color:var(--secondary);}

          /* HERO */
          .pho-hero{position:relative;width:100%;height:50vh;min-height:280px;display:flex;align-items:center;justify-content:center;overflow:hidden;}
          .pho-hero-overlay{position:absolute;inset:0;background:rgba(6,27,14,0.45);z-index:1;}
          .pho-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
          .pho-hero-content{position:relative;z-index:2;text-align:center;color:#fff;padding:0 24px;}
          .pho-hero-h1{font-family:var(--serif);font-size:clamp(36px,6vw,72px);font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;}
          .pho-hero-sub{font-family:var(--serif);font-size:clamp(18px,2.5vw,28px);font-weight:600;font-style:italic;opacity:0.9;}

          /* SECTION WRAP */
          .pho-main{max-width:1280px;margin:0 auto;padding:80px 32px;}
          .pho-sec-head{text-align:center;margin-bottom:48px;}
          .pho-sec-icon-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:8px;}
          .pho-sec-icon{font-size:32px;color:var(--secondary);}
          .pho-sec-h2{font-family:var(--serif);font-size:clamp(28px,3vw,48px);font-weight:800;color:var(--secondary);}
          .pho-sec-h2-dark{color:var(--primary);}
          .pho-sec-sub{font-size:16px;font-style:italic;color:var(--on-surf-var);margin-top:12px;line-height:1.6;}

          /* OUR STORY */
          .pho-story{background:var(--surf-cont);padding:80px 32px;}
          .pho-story-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
          .pho-story-img-wrap{position:relative;}
          .pho-story-img{width:100%;height:480px;object-fit:cover;clip-path:polygon(0 0,100% 0,100% 88%,88% 100%,0 100%);box-shadow:0 24px 60px rgba(6,27,14,0.15);}
          .pho-story-badge{position:absolute;bottom:-20px;right:32px;width:120px;height:120px;border-radius:50%;border:3px dashed var(--secondary);background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px;box-shadow:0 8px 24px rgba(0,0,0,0.1);}
          .pho-story-badge-year{font-family:var(--serif);font-size:20px;font-weight:800;color:var(--secondary);line-height:1.1;}
          .pho-story-badge-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--primary);}
          .pho-story-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--sec-cont);color:var(--primary);font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:20px;}
          .pho-story-h2{font-family:var(--serif);font-size:clamp(28px,3vw,44px);font-weight:800;color:var(--primary);letter-spacing:-0.02em;margin-bottom:20px;line-height:1.15;}
          .pho-story-h2 em{color:var(--secondary);font-style:italic;}
          .pho-story-text{font-size:16px;color:var(--on-surf-var);line-height:1.75;margin-bottom:16px;}
          .pho-story-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(6,27,14,0.1);margin-top:32px;border:1px solid rgba(6,27,14,0.1);border-radius:8px;overflow:hidden;}
          .pho-stat{background:var(--bg);padding:20px 16px;text-align:center;}
          .pho-stat-num{font-family:var(--serif);font-size:28px;font-weight:800;color:var(--secondary);display:block;line-height:1;}
          .pho-stat-label{font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--on-surf-var);margin-top:4px;display:block;}

          /* BITES */
          .pho-bites-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
          .pho-bite-card{transition:transform 0.3s;}
          .pho-bite-card:nth-child(1){transform:rotate(-1deg);}
          .pho-bite-card:nth-child(2){transform:rotate(2deg);margin-top:24px;}
          .pho-bite-card:nth-child(3){transform:rotate(-2deg);}
          .pho-bite-card:hover{transform:rotate(0deg) scale(1.02)!important;z-index:1;position:relative;}
          .pho-bite-img{width:100%;aspect-ratio:1;object-fit:cover;margin-bottom:20px;}
          .pho-bite-header{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid rgba(6,27,14,0.1);padding-bottom:8px;margin-bottom:8px;gap:12px;}
          .pho-bite-name{font-family:var(--serif);font-size:22px;font-weight:700;color:var(--primary);}
          .pho-bite-price{font-family:var(--serif);font-size:18px;font-weight:700;color:var(--secondary);white-space:nowrap;}
          .pho-bite-desc{font-size:14px;color:var(--on-surf-var);line-height:1.6;}

          /* BENTO PHỞ */
          .pho-bento{display:grid;grid-template-columns:3fr 6fr 3fr;gap:24px;align-items:start;}
          .pho-bento-left{display:flex;flex-direction:column;align-items:center;gap:20px;position:sticky;top:88px;}
          .pho-herb-circle{width:120px;height:120px;border-radius:50%;border:2px dashed var(--secondary);padding:8px;overflow:hidden;}
          .pho-herb-circle img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
          .pho-trad-label{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--primary);text-align:center;line-height:1.4;}
          .pho-menu-items{display:flex;flex-direction:column;gap:12px;}
          .pho-menu-item{background:var(--surf-low);padding:20px 24px;border-radius:12px;border-left:4px solid transparent;transition:all 0.2s;cursor:default;}
          .pho-menu-item:first-child{border-left-color:var(--secondary);}
          .pho-menu-item:hover{background:var(--surf-cont);border-left-color:var(--secondary);transform:translateX(4px);}
          .pho-menu-item-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:16px;}
          .pho-menu-item-name{font-family:var(--serif);font-size:24px;font-weight:700;color:var(--primary);}
          .pho-menu-item-price{font-family:var(--serif);font-size:18px;font-weight:700;color:var(--secondary);white-space:nowrap;}
          .pho-menu-item-desc{font-size:15px;color:var(--on-surf-var);line-height:1.6;}
          .pho-menu-tags{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}
          .pho-tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--on-surf-var);opacity:0.7;}
          .pho-bento-right{display:flex;flex-direction:column;gap:20px;}
          .pho-bestseller{position:absolute;top:-12px;right:-12px;width:56px;height:56px;border-radius:50%;background:var(--sec-cont);display:flex;align-items:center;justify-content:center;text-align:center;font-size:10px;font-weight:800;color:var(--primary);transform:rotate(12deg);box-shadow:0 4px 12px rgba(0,0,0,0.15);line-height:1.3;}
          .pho-quote-card{background:var(--primary);padding:24px;border-radius:12px;color:#fff;}
          .pho-quote-title{font-family:var(--serif);font-size:18px;font-weight:700;color:var(--sec-fixed);margin-bottom:12px;}
          .pho-quote-text{font-size:14px;opacity:0.8;line-height:1.7;font-style:italic;margin-bottom:12px;}
          .pho-quote-author{font-weight:700;color:var(--sec-fixed);font-size:14px;}

          /* BEYOND */
          .pho-beyond{background:var(--primary);padding:80px 32px;color:#fff;}
          .pho-beyond-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
          .pho-beyond-h2{font-family:var(--serif);font-size:clamp(32px,4vw,56px);font-weight:800;letter-spacing:-0.02em;margin-bottom:16px;}
          .pho-beyond-desc{font-size:17px;opacity:0.75;line-height:1.7;margin-bottom:40px;}
          .pho-beyond-items{display:flex;flex-direction:column;gap:24px;}
          .pho-beyond-item{display:flex;gap:20px;align-items:flex-start;}
          .pho-beyond-icon{width:56px;height:56px;border-radius:50%;background:var(--secondary);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px;color:var(--primary);transition:transform 0.2s;}
          .pho-beyond-item:hover .pho-beyond-icon{transform:scale(1.1);}
          .pho-beyond-item-name{font-family:var(--serif);font-size:22px;font-weight:700;color:var(--sec-fixed-dim);margin-bottom:4px;}
          .pho-beyond-item-desc{font-size:15px;opacity:0.7;line-height:1.6;}
          .pho-beyond-img-wrap{position:relative;}
          .pho-beyond-img{transform:rotate(-2deg);box-shadow:0 24px 60px rgba(0,0,0,0.4);}
          .pho-beyond-img img{width:100%;height:320px;object-fit:cover;}

          /* TESTIMONIALS */
          .pho-reviews{background:var(--surf-cont);padding:80px 32px;}
          .pho-reviews-inner{max-width:1280px;margin:0 auto;}
          .pho-reviews-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px;}
          .pho-review-card{background:var(--bg);padding:28px;border-radius:12px;border:1px solid rgba(6,27,14,0.06);}
          .pho-review-quote{font-size:48px;font-family:var(--serif);color:var(--secondary);opacity:0.25;line-height:0.7;margin-bottom:12px;}
          .pho-review-stars{color:var(--secondary);font-size:16px;letter-spacing:2px;margin-bottom:12px;}
          .pho-review-text{font-size:15px;font-style:italic;line-height:1.7;color:var(--primary);margin-bottom:20px;}
          .pho-review-author{display:flex;align-items:center;gap:12px;}
          .pho-review-avatar{width:40px;height:40px;border-radius:50%;background:var(--sec-fixed);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--primary);flex-shrink:0;overflow:hidden;}
          .pho-review-avatar img{width:100%;height:100%;object-fit:cover;}
          .pho-review-name{font-size:14px;font-weight:700;color:var(--primary);}
          .pho-review-label{font-size:12px;color:var(--on-surf-var);}

          /* ORDER */
          .pho-order{background:var(--bg);padding:80px 32px;}
          .pho-order-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:5fr 7fr;gap:80px;align-items:start;}
          .pho-order-left{position:sticky;top:88px;}
          .pho-order-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--sec-cont);color:var(--primary);font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:20px;}
          .pho-order-h2{font-family:var(--serif);font-size:clamp(32px,3.5vw,48px);font-weight:800;color:var(--primary);letter-spacing:-0.02em;margin-bottom:16px;line-height:1.15;}
          .pho-order-h2 em{color:var(--secondary);font-style:italic;}
          .pho-order-desc{font-size:16px;color:var(--on-surf-var);line-height:1.75;margin-bottom:32px;}
          .pho-order-info{display:flex;flex-direction:column;gap:16px;}
          .pho-order-info-item{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--on-surf-var);}
          .pho-order-info-icon{width:36px;height:36px;border-radius:50%;background:var(--sec-cont);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--primary);flex-shrink:0;}
          .pho-form-wrap{background:var(--surf-cont);border-radius:16px;padding:40px;border:1px solid rgba(6,27,14,0.08);}
          .pho-form-title{font-family:var(--serif);font-size:24px;font-weight:700;color:var(--primary);margin-bottom:28px;}
          .pho-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
          .pho-form-group{margin-bottom:16px;}
          .pho-form-lbl{display:block;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--on-surf-var);margin-bottom:6px;}
          .pho-form-inp{width:100%;background:var(--bg);border:1px solid rgba(6,27,14,0.15);border-radius:8px;padding:12px 16px;font-family:var(--sans);font-size:15px;color:var(--primary);outline:none;transition:border-color 0.2s;appearance:auto;}
          .pho-form-inp:focus{border-color:var(--secondary);}
          .pho-form-inp::placeholder{color:rgba(6,27,14,0.3);}
          .pho-form-submit{width:100%;padding:16px;border-radius:8px;border:none;background:var(--secondary);color:#fff;font-family:var(--serif);font-size:16px;font-weight:800;letter-spacing:0.05em;cursor:pointer;transition:all 0.2s;margin-top:8px;}
          .pho-form-submit:hover{background:var(--primary);transform:translateY(-2px);box-shadow:4px 4px 0 0 var(--primary);}
          .pho-form-submit:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}
          .pho-form-note{font-size:12px;color:var(--on-surf-var);text-align:center;margin-top:12px;font-style:italic;}

          /* FOOTER */
          .pho-footer{background:var(--surf-cont);border-top:2px solid rgba(6,27,14,0.06);border-radius:12px 12px 0 0;}
          .pho-footer-inner{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;align-items:center;padding:64px 32px;text-align:center;}
          .pho-footer-logo{font-family:var(--serif);font-size:28px;font-weight:800;color:var(--secondary);font-style:italic;margin-bottom:24px;}
          .pho-footer-links{display:flex;gap:40px;margin-bottom:32px;flex-wrap:wrap;justify-content:center;}
          .pho-footer-a{font-size:14px;font-weight:600;color:var(--on-surf-var);letter-spacing:0.04em;cursor:pointer;background:none;border:none;transition:color 0.2s;}
          .pho-footer-a:hover{color:var(--primary);}
          .pho-footer-socials{display:flex;gap:12px;margin-bottom:32px;}
          .pho-footer-social{width:40px;height:40px;border-radius:50%;border:1px solid rgba(6,27,14,0.15);display:flex;align-items:center;justify-content:center;color:var(--primary);transition:all 0.2s;cursor:pointer;}
          .pho-footer-social:hover{border-color:var(--secondary);color:var(--secondary);transform:translateY(-2px);}
          .pho-footer-copy{font-size:14px;color:var(--on-surf-var);font-style:italic;}

          /* RESPONSIVE */
          @media(max-width:1024px){
            .pho-story-inner{grid-template-columns:1fr;gap:48px;}
            .pho-story-img{height:320px;}
            .pho-story-badge{width:96px;height:96px;bottom:-16px;right:16px;}
            .pho-bento{grid-template-columns:1fr;}
            .pho-bento-left{display:none;}
            .pho-bento-right{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
            .pho-beyond-inner{grid-template-columns:1fr;}
            .pho-beyond-img-wrap{display:none;}
            .pho-reviews-grid{grid-template-columns:1fr;}
            .pho-order-inner{grid-template-columns:1fr;}
            .pho-order-left{position:static;}
            .pho-bites-grid{grid-template-columns:1fr 1fr;}
            .pho-bite-card:nth-child(2){margin-top:0;}
          }
          @media(max-width:768px){
            .pho-nav-links,.pho-nav-btn{display:none!important;}
            .pho-hamburger{display:flex!important;}
            .pho-main,.pho-story,.pho-reviews,.pho-beyond,.pho-order,.pho-footer-inner{padding-left:20px!important;padding-right:20px!important;}
            .pho-bites-grid{grid-template-columns:1fr;}
            .pho-bite-card{transform:none!important;}
            .pho-bento-right{grid-template-columns:1fr;}
            .pho-form-row{grid-template-columns:1fr;}
            .pho-form-wrap{padding:24px 20px;}
            .pho-footer-links{gap:20px;}
            .pho-hero{height:40vh;}
          }
        `}</style>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="pho-mobile">
            <button className="pho-mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
            <button className="pho-logo pho-mobile-a" onClick={() => { window.scrollTo({top:0,behavior:"smooth"}); setMenuOpen(false); }}>
              {s.salon_name}
            </button>
            {NAV_LINKS.map(([id, label]) => (
              <button key={id} className="pho-mobile-a" onClick={() => scrollTo(id)}>{label}</button>
            ))}
          </div>
        )}

        {/* NAV */}
        <header className="pho-nav">
          <div className="pho-nav-inner">
            <button className="pho-logo" onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>
              {s.logo_url ? <img src={s.logo_url} alt={s.salon_name} style={{height:36}}/> : s.salon_name}
            </button>
            <div className="pho-nav-links">
              {NAV_LINKS.map(([id, label]) => (
                <button key={id} className="pho-nav-a" onClick={() => scrollTo(id)}>{label}</button>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button className="pho-nav-btn hard-shadow" onClick={() => scrollTo("order")}>Order Now</button>
              <button className="pho-hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
                <span/><span/><span/>
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="pho-hero" id="home">
          <div className="pho-hero-overlay"/>
          <img className="pho-hero-img" alt={s.salon_name} src={s.hero_image_url}/>
          <div className="pho-hero-content">
            <h1 className="pho-hero-h1">{s.hero_title}</h1>
            <p className="pho-hero-sub">{s.hero_subtitle}</p>
          </div>
        </section>

        {/* OUR STORY */}
        <section className="pho-story" id="story">
          <div className="pho-story-inner">
            <div className="pho-story-img-wrap">
              <img className="pho-story-img" alt="Our kitchen" src={a.story_img}/>
              <div className="pho-story-badge">
                <span className="pho-story-badge-year">Est.<br/>{a.est_year}</span>
                <span className="pho-story-badge-label">Family<br/>Recipe</span>
              </div>
            </div>
            <div>
              <div className="pho-story-eyebrow">
                📖
                Our Story
              </div>
              <h2 className="pho-story-h2">From Our Kitchen<br/>to <em>Your Table</em></h2>
              <p className="pho-story-text">{a.story}</p>
              <div className="hand-div" style={{width:120,margin:"20px 0"}}/>
              <p className="pho-story-text">{a.story2}</p>
              <div className="pho-story-stats">
                {[[a.stat_1_number,a.stat_1_label],[a.stat_2_number,a.stat_2_label],[a.stat_3_number,a.stat_3_label]].map(([n,l])=>(
                  <div key={l} className="pho-stat">
                    <span className="pho-stat-num">{n}</span>
                    <span className="pho-stat-label">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MENU — render tất cả groups dynamic từ Sheet */}
        <main className="pho-main" id="menu">
          {menuGroups.map((group, gi) => {
            // Signature Phở → bento layout với active item
            if (group.cat === (settings.pho_title || "Signature Phở")) return (
              <div key={group.cat} style={{marginBottom:80}}>
                <div className="pho-sec-head">
                  <div style={{textAlign:"center",fontSize:64,marginBottom:8,opacity:0.15}}>🍜</div>
                  <h2 className="pho-sec-h2 pho-sec-h2-dark" style={{textAlign:"center",fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(28px,4vw,56px)"}}>{group.cat}</h2>
                  {group.sub && <p className="pho-sec-sub">{group.sub}</p>}
                  <div className="hand-div" style={{width:256,margin:"16px auto 0"}}/>
                </div>
                <div className="pho-bento">
                  {/* Left: herb circle */}
                  <div className="pho-bento-left">
                    <div className="pho-herb-circle"><img src={a.circle_img_1} alt="Fresh herbs"/></div>
                    <div>
                      <div style={{textAlign:"center",fontSize:36}}>🍲</div>
                      <div className="pho-trad-label">Traditional<br/>Methods</div>
                    </div>
                  </div>
                  {/* Center: clickable menu items */}
                  <div className="pho-menu-items">
                    {group.items.map((item, i) => (
                      <div key={i}
                        className="pho-menu-item"
                        style={{cursor:"pointer", borderLeftColor: i===activePhoIdx ? "var(--secondary)" : "transparent"}}
                        onClick={()=>setActivePhoIdx(i)}
                      >
                        <div className="pho-menu-item-header">
                          <span className="pho-menu-item-name" style={{color: i===activePhoIdx ? "var(--secondary)" : "var(--primary)"}}>{item.Name}</span>
                          <span className="pho-menu-item-price">{item.Price}</span>
                        </div>
                        <p className="pho-menu-item-desc">{item.Desc}</p>
                        {item.Tags?.length > 0 && (
                          <div className="pho-menu-tags">
                            {item.Tags.map(tag => <span key={tag} className="pho-tag">• {tag}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Right: active item image + quote */}
                  <div className="pho-bento-right">
                    <div className="stamp" style={{transform:"rotate(3deg)",position:"relative"}}>
                      <img
                        src={group.items[activePhoIdx]?.Img || s.pho_img_url}
                        alt={group.items[activePhoIdx]?.Name || "Signature Pho"}
                        style={{transition:"opacity 0.3s"}}
                      />
                      <div className="pho-bestseller">
                        {activePhoIdx === 0 ? <>Best<br/>Seller</> : <>#{activePhoIdx+1}</>}
                      </div>
                    </div>
                    <div className="pho-quote-card">
                      <div className="pho-quote-title">Our Secret Sauce</div>
                      <p className="pho-quote-text">"{a.chef_quote}"</p>
                      <div className="pho-quote-author">— {a.chef_name}</div>
                    </div>
                  </div>
                </div>
              </div>
            );

            // Beyond the Broth → dark section
            if (group.dark) return (
              <div key={group.cat} style={{margin:"0 -32px",marginBottom:0}}>
                <section className="pho-beyond" style={{padding:"80px 32px"}}>
                  <div className="pho-beyond-inner">
                    <div>
                      <h2 className="pho-beyond-h2">{group.cat}</h2>
                      {group.sub && <p className="pho-beyond-desc">{group.sub}</p>}
                      <div className="pho-beyond-items">
                        {group.items.map((item, i) => (
                          <div key={i} className="pho-beyond-item">
                            <div className="pho-beyond-icon">{item.Icon || "🍽️"}</div>
                            <div>
                              <div className="pho-beyond-item-name">{item.Name}</div>
                              <p className="pho-beyond-item-desc">{item.Desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pho-beyond-img-wrap">
                      <div className="stamp pho-beyond-img">
                        <img src={s.beyond_img_url} alt="Specialty dishes"/>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            );

            // Tất cả danh mục khác → stamp cards (giống Small Bites)
            return (
              <div key={group.cat} style={{marginBottom:80}}>
                <div className="pho-sec-head">
                  <div className="pho-sec-icon-wrap">
                    <span style={{fontSize:32}}>{group.icon}</span>
                    <h2 className="pho-sec-h2">{group.cat}</h2>
                  </div>
                  <div className="hand-div" style={{width:192,margin:"12px auto 0"}}/>
                </div>
                <div className="pho-bites-grid">
                  {group.items.map((item, i) => (
                    <div key={i} className="pho-bite-card">
                      <div className="stamp">
                        {item.Img
                          ? <img className="pho-bite-img" src={item.Img} alt={item.Name}/>
                          : <div className="pho-bite-img" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f0e8",fontSize:48}}>{group.icon}</div>
                        }
                        <div className="pho-bite-header">
                          <span className="pho-bite-name">{item.Name}</span>
                          <span className="pho-bite-price">{item.Price}</span>
                        </div>
                        <p className="pho-bite-desc">{item.Desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>

        {/* TESTIMONIALS */}
        {displayTestimonials.length > 0 && (
          <section className="pho-reviews">
            <div className="pho-reviews-inner">
              <div className="pho-sec-head">
                <div className="pho-sec-icon-wrap">
                  <span style={{fontSize:32}}>💬</span>
                  <h2 className="pho-sec-h2">What Our Guests Say</h2>
                </div>
                <div className="hand-div" style={{width:192,margin:"12px auto 0"}}/>
              </div>
              <div className="pho-reviews-grid">
                {displayTestimonials.map((t, i) => (
                  <div key={t.ID || i} className="pho-review-card">
                    <div className="pho-review-quote">"</div>
                    <div className="pho-review-stars">{"★".repeat(Number(t.Stars)||5)}</div>
                    <p className="pho-review-text">"{t.Review}"</p>
                    <div className="pho-review-author">
                      {t.Avatar_URL
                        ? <img src={t.Avatar_URL} alt={t.Name} className="pho-review-avatar"/>
                        : <div className="pho-review-avatar">{initials(t.Name)}</div>
                      }
                      <div>
                        <div className="pho-review-name">{t.Name}</div>
                        <div className="pho-review-label">Loyal guest</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REVIEW WIDGET */}
        {s.review_embed_code && (
          <section style={{background:"var(--bg)",padding:"64px 32px"}}>
            <div style={{maxWidth:1280,margin:"0 auto"}}>
              <div dangerouslySetInnerHTML={{__html:s.review_embed_code}}/>
            </div>
          </section>
        )}

        {/* ORDER / RESERVATION */}
        <section className="pho-order" id="order">
          <div className="pho-order-inner">
            <div className="pho-order-left">
              <div className="pho-order-eyebrow">
                🍜
                Reserve Your Table
              </div>
              <h2 className="pho-order-h2">Come Dine<br/>With <em>Us</em></h2>
              <p className="pho-order-desc">Book your table for a warm, authentic Vietnamese dining experience. We'll confirm within 2 hours during business hours.</p>
              <div className="pho-order-info">
                {[["🕐",`${s.hours_weekday} · ${s.hours_weekend}`],["📍",s.address],["📞",s.phone],["✓","Walk-ins welcome · Reservations preferred"]].map(([icon,val])=>val&&(
                  <div key={icon} className="pho-order-info-item">
                    <div className="pho-order-info-icon">{icon}</div>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {submitted ? (
                <div className="pho-form-wrap" style={{textAlign:"center",padding:"64px 40px"}}>
                  <div style={{fontSize:56,marginBottom:16}}>🍜</div>
                  <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:32,fontWeight:800,color:"var(--primary)",marginBottom:12}}>Reservation Confirmed!</h3>
                  <p style={{fontSize:15,color:"var(--on-surf-var)",lineHeight:1.7,marginBottom:28}}>
                    Thank you, <strong>{form.name}</strong>! Table for <strong>{form.guests}</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong> has been received.
                  </p>
                  <button className="pho-form-submit hard-shadow" style={{maxWidth:240,margin:"0 auto"}}
                    onClick={()=>{setSubmitted(false);setForm({name:"",phone:"",email:"",date:"",time:"",guests:"",location:"",notes:""});}}>
                    Make Another →
                  </button>
                </div>
              ) : (
                <div className="pho-form-wrap">
                  <div className="pho-form-title">Make a Reservation</div>
                  <div className="pho-form-row">
                    <div><label className="pho-form-lbl">Full Name *</label><input className="pho-form-inp" placeholder="Nguyen Van An" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                    <div><label className="pho-form-lbl">Phone *</label><input className="pho-form-inp" placeholder="(916) 555-0000" type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                  </div>
                  <div className="pho-form-group">
                    <label className="pho-form-lbl">Email</label>
                    <input className="pho-form-inp" placeholder="your@email.com" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
                  </div>
                  <div className="pho-form-row">
                    <div><label className="pho-form-lbl">Date *</label><input className="pho-form-inp" type="date" min={today} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                    <div>
                      <label className="pho-form-lbl">Time *</label>
                      <select className="pho-form-inp" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}>
                        <option value="">Select time...</option>
                        {TIMES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pho-form-row">
                    <div>
                      <label className="pho-form-lbl">Party Size *</label>
                      <select className="pho-form-inp" value={form.guests} onChange={e=>setForm({...form,guests:e.target.value})}>
                        <option value="">Guests...</option>
                        <option>1–2 guests</option><option>3–4 guests</option>
                        <option>5–6 guests</option><option>7–8 guests</option>
                        <option>9+ guests (call us)</option>
                      </select>
                    </div>
                    <div>
                      <label className="pho-form-lbl">Location</label>
                      <select className="pho-form-inp" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}>
                        {[s.location_1,s.location_2,s.location_3].filter(Boolean).map(loc=>(
                          <option key={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pho-form-group">
                    <label className="pho-form-lbl">Special Requests</label>
                    <textarea className="pho-form-inp" rows={3} style={{resize:"vertical"}} placeholder="Dietary needs, special occasions, highchair..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
                  </div>
                  <button className="pho-form-submit hard-shadow" onClick={handleReservation}
                    disabled={loading||!form.name||!form.phone||!form.date||!form.time||!form.guests}>
                    {loading?"Sending...":"Confirm Reservation →"}
                  </button>
                  <p className="pho-form-note">* We'll confirm your reservation by phone or email.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CONTACT MAP */}
        {s.contact_map_embed && (
          <section style={{background:"var(--surf-cont)",padding:"0 0 80px"}} id="locations">
            <div style={{maxWidth:1280,margin:"0 auto",padding:"0 32px"}}>
              <div style={{borderRadius:12,overflow:"hidden",height:400,border:"1px solid rgba(6,27,14,0.08)"}}>
                <div dangerouslySetInnerHTML={{__html:s.contact_map_embed}} style={{width:"100%",height:"100%"}}/>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="pho-footer" id="locations">
          <div className="pho-footer-inner">
            <div className="pho-footer-logo">{s.salon_name}</div>
            <div className="pho-footer-links">
              {[["home","Home"],["story","Our Story"],["menu","Menu"],["gallery","Gallery"],["order","Order Now"],["locations","Locations"]].map(([id,label])=>(
                <button key={id} className="pho-footer-a" onClick={()=>scrollTo(id)}>{label}</button>
              ))}
            </div>
            <div className="pho-footer-socials">
              {[
                [s.google_business_url,"🌐","Website"],
                [s.instagram_url,"📸","Instagram"],
                [s.facebook_url,"👍","Facebook"],
                [s.tiktok_url,"▶","TikTok"],
                [s.yelp_url,"⭐","Yelp"],
              ].filter(([url])=>url).map(([url,icon,title])=>(
                <a key={title} href={url} target="_blank" rel="noopener noreferrer" className="pho-footer-social" title={title}>
                  <span style={{fontSize:20}}>{icon}</span>
                </a>
              ))}
            </div>
            <p className="pho-footer-copy">© {new Date().getFullYear()} {s.salon_name} — Sharing the warmth of our family kitchen.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

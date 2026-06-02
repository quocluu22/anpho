"use client";
import { useState } from "react";
import Link from "next/link";

const DEFAULT_MENU = [
  { ID:1, Category:"Small Bites & Rolls", Name:"Imperial Spring Rolls", Price:"$12", Desc:"Crispy pork and shrimp rolls served with fresh herbs and nước chấm.", Tags:["Popular"], Img:"https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:2, Category:"Small Bites & Rolls", Name:"Fresh Summer Rolls",    Price:"$10", Desc:"Rice paper rolls with shrimp, vermicelli, mint, and peanut dip.", Tags:["Vegan"], Img:"https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop", Active:true, Featured:true },
  { ID:3, Category:"Small Bites & Rolls", Name:"Mini Banh Mi",          Price:"$14", Desc:"Traditional trio of sliders: BBQ Pork, Chicken, and Tofu Pâté.", Tags:[], Img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:4, Category:"Signature Phở", Name:"Classic Beef Phở",       Price:"$18.50", Desc:"Thinly sliced rare ribeye, brisket, and meatballs in our 24-hour beef marrow broth.", Tags:["Popular","GF"], Img:"https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400&h=400&fit=crop", Active:true, Featured:true },
  { ID:5, Category:"Signature Phở", Name:"Phở Gà (Chicken)",       Price:"$17.50", Desc:"Shredded free-range chicken, fragrant lime leaves and ginger in a golden poultry broth.", Tags:[], Img:"https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:6, Category:"Signature Phở", Name:"Vegetarian Garden Phở",  Price:"$16.50", Desc:"Roasted daikon, carrots, and mushrooms in a 100% plant-based broth with organic tofu.", Tags:["Vegan"], Img:"https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:7, Category:"Signature Phở", Name:"Wagyu Special Reserve",   Price:"$32.00", Desc:"A5 Japanese Wagyu slices, truffle oil infusion, and hand-cut rice noodles.", Tags:[], Img:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:8, Category:"Beyond the Broth", Name:"Sizzling Lemongrass Pork",    Price:"$19.50", Desc:"Grilled marinated pork served over cool vermicelli, herbs, and crispy shallots.", Tags:[], Img:"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:9, Category:"Beyond the Broth", Name:"Honey Glazed Chicken Noodle", Price:"$18.50", Desc:"Wok-charred chicken with honey-soy glaze, served with garlic egg noodles.", Tags:[], Img:"https://images.unsplash.com/photo-1512058454905-6b841e7ad132?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:10, Category:"Drinks", Name:"Vietnamese Iced Coffee", Price:"$5.50", Desc:"Robusta drip coffee with sweetened condensed milk over ice.", Tags:["Must Try"], Img:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:11, Category:"Drinks", Name:"Pandan Coconut Latte",   Price:"$6.50", Desc:"House-made pandan extract with creamy coconut milk, served hot or iced.", Tags:["Vegan"], Img:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop", Active:true, Featured:false },
  { ID:12, Category:"Desserts", Name:"Chè Ba Màu", Price:"$7.00", Desc:"Three-color dessert with mung beans, red beans, pandan jelly, and coconut cream.", Tags:["Vegan"], Img:"https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop", Active:true, Featured:false },
];

const TAG_STYLE = {
  "Popular":  { bg:"rgba(192,57,43,0.1)",  color:"#c0392b" },
  "Vegan":    { bg:"rgba(27,116,27,0.1)",  color:"#1b741b" },
  "GF":       { bg:"rgba(6,27,14,0.07)",   color:"#815500" },
  "Must Try": { bg:"rgba(129,85,0,0.1)",   color:"#815500" },
  "default":  { bg:"rgba(129,85,0,0.08)",  color:"#815500" },
};

const BADGE_LABELS = {
  Featured: "Bestseller",
  Popular:  "Popular",
};

export default function MenuClient({ menu = [], settings = {} }) {
  const [activeTab, setActiveTab] = useState("all");

  const s = {
    salon_name:    settings.salon_name    || "AN PHỞ",
    hero_image_url: settings.hero_image_url || "https://images.unsplash.com/photo-1555126634-323283e090fa?w=1600&h=400&fit=crop",
    menu_category_order: settings.menu_category_order || "",
  };

  // Get active menu items
  const activeMenu = (menu.length > 0 ? menu : DEFAULT_MENU)
    .filter(item => item.Active === true || item.Active === "TRUE" || item.Active === undefined);

  // Build category list — respect saved order
  const ICONS = { "Small Bites & Rolls":"🥢","Signature Phở":"🍜","Beyond the Broth":"🔥","Drinks":"🥤","Desserts":"🍮" };
  let ORDER = ["Small Bites & Rolls","Signature Phở","Beyond the Broth","Drinks","Desserts"];
  if (s.menu_category_order) {
    try {
      const saved = JSON.parse(s.menu_category_order);
      if (Array.isArray(saved)) ORDER = saved.map(c => c.name || c);
    } catch (_) {}
  }
  const allCats = [...new Set(activeMenu.map(i => i.Category))];
  const sortedCats = [...ORDER.filter(o => allCats.includes(o)), ...allCats.filter(c => !ORDER.includes(c))];

  // Filtered items
  const filtered = activeTab === "all" ? activeMenu : activeMenu.filter(i => i.Category === activeTab);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap');
        .mn-body{font-family:'Be Vietnam Pro',sans-serif;background:#f5f0e8;color:#1c1c17;min-height:100vh;}
        :root{--gold:#815500;--gold-lt:#ffb22e;--red:#c0392b;--primary:#061b0e;--border:rgba(6,27,14,0.1);--surf:#edeae0;--serif:'Bricolage Grotesque',sans-serif;}

        /* NAV */
        .mn-nav{position:sticky;top:0;z-index:100;background:rgba(245,240,232,0.96);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);height:68px;display:flex;align-items:center;}
        .mn-nav-inner{max-width:1280px;margin:0 auto;padding:0 32px;width:100%;display:flex;align-items:center;justify-content:space-between;}
        .mn-logo{font-family:var(--serif);font-size:24px;font-weight:800;color:var(--gold);font-style:italic;text-decoration:none;}
        .mn-links{display:flex;gap:32px;align-items:center;}
        .mn-a{font-size:14px;font-weight:600;color:rgba(6,27,14,0.6);text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:all 0.2s;}
        .mn-a:hover,.mn-a.active{color:var(--primary);border-bottom-color:var(--gold);}
        .mn-btn{background:var(--gold-lt);color:var(--primary);font-size:14px;font-weight:700;padding:10px 24px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;}
        .mn-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;}
        .mn-hamburger span{display:block;width:22px;height:1.5px;background:var(--primary);}

        /* HERO */
        .mn-hero{position:relative;height:220px;overflow:hidden;display:flex;align-items:center;justify-content:center;}
        .mn-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.4);}
        .mn-hero-content{position:relative;z-index:2;text-align:center;}
        .mn-hero-title{font-family:var(--serif);font-size:clamp(28px,5vw,56px);font-weight:800;color:#fff;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;}
        .mn-breadcrumb{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:rgba(255,255,255,0.7);}
        .mn-breadcrumb a{color:rgba(255,255,255,0.7);text-decoration:none;}
        .mn-breadcrumb a:hover{color:#fff;}

        /* MAIN */
        .mn-main{max-width:1280px;margin:0 auto;padding:56px 32px 80px;}
        .mn-page-h1{font-family:var(--serif);font-size:clamp(40px,5vw,72px);font-weight:800;color:var(--primary);letter-spacing:-0.02em;text-transform:uppercase;text-align:center;margin-bottom:48px;}

        /* TABS */
        .mn-tabs{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-start;margin-bottom:48px;overflow-x:auto;padding-bottom:4px;}
        .mn-tabs::-webkit-scrollbar{height:4px;}
        .mn-tabs::-webkit-scrollbar-thumb{background:var(--gold-lt);border-radius:2px;}
        .mn-tab{display:flex;align-items:center;gap:8px;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;border:1.5px solid var(--border);background:#fff;color:var(--primary);cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .mn-tab:hover{border-color:var(--gold);color:var(--gold);}
        .mn-tab.active{background:var(--red);color:#fff;border-color:var(--red);}
        .mn-tab-icon{font-size:18px;}

        /* GRID */
        .mn-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;}
        .mn-card{background:#fff;border-radius:12px;overflow:hidden;cursor:pointer;border:0.5px solid var(--border);transition:transform 0.3s,box-shadow 0.3s;}
        .mn-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(6,27,14,0.12);}
        .mn-card-img{position:relative;aspect-ratio:1;overflow:hidden;background:var(--surf);}
        .mn-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s;}
        .mn-card:hover .mn-card-img img{transform:scale(1.06);}
        .mn-card-img-placeholder{width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:56px;background:var(--surf);}
        .mn-card-badge{position:absolute;top:10px;right:10px;background:var(--red);color:#fff;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:100px;}
        .mn-card-body{padding:16px 18px;}
        .mn-card-name{font-family:var(--serif);font-size:17px;font-weight:700;color:var(--primary);margin-bottom:6px;line-height:1.3;}
        .mn-card-desc{font-size:13px;color:rgba(6,27,14,0.55);line-height:1.55;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .mn-card-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;}
        .mn-card-price{font-family:var(--serif);font-size:20px;font-weight:800;color:var(--gold);}
        .mn-card-tags{display:flex;gap:4px;flex-wrap:wrap;}
        .mn-tag{font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:3px 8px;border-radius:100px;}

        /* EMPTY */
        .mn-empty{text-align:center;padding:80px 0;color:rgba(6,27,14,0.4);}
        .mn-empty-icon{font-size:56px;margin-bottom:16px;}

        /* CTA */
        .mn-cta{text-align:center;margin-top:80px;padding:60px 40px;background:#fff;border-radius:16px;border:0.5px solid var(--border);}
        .mn-cta-title{font-family:var(--serif);font-size:clamp(24px,3vw,40px);font-weight:800;color:var(--primary);margin-bottom:10px;}
        .mn-cta-sub{font-size:16px;color:rgba(6,27,14,0.55);margin-bottom:28px;}
        .mn-cta-btn{display:inline-block;background:var(--red);color:#fff;font-family:var(--serif);font-size:16px;font-weight:700;padding:14px 40px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;transition:all 0.2s;}
        .mn-cta-btn:hover{background:#a93226;transform:translateY(-2px);}

        /* FOOTER */
        .mn-footer{background:var(--surf);border-top:0.5px solid var(--border);padding:48px 32px 32px;}
        .mn-footer-inner{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px;}
        .mn-footer-logo{font-family:var(--serif);font-size:28px;font-weight:800;color:var(--gold);font-style:italic;}
        .mn-footer-links{display:flex;gap:28px;flex-wrap:wrap;justify-content:center;}
        .mn-footer-a{font-size:14px;font-weight:600;color:rgba(6,27,14,0.5);text-decoration:none;}
        .mn-footer-a:hover{color:var(--primary);}
        .mn-footer-copy{font-size:13px;color:rgba(6,27,14,0.35);font-style:italic;}

        /* ANIM */
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .mn-card{animation:fadeIn 0.3s ease;}

        /* RESPONSIVE */
        @media(max-width:1024px){.mn-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:768px){
          .mn-links,.mn-btn{display:none!important;}
          .mn-hamburger{display:flex!important;}
          .mn-grid{grid-template-columns:repeat(2,1fr);gap:16px;}
          .mn-main{padding:40px 20px 60px;}
          .mn-tabs{gap:8px;}
          .mn-tab{padding:10px 14px;font-size:12px;}
        }
        @media(max-width:480px){.mn-grid{grid-template-columns:1fr 1fr;gap:12px;}}
      `}</style>

      <div className="mn-body">
        {/* NAV */}
        <header className="mn-nav">
          <div className="mn-nav-inner">
            <Link href="/" className="mn-logo">{s.salon_name}</Link>
            <div className="mn-links">
              <Link href="/"        className="mn-a">Home</Link>
              <Link href="/menu"    className="mn-a active">Menu</Link>
              <Link href="/about"   className="mn-a">Our Story</Link>
              <Link href="/gallery" className="mn-a">Gallery</Link>
              <Link href="/#order"  className="mn-a">Order Now</Link>
            </div>
            <Link href="/#order" className="mn-btn">Reserve a Table</Link>
            <button className="mn-hamburger" aria-label="Menu"><span/><span/><span/></button>
          </div>
        </header>

        {/* HERO */}
        <div className="mn-hero">
          <div className="mn-hero-bg" style={{ backgroundImage:`url(${s.hero_image_url})` }}/>
          <div className="mn-hero-content">
            <h1 className="mn-hero-title">Menu</h1>
            <div className="mn-breadcrumb">
              <span>🏠</span>
              <Link href="/">Home</Link>
              <span>/</span>
              <span>Menu</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <main className="mn-main">
          <h2 className="mn-page-h1">Our Menu</h2>

          {/* TABS */}
          <div className="mn-tabs">
            <button className={`mn-tab ${activeTab==="all"?"active":""}`} onClick={() => setActiveTab("all")}>
              <span className="mn-tab-icon">🍽️</span> All
            </button>
            {sortedCats.map(cat => (
              <button key={cat} className={`mn-tab ${activeTab===cat?"active":""}`} onClick={() => setActiveTab(cat)}>
                <span className="mn-tab-icon">{ICONS[cat] || "🍴"}</span> {cat}
              </button>
            ))}
          </div>

          {/* GRID */}
          {filtered.length > 0 ? (
            <div className="mn-grid">
              {filtered.map((item, i) => {
                const tags = Array.isArray(item.Tags) ? item.Tags : (item.Tags ? String(item.Tags).split(",").map(t=>t.trim()).filter(Boolean) : []);
                const badge = item.Featured === true || item.Featured === "TRUE" ? "Bestseller" : tags.includes("Popular") ? "Popular" : null;
                return (
                  <div key={item.ID || i} className="mn-card">
                    <div className="mn-card-img">
                      {item.Img
                        ? <img src={item.Img} alt={item.Name} loading={i < 4 ? "eager" : "lazy"}/>
                        : <div className="mn-card-img-placeholder">{ICONS[item.Category] || "🍽️"}</div>
                      }
                      {badge && <span className="mn-card-badge">{badge}</span>}
                    </div>
                    <div className="mn-card-body">
                      <div className="mn-card-name">{item.Name}</div>
                      <div className="mn-card-desc">{item.Desc}</div>
                      <div className="mn-card-footer">
                        <div className="mn-card-price">{item.Price}</div>
                        <div className="mn-card-tags">
                          {tags.slice(0,2).map(tag => {
                            const st = TAG_STYLE[tag] || TAG_STYLE.default;
                            return <span key={tag} className="mn-tag" style={{ background:st.bg, color:st.color }}>{tag}</span>;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mn-empty">
              <div className="mn-empty-icon">🍜</div>
              <div>No items in this category yet.</div>
            </div>
          )}

          {/* CTA */}
          <div className="mn-cta">
            <div className="mn-cta-title">Ready to Dine With Us?</div>
            <div className="mn-cta-sub">Reserve your table and experience it in person.</div>
            <Link href="/#order" className="mn-cta-btn">Reserve a Table →</Link>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="mn-footer">
          <div className="mn-footer-inner">
            <div className="mn-footer-logo">{s.salon_name}</div>
            <div className="mn-footer-links">
              {[["/"," Home"],["/menu","Menu"],["/about","Our Story"],["/gallery","Gallery"],["/#order","Order Now"]].map(([href,label])=>(
                <Link key={href} href={href} className="mn-footer-a">{label}</Link>
              ))}
            </div>
            <div className="mn-footer-copy">© {new Date().getFullYear()} {s.salon_name} — Sharing the warmth of our family kitchen.</div>
          </div>
        </footer>
      </div>
    </>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const FALLBACK_GALLERY = [
  { ID:1, Image_URL:"https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=600&h=600&fit=crop", Caption:"Signature Beef Phở", Category:"Food" },
  { ID:2, Image_URL:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=800&fit=crop", Caption:"Our Elk Grove dining room", Category:"Interior" },
  { ID:3, Image_URL:"https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&h=500&fit=crop", Caption:"Imperial Spring Rolls", Category:"Food" },
  { ID:4, Image_URL:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=700&fit=crop&crop=center", Caption:"Where the magic happens", Category:"Interior" },
  { ID:5, Image_URL:"https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=600&fit=crop", Caption:"Vegetarian Garden Phở", Category:"Food" },
  { ID:6, Image_URL:"https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&h=800&fit=crop", Caption:"Fresh Summer Rolls", Category:"Food" },
  { ID:7, Image_URL:"https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=700&fit=crop", Caption:"Chef An at work", Category:"Team" },
  { ID:8, Image_URL:"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=500&fit=crop", Caption:"Sizzling Lemongrass Pork", Category:"Food" },
  { ID:9, Image_URL:"https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=600&h=800&fit=crop", Caption:"Private dining event", Category:"Event" },
  { ID:10, Image_URL:"https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=500&fit=crop", Caption:"Phở Gà (Chicken)", Category:"Food" },
  { ID:11, Image_URL:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop", Caption:"Our kitchen team", Category:"Team" },
  { ID:12, Image_URL:"https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=500&fit=crop", Caption:"Tết celebration 2024", Category:"Event" },
  { ID:13, Image_URL:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop", Caption:"Vietnamese Iced Coffee", Category:"Food" },
  { ID:14, Image_URL:"https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=700&fit=crop", Caption:"Chè Ba Màu", Category:"Food" },
  { ID:15, Image_URL:"https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&h=500&fit=crop", Caption:"Beverage corner", Category:"Interior" },
];

const CAT_ICONS = { Food:"🍜", Interior:"🏠", Team:"👨‍🍳", Event:"🎉" };

export default function GalleryClient({ gallery = [], settings = {} }) {
  const [activeTab,    setActiveTab]    = useState("all");
  const [lightboxIdx,  setLightboxIdx]  = useState(null);

  const s = {
    salon_name:     settings.salon_name     || "AN PHỞ",
    hero_image_url: settings.hero_image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=500&fit=crop",
  };

  const items = (gallery.length > 0 ? gallery : FALLBACK_GALLERY).filter(g => g.Image_URL);
  const cats  = [...new Set(items.map(g => g.Category).filter(Boolean))];
  const filtered = activeTab === "all" ? items : items.filter(g => g.Category === activeTab);

  // Keyboard nav for lightbox
  useEffect(() => {
    const handler = (e) => {
      if (lightboxIdx === null) return;
      if (e.key === "Escape")      setLightboxIdx(null);
      if (e.key === "ArrowRight")  setLightboxIdx(i => (i + 1) % filtered.length);
      if (e.key === "ArrowLeft")   setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, filtered.length]);

  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIdx]);

  const NAV_LINKS = [["/"," Home"],["/menu","Menu"],["/about","Our Story"],["/gallery","Gallery"],["/#order","Order Now"]];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Be+Vietnam+Pro:wght@300;400;500;600&display=swap');
        .gl-body{font-family:'Be Vietnam Pro',sans-serif;background:#f5f0e8;color:#1c1c17;min-height:100vh;}
        :root{--gold:#815500;--gold-lt:#ffb22e;--red:#c0392b;--primary:#061b0e;--surf:#edeae0;--border:rgba(6,27,14,0.1);--serif:'Bricolage Grotesque',sans-serif;}

        .gl-nav{position:sticky;top:0;z-index:100;background:rgba(245,240,232,0.96);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);height:68px;display:flex;align-items:center;}
        .gl-nav-inner{max-width:1280px;margin:0 auto;padding:0 32px;width:100%;display:flex;align-items:center;justify-content:space-between;}
        .gl-logo{font-family:var(--serif);font-size:24px;font-weight:800;color:var(--gold);font-style:italic;text-decoration:none;}
        .gl-links{display:flex;gap:32px;}
        .gl-a{font-size:14px;font-weight:600;color:rgba(6,27,14,0.6);text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:all 0.2s;}
        .gl-a:hover,.gl-a.active{color:var(--primary);border-bottom-color:var(--gold);}
        .gl-btn{background:var(--gold-lt);color:var(--primary);font-size:14px;font-weight:700;padding:10px 24px;border-radius:8px;border:none;text-decoration:none;}

        .gl-hero{position:relative;height:260px;overflow:hidden;display:flex;align-items:center;justify-content:center;}
        .gl-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.35);}
        .gl-hero-content{position:relative;z-index:2;text-align:center;}
        .gl-hero-title{font-family:var(--serif);font-size:clamp(28px,5vw,56px);font-weight:800;color:#fff;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;}
        .gl-breadcrumb{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:rgba(255,255,255,0.7);}
        .gl-breadcrumb a{color:rgba(255,255,255,0.7);text-decoration:none;}

        .gl-main{max-width:1280px;margin:0 auto;padding:64px 32px 80px;}
        .gl-page-h1{font-family:var(--serif);font-size:clamp(36px,5vw,64px);font-weight:800;color:var(--primary);letter-spacing:-0.02em;text-transform:uppercase;text-align:center;margin-bottom:8px;}
        .gl-page-sub{font-size:16px;color:rgba(6,27,14,0.5);font-style:italic;text-align:center;margin-bottom:48px;}

        /* FEATURED */
        .gl-featured-label{font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:14px;}
        .gl-featured-grid{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:300px 300px;gap:12px;margin-bottom:64px;}
        .gl-featured-item{border-radius:10px;overflow:hidden;cursor:pointer;position:relative;}
        .gl-featured-item img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s;}
        .gl-featured-item:hover img{transform:scale(1.04);}
        .gl-featured-span{grid-row:span 2;}
        .gl-featured-overlay{position:absolute;inset:0;background:rgba(6,27,14,0);display:flex;align-items:flex-end;padding:16px;transition:background 0.3s;}
        .gl-featured-item:hover .gl-featured-overlay{background:rgba(6,27,14,0.3);}
        .gl-featured-cap{color:#fff;font-size:13px;font-weight:600;opacity:0;transform:translateY(8px);transition:all 0.3s;}
        .gl-featured-item:hover .gl-featured-cap{opacity:1;transform:translateY(0);}

        /* TABS */
        .gl-tabs{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:40px;}
        .gl-tab{padding:10px 22px;border-radius:100px;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border:1.5px solid var(--border);background:#fff;color:var(--primary);cursor:pointer;transition:all 0.2s;}
        .gl-tab:hover{border-color:var(--gold);color:var(--gold);}
        .gl-tab.active{background:var(--primary);color:#fff;border-color:var(--primary);}

        /* MASONRY */
        .gl-grid{columns:4;column-gap:14px;}
        .gl-item{break-inside:avoid;margin-bottom:14px;border-radius:10px;overflow:hidden;cursor:pointer;position:relative;display:block;}
        .gl-item img{width:100%;display:block;transition:transform 0.4s;}
        .gl-item:hover img{transform:scale(1.04);}
        .gl-item-overlay{position:absolute;inset:0;background:rgba(6,27,14,0);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:background 0.3s;}
        .gl-item:hover .gl-item-overlay{background:rgba(6,27,14,0.35);}
        .gl-item-icon{font-size:28px;color:#fff;opacity:0;transform:scale(0.8);transition:all 0.3s;}
        .gl-item:hover .gl-item-icon{opacity:1;transform:scale(1);}
        .gl-item-cap{position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(transparent,rgba(6,27,14,0.7));color:#fff;font-size:12px;font-weight:600;opacity:0;transform:translateY(6px);transition:all 0.3s;}
        .gl-item:hover .gl-item-cap{opacity:1;transform:translateY(0);}

        /* LIGHTBOX */
        .gl-lb{position:fixed;inset:0;z-index:999;background:rgba(6,27,14,0.92);display:flex;align-items:center;justify-content:center;padding:20px;}
        .gl-lb-close{position:fixed;top:20px;right:24px;font-size:32px;color:#fff;cursor:pointer;opacity:0.7;transition:opacity 0.2s;background:none;border:none;}
        .gl-lb-close:hover{opacity:1;}
        .gl-lb-content{position:relative;max-width:900px;max-height:90vh;text-align:center;}
        .gl-lb-img{max-width:100%;max-height:80vh;object-fit:contain;border-radius:8px;box-shadow:0 32px 80px rgba(0,0,0,0.4);}
        .gl-lb-cap{color:rgba(255,255,255,0.7);font-size:14px;margin-top:14px;font-style:italic;}
        .gl-lb-nav{position:fixed;top:50%;transform:translateY(-50%);font-size:40px;color:#fff;cursor:pointer;opacity:0.5;padding:16px;background:none;border:none;transition:opacity 0.2s;}
        .gl-lb-nav:hover{opacity:1;}
        .gl-lb-prev{left:8px;}
        .gl-lb-next{right:8px;}
        .gl-lb-counter{color:rgba(255,255,255,0.5);font-size:13px;margin-top:8px;}

        /* CTA */
        .gl-cta{text-align:center;margin-top:80px;padding:56px 40px;background:#fff;border-radius:16px;border:0.5px solid var(--border);}
        .gl-cta-h2{font-family:var(--serif);font-size:clamp(24px,3vw,40px);font-weight:800;color:var(--primary);margin-bottom:10px;}
        .gl-cta-sub{font-size:15px;color:rgba(6,27,14,0.55);margin-bottom:28px;}
        .gl-cta-btn{display:inline-block;background:var(--red);color:#fff;font-family:var(--serif);font-size:16px;font-weight:700;padding:14px 40px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;transition:all 0.2s;}
        .gl-cta-btn:hover{background:#a93226;transform:translateY(-2px);}

        /* FOOTER */
        .gl-footer{background:var(--surf);border-top:0.5px solid var(--border);padding:48px 32px 32px;}
        .gl-footer-inner{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px;}
        .gl-footer-logo{font-family:var(--serif);font-size:28px;font-weight:800;color:var(--gold);font-style:italic;}
        .gl-footer-links{display:flex;gap:28px;flex-wrap:wrap;justify-content:center;}
        .gl-footer-a{font-size:14px;font-weight:600;color:rgba(6,27,14,0.5);text-decoration:none;}
        .gl-footer-a:hover{color:var(--primary);}
        .gl-footer-copy{font-size:13px;color:rgba(6,27,14,0.35);font-style:italic;}

        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .gl-item{animation:fadeIn 0.3s ease;}

        @media(max-width:1024px){.gl-grid{columns:3;}.gl-featured-grid{grid-template-columns:1fr 1fr;grid-template-rows:auto;}.gl-featured-span{grid-row:span 1;height:240px;}.gl-featured-item{height:240px;}}
        @media(max-width:768px){.gl-links,.gl-btn{display:none!important;}.gl-main{padding:40px 20px 60px;}.gl-grid{columns:2;}.gl-featured-grid{grid-template-columns:1fr;grid-template-rows:auto;}.gl-featured-item,.gl-featured-span{height:220px;}.gl-footer{padding:48px 20px 32px;}}
      `}</style>

      <div className="gl-body">
        {/* LIGHTBOX */}
        {lightboxIdx !== null && (
          <div className="gl-lb" onClick={e => { if (e.target === e.currentTarget) setLightboxIdx(null); }}>
            <button className="gl-lb-close" onClick={() => setLightboxIdx(null)}>✕</button>
            <button className="gl-lb-nav gl-lb-prev" onClick={() => setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length)}>‹</button>
            <div className="gl-lb-content">
              <img className="gl-lb-img" src={filtered[lightboxIdx]?.Image_URL} alt={filtered[lightboxIdx]?.Caption || "Gallery"}/>
              {filtered[lightboxIdx]?.Caption && <div className="gl-lb-cap">{filtered[lightboxIdx].Caption}</div>}
              <div className="gl-lb-counter">{lightboxIdx + 1} / {filtered.length}</div>
            </div>
            <button className="gl-lb-nav gl-lb-next" onClick={() => setLightboxIdx(i => (i + 1) % filtered.length)}>›</button>
          </div>
        )}

        {/* NAV */}
        <header className="gl-nav">
          <div className="gl-nav-inner">
            <Link href="/" className="gl-logo">{s.salon_name}</Link>
            <div className="gl-links">
              {NAV_LINKS.map(([href,label])=>(
                <Link key={href} href={href} className={`gl-a ${href==="/gallery"?"active":""}`}>{label}</Link>
              ))}
            </div>
            <Link href="/#order" className="gl-btn">Reserve a Table</Link>
          </div>
        </header>

        {/* HERO */}
        <div className="gl-hero">
          <div className="gl-hero-bg" style={{ backgroundImage:`url(${s.hero_image_url})` }}/>
          <div className="gl-hero-content">
            <h1 className="gl-hero-title">Gallery</h1>
            <div className="gl-breadcrumb">
              <span>🏠</span><Link href="/">Home</Link><span>/</span><span>Gallery</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <main className="gl-main">
          <h2 className="gl-page-h1">A Feast for the Eyes</h2>
          <div className="gl-page-sub">From our kitchen to your screen — moments worth sharing</div>

          {/* FEATURED — first 5 items when showing all */}
          {activeTab === "all" && items.length >= 5 && (
            <div style={{ marginBottom:64 }}>
              <div className="gl-featured-label">⭐ Featured</div>
              <div className="gl-featured-grid">
                {items.slice(0,5).map((item, i) => (
                  <div key={item.ID || i} className={`gl-featured-item ${i===0?"gl-featured-span":""}`}
                    onClick={() => setLightboxIdx(i)}>
                    <img src={item.Image_URL} alt={item.Caption || "Gallery"} loading={i===0?"eager":"lazy"}/>
                    <div className="gl-featured-overlay">
                      <span className="gl-featured-cap">{item.Caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABS */}
          <div className="gl-tabs">
            <button className={`gl-tab ${activeTab==="all"?"active":""}`} onClick={() => setActiveTab("all")}>All Photos</button>
            {cats.map(cat => (
              <button key={cat} className={`gl-tab ${activeTab===cat?"active":""}`} onClick={() => setActiveTab(cat)}>
                {CAT_ICONS[cat] || "📷"} {cat}
              </button>
            ))}
          </div>

          {/* MASONRY */}
          <div className="gl-grid">
            {filtered.map((item, i) => (
              <div key={item.ID || i} className="gl-item" onClick={() => setLightboxIdx(i)}>
                <img src={item.Image_URL} alt={item.Caption || "Gallery"} loading={i < 8 ? "eager" : "lazy"}/>
                <div className="gl-item-overlay">
                  <span className="gl-item-icon">🔍</span>
                </div>
                {item.Caption && <div className="gl-item-cap">{item.Caption}</div>}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="gl-cta">
            <div className="gl-cta-h2">Hungry Now?</div>
            <div className="gl-cta-sub">Reserve your table and experience it in person.</div>
            <Link href="/#order" className="gl-cta-btn">Reserve a Table →</Link>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="gl-footer">
          <div className="gl-footer-inner">
            <div className="gl-footer-logo">{s.salon_name}</div>
            <div className="gl-footer-links">
              {NAV_LINKS.map(([href,label])=>(
                <Link key={href} href={href} className="gl-footer-a">{label}</Link>
              ))}
            </div>
            <div className="gl-footer-copy">© {new Date().getFullYear()} {s.salon_name} — Sharing the warmth of our family kitchen.</div>
          </div>
        </footer>
      </div>
    </>
  );
}

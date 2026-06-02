"use client";
import Link from "next/link";

const TIMELINE = [
  { year:"1975", icon:"🍜", title:"The Original Recipe",    desc:"Bà Nội begins perfecting her pho broth in Saigon — a recipe born from necessity, passed down through memory, never on paper." },
  { year:"1992", icon:"✈️", title:"A New Beginning",        desc:"The family arrives in California. The recipe travels with them — in memory, not on paper." },
  { year:"2010", icon:"🏠", title:"AN PHỞ Opens",           desc:"Our first restaurant opens. 47 seats. One menu. One dream. Fully booked in the first week." },
  { year:"2018", icon:"⭐", title:"Best Vietnamese Restaurant", desc:"Named Best Vietnamese Restaurant in Sacramento Magazine for three consecutive years." },
  { year:"2024", icon:"🎉", title:"Second Location Opens",  desc:"Downtown Sacramento location opens. Same broth. Same family. More tables to share the warmth." },
];

const VALUES = [
  { icon:"⏱️", title:"Patience",     desc:"Great broth cannot be rushed. We simmer for 24 hours — no shortcuts, no compromises." },
  { icon:"🌿", title:"Freshness",    desc:"Herbs sourced daily. Produce local when possible. Flavor you can taste in every bite." },
  { icon:"👨‍👩‍👧", title:"Family",    desc:"Every guest is treated like family. That's not marketing — it's how we were raised." },
  { icon:"🇻🇳", title:"Authenticity", desc:"Recipes unchanged for three generations. We honor tradition while welcoming everyone to the table." },
];

export default function AboutClient({ settings = {}, about = {} }) {
  const s = {
    salon_name:    settings.salon_name    || "AN PHỞ",
    hero_image_url: settings.hero_image_url || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=500&fit=crop",
    facebook_url:  settings.facebook_url  || "",
    instagram_url: settings.instagram_url || "",
  };

  const a = {
    story:      about.story     || "AN PHỞ was born from a simple belief: the best food comes from patience, love, and family tradition. Our grandmother started simmering her first pot of broth in Saigon — a recipe passed down through generations, never written, always felt.",
    story2:     about.story2    || "When we opened our first location in 2010, we brought that same 24-hour broth, those same hand-selected herbs, and that same warmth across the ocean. Every bowl we serve is a piece of home.",
    chef_quote: about.chef_quote || "It's not just food, it's a hug in a bowl. My grandmother taught me that the secret is in the patience — never rushing the broth.",
    chef_name:  about.chef_name  || "Chef An, Founder",
    est_year:   about.est_year   || "2010",
    stat_1_number: about.stat_1_number || "14+", stat_1_label: about.stat_1_label || "Years Open",
    stat_2_number: about.stat_2_number || "2",   stat_2_label: about.stat_2_label || "Locations",
    stat_3_number: about.stat_3_number || "24h", stat_3_label: about.stat_3_label || "Broth Simmered",
    story_img:  about.story_img || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=700&fit=crop",
  };

  const NAV_LINKS = [["/"," Home"],["/menu","Menu"],["/about","Our Story"],["/gallery","Gallery"],["/#order","Order Now"]];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .ab-body{font-family:'Be Vietnam Pro',sans-serif;background:#f5f0e8;color:#1c1c17;min-height:100vh;}
        :root{--gold:#815500;--gold-lt:#ffb22e;--red:#c0392b;--primary:#061b0e;--surf:#edeae0;--border:rgba(6,27,14,0.1);--serif:'Bricolage Grotesque',sans-serif;}

        .ab-nav{position:sticky;top:0;z-index:100;background:rgba(245,240,232,0.96);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);height:68px;display:flex;align-items:center;}
        .ab-nav-inner{max-width:1280px;margin:0 auto;padding:0 32px;width:100%;display:flex;align-items:center;justify-content:space-between;}
        .ab-logo{font-family:var(--serif);font-size:24px;font-weight:800;color:var(--gold);font-style:italic;text-decoration:none;}
        .ab-links{display:flex;gap:32px;}
        .ab-a{font-size:14px;font-weight:600;color:rgba(6,27,14,0.6);text-decoration:none;padding-bottom:2px;border-bottom:2px solid transparent;transition:all 0.2s;}
        .ab-a:hover,.ab-a.active{color:var(--primary);border-bottom-color:var(--gold);}
        .ab-btn{background:var(--gold-lt);color:var(--primary);font-size:14px;font-weight:700;padding:10px 24px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;}

        .ab-hero{position:relative;height:280px;overflow:hidden;display:flex;align-items:center;justify-content:center;}
        .ab-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(0.4);}
        .ab-hero-content{position:relative;z-index:2;text-align:center;}
        .ab-hero-title{font-family:var(--serif);font-size:clamp(28px,5vw,56px);font-weight:800;color:#fff;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px;}
        .ab-breadcrumb{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:rgba(255,255,255,0.7);}
        .ab-breadcrumb a{color:rgba(255,255,255,0.7);text-decoration:none;}

        .ab-section{padding:80px 32px;}
        .ab-container{max-width:1280px;margin:0 auto;}

        /* INTRO */
        .ab-intro{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
        .ab-img-wrap{position:relative;}
        .ab-img-main{width:100%;height:500px;object-fit:cover;clip-path:polygon(0 0,100% 0,100% 88%,88% 100%,0 100%);box-shadow:0 24px 60px rgba(6,27,14,0.15);}
        .ab-img-badge{position:absolute;bottom:-20px;right:32px;width:116px;height:116px;border-radius:50%;border:3px dashed var(--gold);background:#f5f0e8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px;box-shadow:0 8px 24px rgba(0,0,0,0.1);}
        .ab-badge-year{font-family:var(--serif);font-size:20px;font-weight:800;color:var(--gold);line-height:1.2;}
        .ab-badge-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--primary);}
        .ab-eyebrow{display:inline-flex;align-items:center;gap:8px;background:var(--gold-lt);color:var(--primary);font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:20px;}
        .ab-h2{font-family:var(--serif);font-size:clamp(32px,4vw,52px);font-weight:800;color:var(--primary);letter-spacing:-0.02em;margin-bottom:24px;line-height:1.15;}
        .ab-h2 em{color:var(--gold);font-style:italic;}
        .ab-text{font-size:16px;line-height:1.85;color:rgba(6,27,14,0.65);margin-bottom:20px;}
        .ab-hand-div{height:4px;width:120px;margin:20px 0;background:url("data:image/svg+xml,%3Csvg width='100' height='4' viewBox='0 0 100 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 2C20 1 40 3 60 2C80 1 100 3 100 2' stroke='%23061b0e' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") repeat-x;}
        .ab-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(6,27,14,0.1);border:1px solid rgba(6,27,14,0.1);border-radius:12px;overflow:hidden;margin-top:32px;}
        .ab-stat{background:#f5f0e8;padding:24px;text-align:center;}
        .ab-stat-num{font-family:var(--serif);font-size:36px;font-weight:800;color:var(--gold);display:block;}
        .ab-stat-label{font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(6,27,14,0.5);margin-top:4px;display:block;}

        /* QUOTE */
        .ab-quote-section{background:var(--surf);padding:80px 32px;}
        .ab-quote-inner{max-width:800px;margin:0 auto;text-align:center;}
        .ab-quote-mark{font-family:var(--serif);font-size:80px;color:var(--gold);opacity:0.3;line-height:0.5;margin-bottom:24px;}
        .ab-quote-text{font-family:var(--serif);font-size:clamp(20px,3vw,30px);font-weight:600;font-style:italic;color:var(--primary);line-height:1.55;margin-bottom:20px;}
        .ab-quote-author{font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);}

        /* TIMELINE */
        .ab-tl-section{background:#f5f0e8;padding:80px 32px;}
        .ab-tl-head{text-align:center;margin-bottom:60px;}
        .ab-tl-eyebrow{font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;}
        .ab-tl-h2{font-family:var(--serif);font-size:clamp(28px,3.5vw,48px);font-weight:800;color:var(--primary);}
        .ab-tl{position:relative;max-width:900px;margin:0 auto;}
        .ab-tl::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(6,27,14,0.1);transform:translateX(-50%);}
        .ab-tl-item{display:grid;grid-template-columns:1fr 64px 1fr;gap:0;margin-bottom:48px;align-items:start;}
        .ab-tl-left{padding-right:36px;text-align:right;}
        .ab-tl-right{padding-left:36px;}
        .ab-tl-center{display:flex;align-items:flex-start;justify-content:center;padding-top:4px;}
        .ab-tl-dot{width:48px;height:48px;border-radius:50%;background:var(--gold);color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 16px rgba(129,85,0,0.3);}
        .ab-tl-year{font-family:var(--serif);font-size:26px;font-weight:800;color:var(--gold);margin-bottom:6px;}
        .ab-tl-title{font-family:var(--serif);font-size:18px;font-weight:700;color:var(--primary);margin-bottom:6px;}
        .ab-tl-desc{font-size:14px;line-height:1.7;color:rgba(6,27,14,0.6);}

        /* VALUES */
        .ab-values{background:var(--primary);padding:80px 32px;}
        .ab-values-head{text-align:center;margin-bottom:48px;}
        .ab-values-h2{font-family:var(--serif);font-size:clamp(28px,3.5vw,48px);font-weight:800;color:#fff;}
        .ab-values-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1280px;margin:0 auto;}
        .ab-value-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px 20px;text-align:center;transition:background 0.3s;}
        .ab-value-card:hover{background:rgba(255,255,255,0.1);}
        .ab-value-icon{font-size:36px;margin-bottom:14px;}
        .ab-value-title{font-family:var(--serif);font-size:18px;font-weight:800;color:#fff;margin-bottom:10px;}
        .ab-value-desc{font-size:13px;line-height:1.7;color:rgba(255,255,255,0.6);}

        /* CTA */
        .ab-cta{background:#f5f0e8;padding:80px 32px;text-align:center;}
        .ab-cta-h2{font-family:var(--serif);font-size:clamp(28px,4vw,48px);font-weight:800;color:var(--primary);margin-bottom:12px;}
        .ab-cta-sub{font-size:16px;color:rgba(6,27,14,0.55);margin-bottom:32px;}
        .ab-cta-btn{display:inline-block;background:var(--red);color:#fff;font-family:var(--serif);font-size:16px;font-weight:700;padding:14px 40px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;transition:all 0.2s;}
        .ab-cta-btn:hover{background:#a93226;transform:translateY(-2px);}

        /* FOOTER */
        .ab-footer{background:var(--surf);border-top:0.5px solid var(--border);padding:48px 32px 32px;}
        .ab-footer-inner{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:20px;}
        .ab-footer-logo{font-family:var(--serif);font-size:28px;font-weight:800;color:var(--gold);font-style:italic;}
        .ab-footer-links{display:flex;gap:28px;flex-wrap:wrap;justify-content:center;}
        .ab-footer-a{font-size:14px;font-weight:600;color:rgba(6,27,14,0.5);text-decoration:none;}
        .ab-footer-a:hover{color:var(--primary);}
        .ab-footer-copy{font-size:13px;color:rgba(6,27,14,0.35);font-style:italic;}

        @media(max-width:1024px){.ab-intro{grid-template-columns:1fr;gap:48px;}.ab-img-main{height:360px;}.ab-values-grid{grid-template-columns:1fr 1fr;}.ab-tl-item{grid-template-columns:1fr;}.ab-tl::before{left:24px;}.ab-tl-left{text-align:left;padding-left:72px;padding-right:0;}.ab-tl-right{padding-left:72px;}.ab-tl-center{position:absolute;left:0;}.ab-tl-item{position:relative;margin-bottom:40px;}}
        @media(max-width:768px){.ab-links,.ab-btn{display:none!important;}.ab-section,.ab-tl-section,.ab-quote-section,.ab-values,.ab-cta{padding:56px 20px;}.ab-values-grid{grid-template-columns:1fr 1fr;}.ab-footer{padding:48px 20px 32px;}}
      `}</style>

      <div className="ab-body">
        {/* NAV */}
        <header className="ab-nav">
          <div className="ab-nav-inner">
            <Link href="/" className="ab-logo">{s.salon_name}</Link>
            <div className="ab-links">
              {NAV_LINKS.map(([href, label]) => (
                <Link key={href} href={href} className={`ab-a ${href==="/about"?"active":""}`}>{label}</Link>
              ))}
            </div>
            <Link href="/#order" className="ab-btn">Reserve a Table</Link>
          </div>
        </header>

        {/* HERO */}
        <div className="ab-hero">
          <div className="ab-hero-bg" style={{ backgroundImage:`url(${s.hero_image_url})` }}/>
          <div className="ab-hero-content">
            <h1 className="ab-hero-title">Our Story</h1>
            <div className="ab-breadcrumb">
              <span>🏠</span><Link href="/">Home</Link><span>/</span><span>Our Story</span>
            </div>
          </div>
        </div>

        {/* INTRO */}
        <section className="ab-section" style={{ background:"#f5f0e8" }}>
          <div className="ab-container">
            <div className="ab-intro">
              <div className="ab-img-wrap">
                <img className="ab-img-main" src={a.story_img} alt="Our kitchen"/>
                <div className="ab-img-badge">
                  <span className="ab-badge-year">Est.<br/>{a.est_year}</span>
                  <span className="ab-badge-label">Family<br/>Recipe</span>
                </div>
              </div>
              <div>
                <div className="ab-eyebrow">📖 Our Story</div>
                <h2 className="ab-h2">From Our Kitchen<br/>to <em>Your Table</em></h2>
                <p className="ab-text">{a.story}</p>
                <div className="ab-hand-div"/>
                <p className="ab-text">{a.story2}</p>
                <div className="ab-stats">
                  {[[a.stat_1_number,a.stat_1_label],[a.stat_2_number,a.stat_2_label],[a.stat_3_number,a.stat_3_label]].map(([n,l])=>(
                    <div key={l} className="ab-stat">
                      <span className="ab-stat-num">{n}</span>
                      <span className="ab-stat-label">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <div className="ab-quote-section">
          <div className="ab-quote-inner">
            <div className="ab-quote-mark">"</div>
            <div className="ab-quote-text">{a.chef_quote}</div>
            <div className="ab-quote-author">— {a.chef_name}</div>
          </div>
        </div>

        {/* TIMELINE */}
        <section className="ab-tl-section">
          <div className="ab-container">
            <div className="ab-tl-head">
              <div className="ab-tl-eyebrow">Our Journey</div>
              <h2 className="ab-tl-h2">How We Got Here</h2>
            </div>
            <div className="ab-tl">
              {TIMELINE.map((item, i) => (
                <div key={i} className="ab-tl-item">
                  {i % 2 === 0 ? (
                    <>
                      <div className="ab-tl-left">
                        <div className="ab-tl-year">{item.year}</div>
                        <div className="ab-tl-title">{item.title}</div>
                        <div className="ab-tl-desc">{item.desc}</div>
                      </div>
                      <div className="ab-tl-center"><div className="ab-tl-dot">{item.icon}</div></div>
                      <div/>
                    </>
                  ) : (
                    <>
                      <div/>
                      <div className="ab-tl-center"><div className="ab-tl-dot">{item.icon}</div></div>
                      <div className="ab-tl-right">
                        <div className="ab-tl-year">{item.year}</div>
                        <div className="ab-tl-title">{item.title}</div>
                        <div className="ab-tl-desc">{item.desc}</div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="ab-values">
          <div className="ab-values-head">
            <h2 className="ab-values-h2">What We Believe In</h2>
          </div>
          <div className="ab-values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="ab-value-card">
                <div className="ab-value-icon">{v.icon}</div>
                <div className="ab-value-title">{v.title}</div>
                <div className="ab-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="ab-cta">
          <div className="ab-container">
            <div className="ab-cta-h2">Come Experience It Yourself</div>
            <div className="ab-cta-sub">A bowl of phở is worth a thousand words. Reserve your table today.</div>
            <Link href="/#order" className="ab-cta-btn">Reserve a Table →</Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ab-footer">
          <div className="ab-footer-inner">
            <div className="ab-footer-logo">{s.salon_name}</div>
            <div className="ab-footer-links">
              {NAV_LINKS.map(([href,label])=>(
                <Link key={href} href={href} className="ab-footer-a">{label}</Link>
              ))}
            </div>
            <div className="ab-footer-copy">© {new Date().getFullYear()} {s.salon_name} — Sharing the warmth of our family kitchen.</div>
          </div>
        </footer>
      </div>
    </>
  );
}

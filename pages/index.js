import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

// ─── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
:root {
  --red:    #c8102e;
  --navy:   #0a0e1a;
  --black:  #111;
  --text:   #1a1a1a;
  --sub:    #555;
  --muted:  #888;
  --border: #e8e8e8;
  --bg:     #fff;
  --bgoff:  #f6f6f6;
  --sans:   'Libre Franklin', 'Franklin Gothic Medium', Arial Narrow, Arial, sans-serif;
  --max:    1140px;
}
html { font-size: 16px; }
body { font-family: var(--sans); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
img  { display: block; max-width: 100%; }
button { cursor: pointer; font-family: var(--sans); }

/* NAV */
.nav { background: var(--navy); position: sticky; top: 0; z-index: 300; }
.nav-inner { max-width: var(--max); margin: 0 auto; display: flex; align-items: center; height: 52px; padding: 0 16px; }
.logo { display: flex; align-items: center; gap: 10px; cursor: pointer; flex-shrink: 0; margin-right: 28px; }
.logo-badge { width: 48px; height: 48px; background: var(--red); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; color: #fff; letter-spacing: -0.05em; position: relative; overflow: hidden; }
.logo-badge-devil { position: absolute; inset: 0; background-size: 80%; background-repeat: no-repeat; background-position: center 60%; opacity: 0.18; filter: brightness(10); }
.logo-badge-text { position: relative; z-index: 1; }
.logo-top { font-size: 13px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1.15; }
.logo-top em { color: #f5a623; font-style: normal; }
.logo-sub { font-size: 9px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.12em; }
.nav-links { display: flex; gap: 2px; flex: 1; }
.nav-links button { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.06em; padding: 6px 12px; background: none; border: none; border-radius: 2px; transition: color 0.15s, background 0.15s; }
.nav-links button:hover, .nav-links button.active { color: #fff; background: rgba(255,255,255,0.1); }
.live-badge { display: flex; align-items: center; gap: 6px; background: var(--red); color: #fff; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; padding: 5px 11px; margin-left: auto; }
.pip { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: pip 1.6s ease infinite; }
@keyframes pip { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.2;transform:scale(.6)} }

/* HERO */
.hero-wrap { max-width: var(--max); margin: 24px auto 0; padding: 0 16px; }
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.hero-main { position: relative; overflow: hidden; aspect-ratio: 16/9; cursor: pointer; background: #111; }
.hero-main:hover .hmimg { transform: scale(1.03); }
.hmimg { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; filter: brightness(0.7); }
.hm-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.1) 55%, transparent 100%); }
.hm-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 22px; }
.cat-badge { display: inline-block; background: var(--red); color: #fff; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; padding: 3px 8px; margin-bottom: 9px; }
.hm-title { font-size: clamp(17px, 2.2vw, 26px); font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 8px; }
.hm-meta { font-size: 11px; color: rgba(255,255,255,.6); font-weight: 500; }
.hm-meta strong { color: rgba(255,255,255,.85); }
.hero-right { display: flex; flex-direction: column; gap: 4px; }
.hr-card { display: flex; cursor: pointer; overflow: hidden; flex: 1; background: #f9f9f9; border: 1px solid var(--border); transition: background 0.15s; }
.hr-card:hover { background: #f0f0f0; }
.hr-img { width: 110px; min-width: 110px; object-fit: cover; height: 100%; }
.hr-ph { width: 110px; min-width: 110px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #bbb; }
.hr-body { padding: 10px 12px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.hr-cat { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--red); }
.hr-title { font-size: 13.5px; font-weight: 700; line-height: 1.3; color: var(--black); }
.hr-card:hover .hr-title { color: var(--red); }
.hr-meta { font-size: 10.5px; color: var(--muted); }

/* BODY */
.body-wrap { max-width: var(--max); margin: 28px auto; padding: 0 16px; }

/* SECTION HEADS */
.sec-head { display: flex; align-items: baseline; gap: 16px; border-bottom: 3px solid var(--black); padding-bottom: 6px; margin-bottom: 16px; }
.sec-head-red { border-bottom-color: var(--red); }
.sec-title { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em; color: var(--black); }
.sec-more { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--red); margin-left: auto; cursor: pointer; background: none; border: none; transition: opacity 0.15s; }
.sec-more:hover { opacity: 0.65; }

/* LIVE SECTION CONTROLS */
.live-head { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid var(--red); padding-bottom: 6px; margin-bottom: 16px; }
.live-title { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.03em; color: var(--black); }
.live-pill { display: flex; align-items: center; gap: 5px; background: var(--red); color: #fff; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; padding: 3px 9px; }
.live-pill .lpip { width: 5px; height: 5px; border-radius: 50%; background: #fff; animation: pip 1.6s ease infinite; }
.refresh-btn { margin-left: auto; display: flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--border); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); padding: 5px 12px; transition: border-color 0.15s, color 0.15s; }
.refresh-btn:hover:not(:disabled) { border-color: var(--red); color: var(--red); }
.refresh-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.spin { display: inline-block; animation: spin 0.8s linear infinite; }
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

/* SKELETONS */
.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 32px; }
.skel-img { width:100%; aspect-ratio:16/9; background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; margin-bottom:10px; }
.skel-line { height:12px; border-radius:3px; background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; margin-bottom:8px; }
.sl-w { width:90%; } .sl-m { width:65%; } .sl-s { width:40%; }
@keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }

/* GRID CARDS */
.g4-card { cursor: pointer; }
.g4-card:hover .g4-title { color: var(--red); }
.g4-img { width:100%; aspect-ratio:16/9; object-fit:cover; margin-bottom:10px; transition:opacity 0.2s; }
.g4-card:hover .g4-img { opacity:.88; }
.g4-ph { width:100%; aspect-ratio:16/9; background:#e8e8e8; display:flex; align-items:center; justify-content:center; font-size:26px; color:#bbb; margin-bottom:10px; }
.g4-cat { font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--red); margin-bottom:5px; }
.g4-title { font-size:15px; font-weight:800; line-height:1.28; color:var(--black); margin-bottom:6px; }
.g4-meta { font-size:11px; color:var(--muted); font-weight:500; }
.g4-meta strong { color:var(--sub); font-weight:600; }
.reporter-label { font-size:11px; color:var(--muted); font-weight:500; text-transform:uppercase; letter-spacing:0.06em; }

/* BIG FEATURE */
.big-feature { display:grid; grid-template-columns:1fr 1fr; gap:24px; border:1px solid var(--border); padding:20px; margin-bottom:32px; cursor:pointer; transition:background 0.15s; }
.big-feature:hover { background:var(--bgoff); }
.big-feature:hover .bf-title { color:var(--red); }
.bf-img { width:100%; aspect-ratio:16/9; object-fit:cover; }
.bf-ph { width:100%; aspect-ratio:16/9; background:#ddd; display:flex; align-items:center; justify-content:center; font-size:40px; color:#bbb; }
.bf-body { display:flex; flex-direction:column; justify-content:center; gap:10px; }
.bf-cat { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.12em; color:var(--red); }
.bf-title { font-size:22px; font-weight:900; line-height:1.2; color:var(--black); }
.bf-excerpt { font-size:14px; color:var(--sub); line-height:1.6; }
.bf-meta { font-size:11.5px; color:var(--muted); }
.bf-meta strong { color:var(--sub); font-weight:600; }

/* COMPACT LIST */
.compact { display:grid; grid-template-columns:1fr 1fr; gap:0; margin-bottom:32px; }
.cl-item { display:flex; gap:12px; padding:14px 0; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.1s; }
.cl-item:nth-child(odd) { padding-right:20px; border-right:1px solid var(--border); }
.cl-item:nth-child(even) { padding-left:20px; }
.cl-item:hover { background:var(--bgoff); }
.cl-item:hover .cl-title { color:var(--red); }
.cl-img { width:90px; min-width:90px; height:60px; object-fit:cover; flex-shrink:0; }
.cl-ph { width:90px; min-width:90px; height:60px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; font-size:16px; color:#bbb; flex-shrink:0; }
.cl-cat { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:var(--red); margin-bottom:4px; }
.cl-title { font-size:13.5px; font-weight:700; line-height:1.28; color:var(--black); margin-bottom:4px; }
.cl-meta { font-size:10.5px; color:var(--muted); }
.cl-meta strong { color:var(--sub); }

/* ERROR */
.err-box { background:#fff5f5; border:1px solid #fcc; color:#c00; font-size:12.5px; padding:12px 16px; margin-bottom:20px; }

/* ARTICLE VIEW */
.article-wrap { max-width:780px; margin:24px auto; padding:0 16px 60px; animation:fadein 0.3s ease; }
@keyframes fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
.back-btn { display:inline-flex; align-items:center; gap:7px; font-size:11.5px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.07em; background:none; border:none; padding:0; margin-bottom:20px; transition:color 0.15s; }
.back-btn:hover { color:var(--red); }
.av-img { width:100%; aspect-ratio:16/9; object-fit:cover; margin-bottom:18px; }
.av-ph { width:100%; aspect-ratio:16/9; background:#e8e8e8; display:flex; align-items:center; justify-content:center; font-size:56px; color:#ccc; margin-bottom:18px; }
.av-cat { display:inline-block; background:var(--red); color:#fff; font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.14em; padding:3px 9px; margin-bottom:12px; }
.av-title { font-size:clamp(24px,3.5vw,36px); font-weight:900; line-height:1.15; color:var(--black); margin-bottom:10px; letter-spacing:-0.02em; }
.av-dek { font-size:16.5px; color:var(--sub); line-height:1.55; font-style:italic; margin-bottom:14px; }
.av-byline { font-size:12.5px; color:var(--muted); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:10px 0; margin-bottom:24px; display:flex; gap:8px; align-items:center; }
.av-byline strong { color:var(--black); font-weight:700; }
.av-byline .sep { color:var(--border); }
.av-body p { font-size:17px; line-height:1.8; color:#222; margin-bottom:20px; }
.av-body p:first-of-type::first-letter { font-size:4.2em; font-weight:900; float:left; line-height:0.72; color:var(--red); margin:5px 7px 0 0; }
.av-body blockquote { margin:24px 0; padding:0 0 0 18px; border-left:4px solid var(--red); }
.av-body blockquote p { font-size:19px; font-style:italic; font-weight:600; color:var(--sub); line-height:1.55; margin:0; }
.av-body blockquote p::first-letter { all:unset; }
.av-tags { display:flex; flex-wrap:wrap; gap:7px; margin-top:28px; padding-top:18px; border-top:1px solid var(--border); }
.av-tag { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; border:1px solid #ccc; color:var(--muted); padding:5px 12px; cursor:pointer; transition:border-color 0.15s, color 0.15s; }
.av-tag:hover { border-color:var(--red); color:var(--red); }

/* FOOTER */
.footer { background:var(--navy); color:#aaa; padding:24px 16px; margin-top:48px; }
.footer-inner { max-width:var(--max); margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.footer-logo { font-size:15px; font-weight:900; color:#fff; text-transform:uppercase; letter-spacing:0.04em; }
.footer-logo em { color:#f5a623; font-style:normal; }
.footer-copy { font-size:11px; color:#666; }
.footer-links { display:flex; gap:14px; }
.footer-links button { background:none; border:none; color:#888; font-size:10.5px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; transition:color 0.15s; }
.footer-links button:hover { color:#fff; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-right { display: none; }
  .grid-4 { grid-template-columns: 1fr 1fr; }
  .compact { grid-template-columns: 1fr; }
  .cl-item:nth-child(odd) { border-right: none; padding-right: 0; }
  .cl-item:nth-child(even) { padding-left: 0; }
  .big-feature { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}
@media (max-width: 560px) {
  .grid-4 { grid-template-columns: 1fr; }
  .hm-title { font-size: 18px; }
}
`

// ─── HELPERS ────────────────────────────────────────────────────────────────

const CAT_COLOURS = {
  'Match Report': '#c8102e', 'Transfer News': '#1a472a', 'Transfers': '#1a472a',
  'Club News': '#0a0e1a', 'Injury Update': '#b85c00', 'Premier League': '#3d0099',
  'Opinion': '#444', 'Player Focus': '#8b0000', 'Finance': '#1a3a5c',
  'Preview': '#004494', 'Analysis': '#333'
}

// v2 - SafeImg with category-coloured placeholders
function SafeImg({ src, alt, imgClass, phClass, category = '' }) {
  const [err, setErr] = useState(false)
  const bg = CAT_COLOURS[category] || '#0a0e1a'

  if (!src || err) {
    return (
      <div className={phClass} style={{
        background: bg, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        color: 'rgba(255,255,255,0.55)', fontSize: 11,
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'
      }}>
        <span style={{ fontSize: 26 }}>⚽</span>
        <span>{category || 'Man Utd'}</span>
      </div>
    )
  }
  return <img src={src} alt={alt} className={imgClass} onError={() => setErr(true)} />
}

function ArticleBody({ text }) {
  if (!text) return null
  return (
    <div className="av-body">
      {text.split('\n\n').map((para, i) => {
        const t = para.trim()
        if (!t) return null
        if (t.startsWith('QUOTE:')) {
          return <blockquote key={i}><p>{t.replace('QUOTE:', '').trim()}</p></blockquote>
        }
        return <p key={i}>{t}</p>
      })}
    </div>
  )
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Home({ initialArticles }) {
  const [active, setActive] = useState(null)
  const [nav, setNav] = useState('Home')
  const [articles, setArticles] = useState(initialArticles || [])
  const [liveArticles, setLiveArticles] = useState([])
  const [liveState, setLiveState] = useState('idle')

  // Separate fan vs live articles
  const fanArticles = articles.filter(a => !a.is_live)
  // Hero always uses live news if available, fallback to fan
  const heroArticle = liveArticles[0] || fanArticles[0]
  const heroRow = liveArticles.length >= 4
    ? liveArticles.slice(1, 5)
    : [...liveArticles.slice(1), ...fanArticles].slice(0, 4)
  // Fan content — shown at bottom as ~15% of page (just 1 section)
  const fanSpotlight = fanArticles.slice(0, 2) // just 2 fan picks at the bottom
  const compact = fanArticles.slice(2, 8)
  const feature = fanArticles.find(a => a.category === 'Transfers') || fanArticles[2]
  const playerFocus = fanArticles.filter(a => a.category === 'Player Focus')

  const loadLiveNews = useCallback(async () => {
    setLiveState('loading')
    try {
      const res = await fetch('/api/articles?live=true&limit=12')
      const data = await res.json()
      setLiveArticles(data.articles || [])
      setLiveState('done')
    } catch (e) {
      setLiveState('error')
    }
  }, [])

  useEffect(() => { loadLiveNews() }, [loadLiveNews])

  function open(article) {
    setActive(article)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function home() {
    setActive(null)
    setNav('Home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <>
      <Head>
        <title>The Stretford End — Manchester United Fan Blog</title>
        <meta name="description" content="The best Manchester United fan blog — news, opinion, match reports and transfers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo" onClick={home}>
            <div className="logo-badge">
                <div className="logo-badge-devil" style={{backgroundImage:'url(data:image/png;base64,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)'}} />
                <span className="logo-badge-text">TSE</span>
              </div>
            <div>
              <div className="logo-top">The <em>Stretford</em> End</div>
              <div className="logo-sub">Man Utd Fan Blog</div>
            </div>
          </div>
          <div className="nav-links">
            {['Home', 'News', 'Transfers', 'Match Reports', 'Player Focus', 'Opinion'].map(n => (
              <button key={n} className={nav === n ? 'active' : ''}
                onClick={() => { setNav(n); if (n === 'Home') home() }}>
                {n}
              </button>
            ))}
          </div>
          <div className="live-badge"><span className="pip" />Live</div>
        </div>
      </nav>

      {/* ARTICLE VIEW */}
      {active && (
        <div className="article-wrap">
          <button className="back-btn" onClick={home}>← Back to The Stretford End</button>

          {active.image_url
            ? <img src={active.image_url} alt={active.title} className="av-img" onError={e => { e.currentTarget.className = 'av-ph'; e.currentTarget.textContent = '⚽' }} />
            : <div className="av-ph">⚽</div>
          }

          <span className="av-cat">{active.category}</span>
          <h1 className="av-title">{active.title}</h1>
          {active.excerpt && <p className="av-dek">{active.excerpt}</p>}

          <div className="av-byline">
            <strong>{active.author}</strong>
            <span className="sep">|</span>
            <span>{formatDate(active.created_at)}</span>
          </div>

          <ArticleBody text={active.body} />

          {active.tags?.length > 0 && (
            <div className="av-tags">
              {active.tags.map(t => <span key={t} className="av-tag">{t}</span>)}
            </div>
          )}
        </div>
      )}

      {/* HOME */}
      {!active && (
        <>
          {/* HERO — uses latest live news */}
          {(liveState === 'done' || fanArticles.length > 0) && heroArticle && (
            <div className="hero-wrap">
              <div className="hero-grid">
                <div className="hero-main" onClick={() => open(heroArticle)}>
                  <SafeImg src={heroArticle.image_url} alt={heroArticle.title} imgClass="hmimg" phClass="hmimg" category={heroArticle.category} />
                  <div className="hm-overlay" />
                  <div className="hm-content">
                    <span className="cat-badge">{heroArticle.category}</span>
                    <div className="hm-title">{heroArticle.title}</div>
                    <div className="hm-meta"><strong>{heroArticle.author}</strong> | {formatDate(heroArticle.created_at)}</div>
                  </div>
                </div>
                <div className="hero-right">
                  {heroRow.map(s => (
                    <div key={s.id} className="hr-card" onClick={() => open(s)}>
                      <SafeImg src={s.image_url} alt={s.title} imgClass="hr-img" phClass="hr-ph" category={s.category} />
                      <div className="hr-body">
                        <div className="hr-cat">{s.category}</div>
                        <div className="hr-title">{s.title}</div>
                        <div className="hr-meta">{s.author} | {formatDate(s.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="body-wrap">

            {/* LIVE NEWS */}
            <div className="live-head">
              <span className="live-title">Latest News</span>
              <div className="live-pill"><span className="lpip" />Live</div>
              <button className="refresh-btn" onClick={loadLiveNews} disabled={liveState === 'loading'}>
                {liveState === 'loading' ? <><span className="spin">↻</span> Fetching…</> : <>↻ Refresh</>}
              </button>
            </div>

            {liveState === 'error' && (
              <div className="err-box">⚠ Could not load live news — check back shortly.</div>
            )}

            {liveState === 'loading' && (
              <div className="grid-4">
                {[1,2,3,4].map(i => (
                  <div key={i}>
                    <div className="skel-img" />
                    <div className="skel-line sl-s" />
                    <div className="skel-line sl-w" />
                    <div className="skel-line sl-m" />
                    <div className="skel-line sl-s" />
                  </div>
                ))}
              </div>
            )}

            {liveState === 'done' && liveArticles.length > 0 && (
              <div className="grid-4">
                {liveArticles.slice(1, 5).map(s => (
                  <div key={s.id} className="g4-card" onClick={() => open(s)}>
                    <SafeImg src={s.image_url} alt={s.title} imgClass="g4-img" phClass="g4-ph" category={s.category} />
                    <div className="g4-cat">{s.category}</div>
                    <div className="g4-title">{s.title}</div>
                    <div className="reporter-label">Staff Reporter · {formatDate(s.created_at)}</div>
                  </div>
                ))}
              </div>
            )}

            {liveState === 'done' && liveArticles.length === 0 && (
              <div className="err-box" style={{background:'#f9f9f9', borderColor:'#e5e5e5', color:'#888'}}>
                No live articles yet — the next scrape runs every 2 hours. <button style={{color:'var(--red)',background:'none',border:'none',fontWeight:700,cursor:'pointer'}} onClick={loadLiveNews}>Trigger now</button>
              </div>
            )}

            {/* MORE LIVE NEWS — rows 2 and 3 */}
            {liveState === 'done' && liveArticles.length > 4 && (
              <>
                <div className="sec-head" style={{marginTop:8}}>
                  <span className="sec-title">More News</span>
                </div>
                <div className="grid-4">
                  {liveArticles.slice(4, 8).map(s => (
                    <div key={s.id} className="g4-card" onClick={() => open(s)}>
                      <SafeImg src={s.image_url} alt={s.title} imgClass="g4-img" phClass="g4-ph" category={s.category} />
                      <div className="g4-cat">{s.category}</div>
                      <div className="g4-title">{s.title}</div>
                      <div className="reporter-label">Staff Reporter · {formatDate(s.created_at)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* MORE STORIES — live compact list */}
            {liveState === 'done' && liveArticles.length > 8 && (
              <>
                <div className="sec-head">
                  <span className="sec-title">Also Today</span>
                </div>
                <div className="compact">
                  {liveArticles.slice(8, 14).map(s => (
                    <div key={s.id} className="cl-item" onClick={() => open(s)}>
                      <SafeImg src={s.image_url} alt={s.title} imgClass="cl-img" phClass="cl-ph" category={s.category} />
                      <div>
                        <div className="cl-cat">{s.category}</div>
                        <div className="cl-title">{s.title}</div>
                        <div className="cl-meta">Staff Reporter | {formatDate(s.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── FAN CONTENT (~15%) — divider to signal change of tone ── */}
            {fanArticles.length > 0 && (
              <div style={{borderTop:'3px solid var(--border)', margin:'32px 0 24px', paddingTop:24}}>
                <div className="sec-head sec-head-red">
                  <span className="sec-title">From the Terraces</span>
                  <span style={{fontSize:11,color:'var(--muted)',fontWeight:600,fontStyle:'italic'}}>Fan Opinion &amp; Analysis</span>
                </div>
                <div className="grid-4">
                  {fanSpotlight.map(s => (
                    <div key={s.id} className="g4-card" onClick={() => open(s)}>
                      <SafeImg src={s.image_url} alt={s.title} imgClass="g4-img" phClass="g4-ph" category={s.category} />
                      <div className="g4-cat">{s.category}</div>
                      <div className="g4-title">{s.title}</div>
                      <div className="g4-meta"><strong>{s.author}</strong> | {formatDate(s.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLAYER FOCUS */}
            {playerFocus.length > 0 && (
              <>
                <div className="sec-head">
                  <span className="sec-title">Player Focus</span>
                  <button className="sec-more">See more →</button>
                </div>
                <div className="grid-4">
                  {playerFocus.slice(0,4).map(s => (
                    <div key={s.id} className="g4-card" onClick={() => open(s)}>
                      <SafeImg src={s.image_url} alt={s.title} imgClass="g4-img" phClass="g4-ph" category={s.category} />
                      <div className="g4-cat">{s.category}</div>
                      <div className="g4-title">{s.title}</div>
                      <div className="g4-meta"><strong>{s.author}</strong> | {formatDate(s.created_at)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">The <em>Stretford</em> End</div>
          <div className="footer-copy">Man Utd Fan Blog · Not affiliated with MUFC · {today}</div>
          <div className="footer-links">
            <button>About</button>
            <button>Contact</button>
            <button>Privacy</button>
            <button>Terms</button>
          </div>
        </div>
      </footer>
    </>
  )
}

// Server-side: load fan articles at build/request time
export async function getServerSideProps() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, category, author, is_live, image_url, tags, created_at')
      .eq('published', true)
      .eq('is_live', false)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return { props: { initialArticles: data || [] } }
  } catch (e) {
    console.error('getServerSideProps error:', e)
    return { props: { initialArticles: [] } }
  }
}

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
.logo-badge-devil { position: absolute; inset: 0; background-size: 75%; background-repeat: no-repeat; background-position: center center; opacity: 0.35; }
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

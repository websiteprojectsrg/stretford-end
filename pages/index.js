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
.logo-badge { width: 38px; height: 38px; background: var(--red); display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 900; color: #fff; letter-spacing: -0.05em; }
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

function SafeImg({ src, alt, imgClass, phClass, phIcon = '⚽' }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div className={phClass}>{phIcon}</div>
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
  const hero = fanArticles[0]
  const heroRow = fanArticles.slice(1, 5)
  const newsGrid = fanArticles.slice(0, 4)
  const compact = fanArticles.slice(4, 10)
  const feature = fanArticles.find(a => a.category === 'Transfers') || fanArticles[2]
  const playerFocus = fanArticles.filter(a => a.category === 'Player Focus')

  const loadLiveNews = useCallback(async () => {
    setLiveState('loading')
    try {
      const res = await fetch('/api/articles?live=true&limit=6')
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
            <div className="logo-badge">TSE</div>
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
          {/* HERO */}
          {hero && (
            <div className="hero-wrap">
              <div className="hero-grid">
                <div className="hero-main" onClick={() => open(hero)}>
                  <SafeImg src={hero.image_url} alt={hero.title} imgClass="hmimg" phClass="hmimg" phIcon="⚽" />
                  <div className="hm-overlay" />
                  <div className="hm-content">
                    <span className="cat-badge">{hero.category}</span>
                    <div className="hm-title">{hero.title}</div>
                    <div className="hm-meta"><strong>{hero.author}</strong> | {formatDate(hero.created_at)}</div>
                  </div>
                </div>
                <div className="hero-right">
                  {heroRow.map(s => (
                    <div key={s.id} className="hr-card" onClick={() => open(s)}>
                      <SafeImg src={s.image_url} alt={s.title} imgClass="hr-img" phClass="hr-ph" phIcon="⚽" />
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
                {liveArticles.slice(0, 4).map(s => (
                  <div key={s.id} className="g4-card" onClick={() => open(s)}>
                    <div className="g4-ph">📰</div>
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

            {/* FAN NEWS */}
            <div className="sec-head">
              <span className="sec-title">From the Terraces</span>
              <button className="sec-more">See more →</button>
            </div>
            <div className="grid-4">
              {newsGrid.map(s => (
                <div key={s.id} className="g4-card" onClick={() => open(s)}>
                  <SafeImg src={s.image_url} alt={s.title} imgClass="g4-img" phClass="g4-ph" />
                  <div className="g4-cat">{s.category}</div>
                  <div className="g4-title">{s.title}</div>
                  <div className="g4-meta"><strong>{s.author}</strong> | {formatDate(s.created_at)}</div>
                </div>
              ))}
            </div>

            {/* TRANSFERS FEATURE */}
            {feature && (
              <>
                <div className="sec-head">
                  <span className="sec-title">Transfer News</span>
                  <button className="sec-more">See more →</button>
                </div>
                <div className="big-feature" onClick={() => open(feature)}>
                  <SafeImg src={feature.image_url} alt={feature.title} imgClass="bf-img" phClass="bf-ph" />
                  <div className="bf-body">
                    <div className="bf-cat">{feature.category}</div>
                    <div className="bf-title">{feature.title}</div>
                    <div className="bf-excerpt">{feature.excerpt}</div>
                    <div className="bf-meta"><strong>{feature.author}</strong> | {formatDate(feature.created_at)}</div>
                  </div>
                </div>
              </>
            )}

            {/* MORE STORIES */}
            <div className="sec-head">
              <span className="sec-title">More Stories</span>
              <button className="sec-more">See more →</button>
            </div>
            <div className="compact">
              {compact.map(s => (
                <div key={s.id} className="cl-item" onClick={() => open(s)}>
                  <SafeImg src={s.image_url} alt={s.title} imgClass="cl-img" phClass="cl-ph" phIcon="⚽" />
                  <div>
                    <div className="cl-cat">{s.category}</div>
                    <div className="cl-title">{s.title}</div>
                    <div className="cl-meta"><strong>{s.author}</strong> | {formatDate(s.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* PLAYER FOCUS */}
            {playerFocus.length > 0 && (
              <>
                <div className="sec-head">
                  <span className="sec-title">Player Focus</span>
                  <button className="sec-more">See more →</button>
                </div>
                <div className="grid-4">
                  {playerFocus.map(s => (
                    <div key={s.id} className="g4-card" onClick={() => open(s)}>
                      <SafeImg src={s.image_url} alt={s.title} imgClass="g4-img" phClass="g4-ph" />
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

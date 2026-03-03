import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --red:    #c8102e;
  --red2:   #a00d24;
  --navy:   #0c1220;
  --navy2:  #161f30;
  --gold:   #f5a623;
  --black:  #0a0a0a;
  --text:   #1c1c1c;
  --sub:    #4a4a4a;
  --muted:  #777;
  --border: #e2e2e2;
  --bg:     #fafafa;
  --bgoff:  #f2f2f2;
  --serif:  'Playfair Display', Georgia, serif;
  --sans:   'Inter', system-ui, sans-serif;
  --max:    1180px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; scroll-behavior: smooth; }
body { font-family: var(--sans); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
img { display: block; max-width: 100%; }
button { cursor: pointer; font-family: var(--sans); }

/* ── TICKER ─────────────────────────────────────── */
.ticker { background: var(--red); height: 32px; overflow: hidden; display: flex; align-items: center; }
.ticker-label { flex-shrink: 0; background: var(--navy); color: #fff; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; padding: 0 14px; height: 100%; display: flex; align-items: center; gap: 6px; }
.ticker-pip { width: 6px; height: 6px; border-radius: 50%; background: var(--red); animation: pip 1.6s ease infinite; }
.ticker-track { flex: 1; overflow: hidden; position: relative; }
.ticker-inner { display: flex; gap: 40px; white-space: nowrap; animation: ticker 40s linear infinite; }
.ticker-item { font-size: 11px; font-weight: 600; color: #fff; letter-spacing: .02em; flex-shrink: 0; }
.ticker-sep { color: rgba(255,255,255,.4); }
@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes pip { 0%,100%{opacity:1} 50%{opacity:.2} }

/* ── NAV ─────────────────────────────────────────── */
.nav { background: var(--navy); position: sticky; top: 0; z-index: 300; border-bottom: 1px solid rgba(255,255,255,.06); }
.nav-inner { max-width: var(--max); margin: 0 auto; display: flex; align-items: center; height: 56px; padding: 0 20px; gap: 0; }

.logo { display: flex; align-items: center; gap: 12px; cursor: pointer; flex-shrink: 0; margin-right: 32px; text-decoration: none; }
.logo-badge { width: 40px; height: 50px; background: var(--red); display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 5px; position: relative; overflow: hidden; border-radius: 2px; }
.logo-badge-devil { position: absolute; top: 2px; left: 2px; right: 2px; bottom: 16px; background-size: contain; background-repeat: no-repeat; background-position: center bottom; opacity: 1; }
.logo-badge-text { position: relative; z-index: 1; font-size: 11px; font-weight: 900; color: #fff; letter-spacing: -.02em; }
.logo-wordmark { display: flex; flex-direction: column; }
.logo-top { font-size: 14px; font-weight: 800; color: #fff; letter-spacing: .02em; line-height: 1.1; font-family: var(--serif); }
.logo-top em { color: var(--gold); font-style: normal; }
.logo-sub { font-size: 9px; font-weight: 600; color: rgba(255,255,255,.38); text-transform: uppercase; letter-spacing: .14em; margin-top: 2px; }

.nav-links { display: flex; gap: 0; flex: 1; }
.nav-links button { font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,.6); text-transform: uppercase; letter-spacing: .07em; padding: 0 13px; height: 56px; background: none; border: none; border-bottom: 3px solid transparent; transition: color .15s, border-color .15s; }
.nav-links button:hover, .nav-links button.active { color: #fff; border-bottom-color: var(--red); }

.nav-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.live-chip { display: flex; align-items: center; gap: 5px; background: var(--red); color: #fff; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; padding: 5px 10px; border-radius: 2px; }
.live-chip .dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; animation: pip 1.6s ease infinite; }

/* ── DATE BAR ────────────────────────────────────── */
.datebar { border-bottom: 1px solid var(--border); background: #fff; }
.datebar-inner { max-width: var(--max); margin: 0 auto; padding: 7px 20px; display: flex; justify-content: space-between; align-items: center; }
.datebar-date { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: .02em; }
.datebar-edition { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--red); }

/* ── HERO ────────────────────────────────────────── */
.hero-wrap { max-width: var(--max); margin: 0 auto; padding: 20px 20px 0; }

.hero-grid { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }

.hero-main { position: relative; overflow: hidden; cursor: pointer; background: #111; border-radius: 4px; }
.hero-main::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.3) 50%, transparent 100%); }
.hero-main:hover .hm-img { transform: scale(1.04); }
.hm-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; transition: transform .6s ease; display: block; }
.hm-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px 28px; z-index: 2; }
.hm-kicker { display: inline-block; background: var(--red); color: #fff; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; padding: 3px 9px; margin-bottom: 10px; border-radius: 1px; }
.hm-title { font-family: var(--serif); font-size: clamp(20px, 2.4vw, 30px); font-weight: 900; color: #fff; line-height: 1.18; margin-bottom: 10px; text-shadow: 0 2px 12px rgba(0,0,0,.4); }
.hm-excerpt { font-size: 13px; color: rgba(255,255,255,.75); line-height: 1.55; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hm-meta { font-size: 11px; color: rgba(255,255,255,.55); font-weight: 500; }
.hm-meta strong { color: rgba(255,255,255,.85); font-weight: 700; }

.hero-sidebar { display: flex; flex-direction: column; gap: 0; }
.hs-card { display: flex; gap: 12px; cursor: pointer; padding: 14px 0; border-bottom: 1px solid var(--border); transition: background .12s; }
.hs-card:first-child { border-top: 3px solid var(--red); padding-top: 16px; }
.hs-card:last-child { border-bottom: none; }
.hs-card:hover .hs-title { color: var(--red); }
.hs-img { width: 88px; min-width: 88px; height: 64px; object-fit: cover; border-radius: 2px; flex-shrink: 0; }
.hs-ph { width: 88px; min-width: 88px; height: 64px; background: var(--bgoff); display: flex; align-items: center; justify-content: center; font-size: 18px; border-radius: 2px; flex-shrink: 0; }
.hs-body { display: flex; flex-direction: column; justify-content: center; gap: 5px; }
.hs-kicker { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--red); }
.hs-title { font-size: 13.5px; font-weight: 700; line-height: 1.3; color: var(--black); transition: color .15s; }
.hs-meta { font-size: 10.5px; color: var(--muted); }

/* ── DIVIDER ─────────────────────────────────────── */
.section-wrap { max-width: var(--max); margin: 28px auto 0; padding: 0 20px; }

.sec-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.sec-head-line { flex: 1; height: 1px; background: var(--border); }
.sec-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .14em; color: var(--black); flex-shrink: 0; padding: 0 14px; position: relative; }
.sec-title::before, .sec-title::after { content: ''; position: absolute; top: 50%; width: 4px; height: 4px; border-radius: 50%; background: var(--red); transform: translateY(-50%); }
.sec-title::before { left: 0; }
.sec-title::after { right: 0; }

.sec-head-left { display: flex; align-items: baseline; gap: 12px; border-bottom: 3px solid var(--black); padding-bottom: 8px; margin-bottom: 18px; }
.sec-head-left.red { border-bottom-color: var(--red); }
.sh-label { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: .04em; color: var(--black); font-family: var(--serif); }
.sh-more { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-left: auto; background: none; border: none; transition: color .15s; }
.sh-more:hover { color: var(--red); }

/* ── LIVE SECTION ────────────────────────────────── */
.live-wrap { background: var(--navy); padding: 20px; border-radius: 4px; margin-bottom: 28px; }
.live-head { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,.1); padding-bottom: 12px; margin-bottom: 16px; }
.live-label { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: #fff; font-family: var(--serif); }
.live-badge { display: flex; align-items: center; gap: 5px; background: var(--red); color: #fff; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; padding: 3px 8px; border-radius: 1px; }
.live-badge .dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; animation: pip 1.6s ease infinite; }
.refresh-btn { margin-left: auto; display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.6); font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; padding: 5px 12px; border-radius: 2px; transition: background .15s, color .15s; }
.refresh-btn:hover:not(:disabled) { background: rgba(255,255,255,.12); color: #fff; }
.refresh-btn:disabled { opacity: .35; cursor: not-allowed; }
.spin { display: inline-block; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }

.live-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.live-card { cursor: pointer; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); transition: background .15s; }
.live-card:hover { background: rgba(255,255,255,.08); }
.live-card:hover .lc-title { color: var(--gold); }
.lc-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
.lc-ph { width: 100%; aspect-ratio: 16/9; background: rgba(255,255,255,.05); display: flex; align-items: center; justify-content: center; font-size: 28px; }
.lc-body { padding: 12px; }
.lc-kicker { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--gold); margin-bottom: 5px; }
.lc-title { font-size: 13.5px; font-weight: 700; line-height: 1.3; color: rgba(255,255,255,.9); transition: color .15s; margin-bottom: 6px; }
.lc-meta { font-size: 10px; color: rgba(255,255,255,.35); }

/* ── GRID CARDS ──────────────────────────────────── */
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; margin-bottom: 32px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-bottom: 32px; }

.g-card { cursor: pointer; }
.g-card:hover .g-title { color: var(--red); }
.g-card:hover .g-img { transform: scale(1.03); }
.g-img-wrap { overflow: hidden; border-radius: 3px; margin-bottom: 11px; aspect-ratio: 16/9; background: var(--bgoff); }
.g-img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; display: block; }
.g-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #ccc; }
.g-kicker { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--red); margin-bottom: 5px; }
.g-title { font-size: 15px; font-weight: 800; line-height: 1.28; color: var(--black); margin-bottom: 6px; font-family: var(--serif); transition: color .15s; }
.g-meta { font-size: 10.5px; color: var(--muted); }
.g-meta strong { color: var(--sub); font-weight: 600; }
.g-excerpt { font-size: 12.5px; color: var(--sub); line-height: 1.55; margin-bottom: 7px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* ── FEATURE BANNER ──────────────────────────────── */
.feature-banner { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 28px; background: var(--navy2); border-radius: 4px; overflow: hidden; cursor: pointer; }
.feature-banner:hover .fb-title { color: var(--gold); }
.feature-banner:hover .fb-img { transform: scale(1.03); }
.fb-img-wrap { overflow: hidden; }
.fb-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; min-height: 260px; }
.fb-ph { width: 100%; min-height: 260px; background: rgba(255,255,255,.05); display: flex; align-items: center; justify-content: center; font-size: 56px; }
.fb-body { padding: 32px 28px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
.fb-kicker { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .14em; color: var(--gold); }
.fb-title { font-family: var(--serif); font-size: 24px; font-weight: 900; line-height: 1.2; color: #fff; transition: color .15s; }
.fb-excerpt { font-size: 13.5px; color: rgba(255,255,255,.6); line-height: 1.6; }
.fb-meta { font-size: 11px; color: rgba(255,255,255,.35); border-top: 1px solid rgba(255,255,255,.1); padding-top: 12px; margin-top: 4px; }
.fb-meta strong { color: rgba(255,255,255,.6); }

/* ── COMPACT LIST ────────────────────────────────── */
.compact-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 28px; border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
.cl-item { display: flex; gap: 14px; padding: 16px; cursor: pointer; transition: background .12s; border-bottom: 1px solid var(--border); }
.cl-item:hover { background: #fff; }
.cl-item:hover .cl-title { color: var(--red); }
.cl-item:nth-child(odd) { border-right: 1px solid var(--border); }
.cl-item:nth-last-child(-n+2) { border-bottom: none; }
.cl-img { width: 86px; min-width: 86px; height: 60px; object-fit: cover; border-radius: 2px; flex-shrink: 0; }
.cl-ph { width: 86px; min-width: 86px; height: 60px; background: var(--bgoff); display: flex; align-items: center; justify-content: center; font-size: 18px; border-radius: 2px; flex-shrink: 0; }
.cl-body { display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.cl-kicker { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .1em; color: var(--red); }
.cl-title { font-size: 13px; font-weight: 700; line-height: 1.3; color: var(--black); transition: color .15s; }
.cl-meta { font-size: 10px; color: var(--muted); }

/* ── SKELETONS ───────────────────────────────────── */
.skel { animation: shimmer 1.4s infinite; }
.skel-img { background: linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%); background-size: 200% 100%; aspect-ratio: 16/9; border-radius: 3px; margin-bottom: 10px; }
.skel-line { height: 12px; border-radius: 3px; background: linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%); background-size: 200% 100%; margin-bottom: 8px; }
.sl-w { width: 90%; } .sl-m { width: 65%; } .sl-s { width: 40%; }
@keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }

/* ── ARTICLE VIEW ────────────────────────────────── */
.article-wrap { max-width: 800px; margin: 32px auto; padding: 0 20px 72px; animation: fadein .3s ease; }
@keyframes fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

.back-btn { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; background: none; border: none; padding: 0; margin-bottom: 24px; transition: color .15s; }
.back-btn:hover { color: var(--red); }
.back-btn::before { content: '←'; font-size: 13px; }

.av-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 4px; margin-bottom: 22px; }
.av-ph { width: 100%; aspect-ratio: 16/9; background: var(--bgoff); display: flex; align-items: center; justify-content: center; font-size: 64px; border-radius: 4px; margin-bottom: 22px; }
.av-kicker { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.av-cat { background: var(--red); color: #fff; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; padding: 4px 10px; border-radius: 1px; }

.av-title { font-family: var(--serif); font-size: clamp(26px, 4vw, 42px); font-weight: 900; line-height: 1.1; color: var(--black); margin-bottom: 14px; letter-spacing: -.02em; }
.av-dek { font-size: 17px; color: var(--sub); line-height: 1.6; font-style: italic; margin-bottom: 18px; border-left: 4px solid var(--red); padding-left: 16px; }
.av-byline { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 28px; }
.av-byline strong { color: var(--black); font-weight: 700; font-size: 13px; }
.av-byline .sep { color: var(--border); font-size: 16px; }

.av-body p { font-size: 17.5px; line-height: 1.82; color: #222; margin-bottom: 22px; font-family: Georgia, serif; }
.av-body p:first-of-type::first-letter { font-size: 4.4em; font-weight: 900; float: left; line-height: .72; color: var(--red); margin: 6px 8px 0 0; font-family: var(--serif); }
.av-body blockquote { margin: 28px 0; padding: 20px 24px; background: var(--bgoff); border-left: 4px solid var(--red); border-radius: 0 4px 4px 0; }
.av-body blockquote p { font-size: 18px; font-style: italic; font-weight: 600; color: var(--sub); line-height: 1.5; margin: 0; }
.av-body blockquote p::first-letter { all: unset; }

.av-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border); }
.av-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; border: 1px solid var(--border); color: var(--muted); padding: 5px 12px; border-radius: 20px; cursor: pointer; transition: all .15s; }
.av-tag:hover { border-color: var(--red); color: var(--red); }

/* ── FOOTER ──────────────────────────────────────── */
.footer { background: var(--navy); border-top: 3px solid var(--red); margin-top: 56px; }
.footer-top { max-width: var(--max); margin: 0 auto; padding: 32px 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; border-bottom: 1px solid rgba(255,255,255,.08); }
.footer-brand .fb-name { font-family: var(--serif); font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 8px; }
.footer-brand .fb-name em { color: var(--gold); font-style: normal; }
.footer-brand p { font-size: 12px; color: rgba(255,255,255,.4); line-height: 1.6; }
.footer-col h4 { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,255,255,.4); margin-bottom: 12px; }
.footer-col a { display: block; font-size: 12.5px; color: rgba(255,255,255,.6); text-decoration: none; margin-bottom: 8px; transition: color .15s; cursor: pointer; }
.footer-col a:hover { color: #fff; }
.footer-bottom { max-width: var(--max); margin: 0 auto; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
.footer-copy { font-size: 10.5px; color: rgba(255,255,255,.25); }

/* ── RESPONSIVE ──────────────────────────────────── */
@media (max-width: 960px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-sidebar { display: none; }
  .grid-4 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr 1fr; }
  .live-grid { grid-template-columns: 1fr 1fr; }
  .feature-banner { grid-template-columns: 1fr; }
  .fb-img { min-height: 220px; }
  .footer-top { grid-template-columns: 1fr; gap: 24px; }
  .nav-links { display: none; }
}
@media (max-width: 600px) {
  .grid-4, .grid-3, .live-grid { grid-template-columns: 1fr; }
  .compact-list { grid-template-columns: 1fr; }
  .cl-item:nth-child(odd) { border-right: none; }
  .hm-title { font-size: 18px; }
}
`

function SafeImg({ src, alt, className, ph = '⚽' }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div className={className + '-ph'}>{ph}</div>
  return <img src={src} alt={alt || ''} className={className} onError={() => setErr(true)} />
}

function ArticleBody({ text }) {
  if (!text) return null
  return (
    <div className="av-body">
      {text.split('\n\n').map((para, i) => {
        const t = para.trim()
        if (!t) return null
        if (t.startsWith('QUOTE:')) return <blockquote key={i}><p>{t.replace('QUOTE:', '').trim()}</p></blockquote>
        return <p key={i}>{t}</p>
      })}
    </div>
  )
}

function fmt(d) {
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

const TICKER_ITEMS = [
  'United 2–1 Crystal Palace · Sesko nets winner in comeback',
  'Carrick era: 6 wins in 7 · United climb to 3rd place',
  'Newcastle away Wednesday 20:15 · Crucial top-four clash',
  'Mason Mount on the grass · Return date TBC',
  'De Ligt back issue · "Going in right direction" — Carrick',
  'Sesko: 7 goals in 2026 · 4 in last 5 games',
  'Aston Villa at Old Trafford · March 15 · Third vs Third',
]

export default function Home({ initialArticles }) {
  const [active, setActive] = useState(null)
  const [navTab, setNavTab] = useState('Home')
  const [articles] = useState(initialArticles || [])
  const [liveArticles, setLiveArticles] = useState([])
  const [liveState, setLiveState] = useState('idle')

  const fan = articles.filter(a => !a.is_live)
  const hero = fan[0]
  const sideCards = fan.slice(1, 5)
  const gridTop = fan.slice(0, 4)
  const featureArticle = fan.find(a => a.category === 'Opinion') || fan[2]
  const compactItems = fan.slice(4, 10)
  const playerCards = fan.filter(a => a.category === 'Player Focus')

  const loadLive = useCallback(async () => {
    setLiveState('loading')
    try {
      const r = await fetch('/api/articles?live=true&limit=6')
      const d = await r.json()
      setLiveArticles(d.articles || [])
      setLiveState('done')
    } catch { setLiveState('error') }
  }, [])

  useEffect(() => { loadLive() }, [loadLive])

  const open = a => { setActive(a); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const goHome = () => { setActive(null); setNavTab('Home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const devilB64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAAB9CAYAAABUO8YHAAApXElEQVR42u19aZRc1XXut/c5t6YeJSGZ0XbwFMQoWoAEiOrWBMLCQOzqtRwnD9vBOLaXjcfYeR5KldiOEzuJM7zYkMFOHOe9dMVJBEggC6lVSNgIaMvC0BCwGWxsjKaeqrqmc/Z+P26V1KO6W1KDBDprXbSoul1163xn77P3t4cDnBwnx8nxChhpgI/wT+nk7M3eODm5x4V0pNPctXLta2cMnir91TUfjuoJBCQf10AgzQrQFevvf8P8vQP3dCdTjQrQVBPclUoZAHrvoo73/uavdn2NANXwtZOAHM1Yl+olApR86f2vJ3NOuf9XNxOg25LJSSdXAUplF+rGaz4cta6aiXt/8+YVN8xDNisngqTw8SsdYGSzcveyG0+LqrxvX6Xk4yKf6Vq9eu62XG7Syd2WTBpCRiK/3PWJRugZDcwx2n/g3VMBeRKQKUZ7MskEqB3Y99EW4uYCxLXCvKb1xfxHM4AgleKJVNy2XE7uXfLWMyLqP1MSL1XxML76wW/ddFOsPZfzx7thcFwCogC153L+u8m1p0TF31zwTgkI8r4qccHHNiZvPBPZrIw1hdeleikDiBQHvtwCbhJVKYv4FvDZZz3y7A0EaPc0pCSNNE/nGaejAmdqrtvjYfLXjflhPW1tZnFPT3XzwMAHmpnmDnjxRGScqmsBNZb6932SgI8+3NZm0dMDADi9rc0gm3Vb21ZdFi/nf2fQiweRJaj3Kopq5aOq+u/o7NRxQAJKgNb/P4OMKEAjX5vA/tbp/DYC5BVh13clU40LDjz/TMTrvCoUFK5INYCqMaX83Pnnrsmtf3bs33Wff8WOZpUr8uI9gQwAqKrEreU9sWhy7UPd9001if/vkhVveudDW56c7H0A2HDlW1ulmDfX9eT2TwIQAdB/WbbqN362/fLnMsjI8QQIdaVS3JnN+rFv3LN42VkNGqUBKVAcQJnJRkUdhN87R/QLeec8iMyhCVHfbAKzn+i7pYbmz0YNmTJKgI96O1xYPU+qtxe8EwbxyL9p4oD7ie4uJxo+ZAPLrurEs9FTmXVPyQU7e+55JgPoXRcmL2wlv6naYi5sz+VeXAdQZsQq11TKUDbrN19wxT+RasvKn/zg7V2plBn52+qg3dm2Nt5a7e8tkHn3mt25bWPvm7U9JA2wIs2H0Zc69kFqvgLE23dEK8PPNpb946YsTyWK4b9R57+Q96IjwQhXEJkh7zXm3bsaBg88Fek78HhjX+GJhsG+pxpc5fai9zoSjIN/I46i4q6N5wefDPr3Px4vDP5P02Df49Wh/udIKqvWhStcY1L50qnKC9wBlyZA16VSdGii04xsVrqXrH5jXPRdDaq/dfeS5Rd3ZrO+a4SfE1p60Kjr+/TpxK+L+moGqtNa/HwswMgAQshIBhAFeOTDpQG+7ZZbgjsXr3xbdzJ9cM/qDP0Czr/xlL/OEz3UwjZOgLVAYIFAVDVU7RPiS15VA9XAqESsahCoBKoyqdQTAKeqViWwohH23rYwx4eA/7Nm19ZvEqDdly6/oRV87QuVUrVB9X2bLl91EWWz0oXw92RrfpHLF/4kRhoxAKKF4tfGqDRuz+X8HW0rX9vg/Sd+XS25FsJV329LpjqzWT+Vg8pHuyFnALlzyfIzdl2YvOjO5W89gwDpzGa9AtSdTMYygJzd03vzWd6tL1R+csYIK0aBNDqzWV+KNb1nGCgGgBdAfLhaaZLv1NoEkwd05DXZvSNAIQ+oqPo4G+oHfvz3n/vIrQpwOpm2Wix9WURUQRojGDM0/BUAilSoqjqzWb+5bUV7M/QdRSe+5L1vBnfcfdGy6zuzWd+dTNpsKkUEaKJa/HIDmQavJFURjVSqX9m06ncakM3q4ayzIwakLgWbLlvddspw5SclV97VuvfAE9svuHLD1kvaVxCgHblcaf2S5BvjJZ/xriyR0oE3AsC5qV4KJygj3cmkvfbBe3qHOfijBhNYVRU6zAMHIFIcFAUaeY1GQ30AIhovKQSAPBMVE7GPZTs7PQFy2cCWW+aAzimKFxAiBed9C3D1pguXrT6oblXJlIf/3NSQVgKJqEa9/+rDt9wStOdy0pnN+k1t7Zc1qr4r750nQqQs4ueQ+Q3e+9zHaRIf6qgBSWUXKhGpKRX+PC4ypyLiyEtjQuTahlLl3m3nLd2++YKlf9mSL99roPMJzOxkCQDM37Pn4Dx15HK+K5UyfW9Z8NX9JD9KGGOh8JPZIFVQf5wN62HMTlWVhLGmTBgSUJVGvQffaCzniTas2bllmwJ0VzJ5asJJuiReqIahkgIiGhH31TvWrk1QNuu3XLzs3a3EFxfEeRAMgbgoTuaA3tT3QO8HCJDb2toCW6n8qVVAtPaIRKbgqxKruo93X5o8k7JZP9l+y0cqHYSMbLr4issavCYHvfNEZD2geXG+5J02AFfOV/5oVPG6smgVqjDkLwWAvbkFOkqzZIHObNYPR4Pfq4Kq5qDGOaR6LBGE0L9v/qnnDxnz500tCQqv48HwTcbykOE7DzREFwr0wTgbhFoNIChVSOGD4E/qvkZkSG85hc2CsogcmhMyw+JlLtkLYi8MvRVEII91PgRtxBohKnsvRn0a6TSfxU1XzSFOFsI5MXWprKpKq+FWX3IfqTMRxwyQ1MKFCgDWyWcjOLT1hqqDDIGoKN4PuqqrqgoTTFkF5LXtW8mbYp3IjqIwOhHq37UP5X48yPynDdYare3QY+zzSmNfQ9+K3Ts+2cf8d03WGlL1I6D1jcaafsP3dtyw4oa3P5h7XolGAisxNjwseOQHa5M/PPixQdP/7RPfH2Gqa6P6vaZf/c89YjugCs/mHyxbVtVRKyBuDAvj28hkRKLuR4MivQ3GGK2ZywqoITKDKhWNxLIA0J7LyTEBRJFmZDK6afGq8+Ie1xbEad0BG6NeDIhs7Tu4KipRwhmnFX5+cU3KRn13ey7nu5Ay0Tlv+FI/9KcxZtYR9r9XhRK1IvbiAgV4/1tO/eSQ6nMBs0Fo3SkRuKhaOJBovhmZjHSlPhYnwllOBQpiQCXCDIkEGzOZjGxLJrkrlTKrd254qhCYz0fZEtUWAqsqCH44Yj6ypmfTC11Imb43fejLfZCH4hxOtgISZWv6oL3DZ837fBrgtTt29BWj8Q95ogofdINU4sZQgcyXVj285SFNpcxkHjxPZMZ2J5N2MkugbvpZV/xMnGAm1/fjoJQ4MYKqWz12Hzno6aaAjtw/l8rWftyQIdJDFpWq+gQ44r2eAUBT2WypYnRjnA2gKoBKAxuqMN//jh9ufK4LKdO459l5BnxatbakScFlCMTJvQCwd8ECrZnf9Byfc9ugdy8EbAygLsJsiszPrPnRjvUKUF/b09yZ7fQVyNctM6CqpCpxQ/AcfPttd901fHpbm1GA1/Rs2ZZX/1CcDUPVG2Iz5H3RceM3FCBkszLtTT0DSEcu5+pBna5UytTB6UqlTCqb1bsvu/r1Ueffnvd+nOM2KRxEXFEPcu5GVaUa8zpq1B2sq3fdd+cA0Y5EKPYeAIQAC0WiWv4I1bgnhjnT60HMyKnCgF8DVepE1scG9nykgRCpqz9DxEWvBU5EHg0Nk6wcoj16QNDyyFXCRC4twgTomxsbFQAFoKqOsCek9l8FqHYPFCCjKNIIdUtKUiwV7FQcGI8MkwLAhkXJxTuXrHhXVzLVSNms78xmPQGqAKeyWSFAbDn/hQZQTEP9PS0PlAAuiUiccN7Gi9vbaITpPGp/qv1bTST+SIlQ93AJZPLiNOZdaut5S7u3nr90U8z56woSLgoCuKiiEXUXdp+/dMfW8y+/O1aVTw37g++rJYIS/XJ7bNn+6VBJAqXM6AnUqhOeimysz9fYe6LMUxKSBz3nc3tD38CSNMdL1X89Pf/8z3MXLruLY5HsT3/zzAfon/+59K2bboptfeS5TySqlffkvfO1PWIGG5BKjMhGvfsggPdO+MNCp5Lpwc2bt5y3dEeLMVcOi/eoGQtlFW0m004K5NVjpP9BAFVEtJH5clYgr6L19xUAgwDiQiaXcSPY3BHUyHSoDVLM4uCR6kKR5qt/tH3ri97d2UL82gbxHwwKw92/0fPk47kLlnW/7uEnH2+uVr5YEa86TVU1Rm2ZYe81Ir7ze8uuPi01QUwjFJMUQRU+lviiMEN19KQPi/MFcZ4mXqlUFKm/P+4WopeJ4SYFMDwzLitb86AlFv1aHqrDzlXK4jUueH2DuPYG4PXD3h1x1I0AclBpJm5oHRj6AwJ0Inu87jjdf+0Vm4dUdyXYMDDSeCADHHZBTPi+zvx5ka4FopryeVKAZBJ+rX4Pphm4mhYgnbWJuPrhbfcVlR6KGxMhQEoQGRbxJRXBEUjGGOaVh7yXuOoHv79o5TkduZyrk3djQ7iZTEaqzH9jmDHK9j+qIZNO1wQ0i2aYhQBt6+nxBChZ9eOljg7ew4CvqcIjemA74UTkcuKs/r0Vc6l6D6IQOJqU7FOpmahcXx0EiIY8xFgJIIFKXCli3fA/pNPpZfO3bSPNjY7Q1a0wiTZ+byA/8Kcx5vkVVaWjjeEQ0WRTNd7rJ5N+3xcSr/+fZyWLYfstJBwO/LQBOKRDKZz62LeSN8WyGLbr80XZ3zhPdO8TwZE86ThAttU8yKFIcE80Xx42xAmBjmNftebwGCITZ2uYCBUoJLSMEAEZUcGweCUQjY1PFLzzc629/Kr/3vIXHbt3fLQ7mbTpXE7qwaC62U3Z7OCWC65YH1fcXHXVsYaEhD4IjVrlQjAT7h/hg5dBwLpwTieBhriiCjh3dvL+7z/JClUCnQIoQZuKqqhrirz3YO8//bp9T/5+GNVUbS7uByktGBaPme61E/ohCtDbH8w97w3/NBLOpYwGQz0D1GIjRtkU8obu6jPm1nw8uqIyr+WK4dbGK/ZZ+t1hpgfiZEgm+OFEZPLOuxbRWzdfmMx05HIuA0h3MnlwwreFziNpJHqHr2/JI1ZzlAw32sA2WnvwarDWWqJxphCpiiGGgp+BTs4ljfx8hpoE9IwY6Zlx6BkJ6JkRRYuMXhEIoE0J1O/BmTHSM5k0osdCZQFAFikGsh7ET1iSC1T0EJGtcI3G2CJoeIDp60NNc/5x7Y4NT0/wMT9Ip9Jdy5+4d1dc9JxSSKuPmgQh2KJzfn5AX+i+6Mo3HGhq+FRHbtML9Xh0TW1piWIPDUlxKCA0OUCpxuYOEbq81zuYHIuyECspkVjQZxJE55dURn0nE0HBu2YQ70FlDKemE1D9DlA/fpNjHCtA5if3EHKAV32CQztRFVBWSJO1doiQy0cbP7TmoU2P1aNk25JJ3rsgZHFTCxfqt7+9LfKebKbUft7lP46wWVgO1Q2PN4VhBqsV32zsu4L+oWs2LVr27WcvOecPb7n9dlefgL+eJ33nF/ygIW6q/XA14U4lq3rv/+5YvdR97tI/k5G2cvi6KaiXaiy+oQsps3fBBFI7DS0ymak9peWp07NND+/YmeBp9VUoSBlAwhpzgOlry9/8kc8g2+m7k0m7LZcTAgQj2EsFqAGpalfqY3F6fOdVJfGYCIwR+svkxZXnmWBe2fk3vP/2292cVIrPfvppXtzTU11/wC1KmOCMiqsKiBhENOw9mM319y556xkmmn8xWi4H5Wi06gbp7S2uckbeez/aIiSQqoiUF3Yi+6hmwbXws44Ol4QW0mTxFpoikjmhOzwDq3vCSarHK5yXp4sqaqFs2eh+G3xg+e4dn9JspyrSXNf7Y0W6p63NdiLrW596+EsthDMrIn4qESYgGIL6SnPT5wAoHoNZ3NNTvW3lypbW4vDXWUVlxN4tqq6VKM6VoXd05HKueXDQd+Ryjpz73YksZAUgqmZu1f371kXtXyYiqe1ZZsTUWRsibiyIxl3jA5BjHZ9xFwNsQhvFHjEgjyGrAGASkV97KBljqZ9tavWu3Ddva2sLQnJvfJ5RnZta3NNTvXfx8o/O8f5j+RGBmsNE+HwjWx42dOea+zc91rVwYaSzN1v5j8tWvmnh3vKOhOplY7NJlIgrIkCl+oHbbrklyPb2ug2XrHlzDLJq2HtVGpt5AvIAVZyXud794f3nX7XpO8uuPq0jl3OKlAHa4MkMVVUKDhhyisLoSwtVQUEnNprFMxec4YI3puCZC652ieG8M1wQGwz6mXBZE41KxVfiRPkB8HvWPHLffz7c1hYs7umpTuapUjbrb7nllqD7wf/546Zy+dNF50WIeArVqYaIhoFqkcz/TgPc2dtb+Y+LVr7ptMLwljhw1pD344AlgIvifauNvOXsnY93vh/47pZi/tZGoggg1BHG82wU7lk8WK24JmNXn91ffeDuthU3UU92m65Na3Z9bzJRKRsgMU4xRfwgD1GjzkX1e01MS4clZC1jRDxM9EzpjLOXxUxFi95RzFgdJZkAvDH6o4vfsheP7sQUGZGHCdUuWRL3Gn3NO3fmnu1CytQifROmAq0DdMMlHctay+5rCZVL8q4qOjUYgKprNoHda/CdVbvv/18K8KYlq1vjhcKDDapvKHjnaBISUwFpIENDhF0DTc03zxsc+AGpRP1hdP3BJa3q48TGG9Y8m4+v3r3969NRKVvPvXRzC9mVBXE1QJgLrE8s/8kD5xxTcnGi0fnAA8V37sw9q0jzZGAAwLrQr9CGSuX2s4guGXJODpNUNWojNEQ8BC26WOMX6rmwpjT8jTnAG/LeV+kwjDIBPKyeWOTilvzAFlaNTQeMmglsShDxzvlTVf/y3guv/LIC9HBbW1BPpK4nAGoqZR5duDDSnUxa0vHqlxSUTofFRekaWzHRddSA1Fc/TZGXuq7GM5Rs8Onnlf4LzIONxhpAZSo6vtFYLgf8V2t2bnqWAN142corWzw6B1zVMyGYHj+miHiZ4zAzaoUUUvf8GdxPgLadfbYAYfbhulqqEmWz/rze3kpHLueU1E30WZl165QAzdSCZxNdR+yHjPXcp3vPmp5t6wGs/96l15ypxfy6Rra/VxAnhAlNXokScx/8L/LxBV/uRtJ2IOfixfI7IxAtzZCcc+GPnhYYAigDaLKBLQIDLxB9+urd993WhZTZtmcPdQCKXM4BwI63vbcJ+5453eVLiZJnYfVzasTdrND4x7QcoQspkwJAD2afB3Bz9wVXnN0I21EU70PLcEywygZ2gOlvbvjBHUPa1hagB1BxFzuAMMO4xXTBUKjGiMkR6ZDhf+qLxL54/YObnwkNlmwVOeCuK986p6kw2MlOfkuefvwChS4IFGzgQVAURUGgUUkYXZ2d3Inp5he8RIDU95muhQsjqd7e6t0B/3NLVTvgnY7hF0FEZki9tw3NdyhA6OnxYSoEWoQAxWGM/qPg3iPEVCX6xVA08tvX9uR21N9Y3NNT3Zi85szGgeH3c3/fexqJzvCqKKvC6aFMDp0QYqJ6+uzRPvPsVFCde64nQI0P9hxKQhhtHQXE5ESe5VVLfkaArju42eogHVE4aZohZDY0EIl9ciQYd19x3bn3LUp+vWn/4O5m7z/HKmcMuKoviPO1jJXJvHYuq0oD8W9sWtT+fgK0Cyk+/gCpf3hA/VUodBwfpLVMRH6+I5NxCnA97V8M/8IwKenMKo+mq9m8KuK+2rHhkhVv3ryo/e3bLrqyq3Fg/65mV72Vxc+tJfdp6PeQmYqnUoCceNvoKn+3cfFVizoxujThuAAklQ0zG71zeyviPY/VPhpuqmAdqsfQa1Q7lMw2Bs1OJgGRGRaPBu9/v3G48Firq/5Hs5MUxAWDzjkXako7I0sNIAeRqIAj5eo30uk0p7JZPc4kJKMAUK6aIRYqMmg0+UYgCenP1pDvz9apdlSaGrr6RfoiIfUxG1KCioiwqi26qh/yzgvoIBAaBr3c2EsP612TGRbn5hFftvSOrSkaE9c5blSWiXsSnqx2kkByyE8hQLtSKXPtjnv2VoLolxI24LH5vcdSm0ooDYbCnC1SQFVVE8TcbAPbbAPbaAPbZAPbZK0NatmThxEVcqIaOPlkOh2WZx9/gMw9k8CGDkNfjNK1YVpnyqza1f0X+6Bbmoy1CvWzor3G5GMFRBSxlgqEHx0A/e0Bok/sY7plH9Gt+4FveWP2NxlrVCcN+5qiOE1AF19+T+6SDCBHspfMaln0UHPLUOx5GWKiBOmhuLyCyKuCCfNq9q3UuT+kw7qT9cuue1904MAjgXCiimOQ3HA4+gaAMB9w0dh72nu678QE/P3dy64+TQaH/zwGfWdJ/MTOrkLiIB4uVt8GYOfY/OWXHZAXTjXVUx5HddI1pcQ1B/BQGmYmrKrqyN35zOYLr/rEPKO3uTGVuMdYUiRKbAZEn1n58NY7uwGLZHLcfbXQ8m9vO2/pOQkyFxV1AlAI5FRAysuAyUsOXjaVhTe+EcTkJzCZwk2dqKUrmUqM9To6cjmnqZRZtfu+2/ugP0wYY3AMvODJNGtRvTQStd3dtjzVAbj5e/dyey7nO3I5V7+6AasAieheUwtrT2QCCwD2vmlSP/LlAKQWg6dbb721TFXfZ3h8VMergkhbGjHUWiMoR4l33QwuG/MXYWnH7KXUKohEBC2Vyj9uvGTlivN6eyu1Nhy2C2H2f3uYgA+aIvJXc4OPTebi7Ngzk/OcJLCm6CdkdNtz7QKAWOnnFRHMDpNyaIOvQAHvmlqKhXu625Kf60qmGjtyOdeJ7MFMRK1Ty4fBIwCJMO8H6tk7xxkgYniinhMkgDKTKUq5FQDORWq0hCS3sQIwREsOFeXM4roJQVERsS0V98evOfD87u5Fy760ta39io1XXjO/M5XiqVJESQFmZmeDb4b+7nEkIWGWDoGYeWJaSTVKRM2e54be+lgJyQkBSq7ydtHZlZCRoAigQ67qo6Jnz3Hyv2Plyo6GA/1PfvDxX/6ke+GSHxBwWVE8MHZDV/VxY80+pm+t/nEum0aaaYo2Gi8pIGmkCapQ7wbD3C4dW8QvFgSFng6MLnHrqtXgbVqy6ooG4mUF72UcfT+L6ouITEVVBl3VVcWpBVobVM9pYlpqFY0yYs2N3DcNMSpMdwJAe3IbH+GimJ1xLsLSBogOESbekwmA1+pZ497IZgEAwXAxHVWQkipe+sEhnULkoFpUkWHx3k+ishSAgSKi2n6csr3hpGotc34iu4MAGKfzR77WlUqZFCB3ty2/OC6yMh9GHGdPOlRdrYZdDys1oUYzdHjmF7bsguMUkIO+0mQrquat0xsAYG8uN6pGLyiXPhsFEWaHhj84+002sA1sw4lWdUdHaBI0ao9Kmme9oxwFEUG1Mv51IngVqNLrNQyHS63KVzYuXrEoUSreUBAnM65jnD5domDiA0R/SsD5EebVTWRsSTzK4qVW+8YzFTcv+PlxLiFaoQlC5ApwRVUt9E3rL199WhYpxmOPGQI0Uil9JQawzJI3SKq+wVguRqJ/sOKRHZ9Z/pP73zrY2nLhgKXPV4mebLABNxCzqopi2uY2laFUhdkJhDXwxxUg85PJMAJYqvRRWMQzrlWSKKSBTaxxuPyJTmR9Z29vZfOi5IebRVfnvZ+VvaPWC8UegP7Xqh/lvvrowoWRLsBcu+Oe3uSu7V988JwzLhq0wTuGrdkRtwEn2LCq+sM2u6m17ChAH4vd0L5DAeo8ApP3JVFZMIfxHwim4J0mlD++9uplZylRY2O1uqYsXpXAdMxVlWqEmPKsfcU5kQ+mAc72plwGGUkjze3JbdyRzRYBfA+g729uS14fL1c+0xQES4reoaoqPAHLS6piDdtyhD+7JpNxXamUwRECMvvUydSQU1VEW5VScwRrSuL0WGRvTIKIxI3hPPHn1+Zyv25PJrmenDKDjISJ16Cwe4XSqp5t66/8yf2XDxj+gJIZaGDDY1WYqvpmG9gDoK41PdvXT6ev4ssKiE7jKwigvDiX787TrGEBiTFzP/CzoTev/Pt6K76DBGIqZdJIM9X6Q9YjmEqEjl3bv/nraOOSIvGuxGhQJMLMgyrPlFpafl8Beuwo4ukvCSA8CXUyASx2tmIe9aUcYUsuEv1KZzZT6WlrM7WudyGBmM36sa1c68Dc1tYWvKPn+0/8jE9ZXgT9NBrmkEs9rch5/8O1Ozb0IZXizFHmAcz6HiLiD9DL3B44bKPEpl/ll/lo4793LVwYWdzTU7ntltuC33zw3z5hvb9cmfYORRJ/seahTY/VG3vW//79PT1VBSztXt/fvfDSn0XYvrEiTupBESYExyq1dNYlpOwkj5d5kKrE2UKs+dsbfnDHUGdvb+WOK9a+9jd3fmfDKSJ/Eqi/bp7ivdFS/r/TybRdN3FFYO0AABpXXaszSKZ+2SUkEBzAy3wmgYY1jDDgd265YOlrWPk0M7D/mgSoZZ93LsxKqjKYh9EOQW6UMz+KQOwmzCqvNuuAhG1KXmYJAcipIi56QZT5AlGgKIICVIjIQtVF2FpR3ZHJZKQ9mbT17PfJKJcTFhCILynb4wEUlFWk7LzUpWZkkkIYnuQHpvM5JzQgaiNMIjhOBtfLs8fWsA+rQBPx3SHRuUBfvgecpdFe43LUUp9/aRbXERONFkwO2F8K4r8AgBSy8ooD5NAeEt1XCzYcr0djhK3/vL64dseGvu5k0t7e1ma7k0mbfhkOvJk1lbWu5rGK2mfLYQa8kRmUnb2U24uHwjDN+asPfzja8Td/Ux555lif5IQFpN6yojpPn7NFPB8Hva6sOs2OHzNXO3QUXe4qqhoQnXZ+94Pbt16wbEcQiVRQ9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKQ9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKQ9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKQ9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKx9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKx9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKx9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKx9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKQ9b94PqYbwirmla8RZaaI6kmlnJN7ZcpNGe5lOuoUq+jXt6t2JJKQ=='
  const devilUrl = `data:image/png;base64,${devilB64}`

  return (
    <>
      <Head>
        <title>The Stretford End — Manchester United Fan Blog</title>
        <meta name="description" content="The best Manchester United fan blog. News, opinion, match reports and transfers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-label"><span className="ticker-pip" /> Breaking</div>
        <div className="ticker-track">
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-item">{item} <span className="ticker-sep">·</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo" onClick={goHome}>
            <div className="logo-badge">
              <div className="logo-badge-devil" style={{ backgroundImage: `url(${devilUrl})` }} />
              <span className="logo-badge-text">TSE</span>
            </div>
            <div className="logo-wordmark">
              <div className="logo-top">The <em>Stretford</em> End</div>
              <div className="logo-sub">Man Utd Fan Blog</div>
            </div>
          </div>
          <div className="nav-links">
            {['Home','News','Match Reports','Transfers','Player Focus','Opinion'].map(n => (
              <button key={n} className={navTab === n ? 'active' : ''}
                onClick={() => { setNavTab(n); if (n === 'Home') goHome() }}>{n}</button>
            ))}
          </div>
          <div className="nav-right">
            <div className="live-chip"><span className="dot" /> Live</div>
          </div>
        </div>
      </nav>

      {/* DATE BAR */}
      <div className="datebar">
        <div className="datebar-inner">
          <span className="datebar-date">{today}</span>
          <span className="datebar-edition">The Stretford End · Fan Edition</span>
        </div>
      </div>

      {/* ARTICLE VIEW */}
      {active && (
        <div className="article-wrap">
          <button className="back-btn" onClick={goHome}>Back to The Stretford End</button>
          {active.image_url
            ? <img src={active.image_url} alt={active.title} className="av-img"
                onError={e => { e.currentTarget.style.display='none' }} />
            : <div className="av-ph">⚽</div>}
          <div className="av-kicker">
            <span className="av-cat">{active.category}</span>
          </div>
          <h1 className="av-title">{active.title}</h1>
          {active.excerpt && <p className="av-dek">{active.excerpt}</p>}
          <div className="av-byline">
            <strong>{active.author}</strong>
            <span className="sep">|</span>
            <span>{fmt(active.created_at)}</span>
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
      {!active && (<>

        {/* HERO */}
        {hero && (
          <div className="hero-wrap">
            <div className="hero-grid">
              <div className="hero-main" onClick={() => open(hero)}>
                {hero.image_url
                  ? <img src={hero.image_url} alt={hero.title} className="hm-img"
                      onError={e => e.currentTarget.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80'} />
                  : <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80" alt="" className="hm-img" />}
                <div className="hm-content">
                  <span className="hm-kicker">{hero.category}</span>
                  <div className="hm-title">{hero.title}</div>
                  <div className="hm-excerpt">{hero.excerpt}</div>
                  <div className="hm-meta"><strong>{hero.author}</strong> · {fmt(hero.created_at)}</div>
                </div>
              </div>
              <div className="hero-sidebar">
                {sideCards.map(s => (
                  <div key={s.id} className="hs-card" onClick={() => open(s)}>
                    {s.image_url
                      ? <img src={s.image_url} alt={s.title} className="hs-img" onError={e => e.currentTarget.style.display='none'} />
                      : <div className="hs-ph">⚽</div>}
                    <div className="hs-body">
                      <div className="hs-kicker">{s.category}</div>
                      <div className="hs-title">{s.title}</div>
                      <div className="hs-meta">{s.author} · {fmt(s.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="section-wrap">
          <div className="live-wrap">
            <div className="live-head">
              <span className="live-label">Latest News</span>
              <div className="live-badge"><span className="dot" /> Live</div>
              <button className="refresh-btn" onClick={loadLive} disabled={liveState === 'loading'}>
                {liveState === 'loading' ? <><span className="spin">↻</span> Loading…</> : <>↻ Refresh</>}
              </button>
            </div>
            {liveState === 'loading' && (
              <div className="live-grid">
                {[1,2,3].map(i => (
                  <div key={i} style={{background:'rgba(255,255,255,.04)',borderRadius:3,overflow:'hidden'}}>
                    <div className="skel-img" style={{borderRadius:0}} />
                    <div style={{padding:12}}>
                      <div className="skel-line sl-s" style={{marginBottom:8}} />
                      <div className="skel-line sl-w" style={{marginBottom:6}} />
                      <div className="skel-line sl-m" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {liveState === 'done' && liveArticles.length > 0 && (
              <div className="live-grid">
                {liveArticles.slice(0,3).map(s => (
                  <div key={s.id} className="live-card" onClick={() => open(s)}>
                    {s.image_url
                      ? <img src={s.image_url} alt={s.title} className="lc-img" onError={e => e.currentTarget.style.display='none'} />
                      : <div className="lc-ph">📰</div>}
                    <div className="lc-body">
                      <div className="lc-kicker">{s.category}</div>
                      <div className="lc-title">{s.title}</div>
                      <div className="lc-meta">{fmt(s.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {liveState === 'done' && liveArticles.length === 0 && (
              <p style={{color:'rgba(255,255,255,.35)',fontSize:13,textAlign:'center',padding:'12px 0'}}>
                No live articles yet — scraper runs every 2 hours.{' '}
                <button onClick={loadLive} style={{color:'var(--gold)',background:'none',border:'none',fontWeight:700,cursor:'pointer',fontSize:13}}>Trigger now</button>
              </p>
            )}
          </div>

          {/* FROM THE TERRACES */}
          <div className="sec-head-left">
            <span className="sh-label">From the Terraces</span>
            <button className="sh-more">See all →</button>
          </div>
          <div className="grid-4" style={{marginBottom:32}}>
            {gridTop.map(s => (
              <div key={s.id} className="g-card" onClick={() => open(s)}>
                <div className="g-img-wrap">
                  {s.image_url
                    ? <img src={s.image_url} alt={s.title} className="g-img" onError={e => e.currentTarget.style.display='none'} />
                    : <div className="g-ph">⚽</div>}
                </div>
                <div className="g-kicker">{s.category}</div>
                <div className="g-title">{s.title}</div>
                <div className="g-excerpt">{s.excerpt}</div>
                <div className="g-meta"><strong>{s.author}</strong> · {fmt(s.created_at)}</div>
              </div>
            ))}
          </div>

          {/* FEATURE */}
          {featureArticle && (
            <>
              <div className="sec-head-left red" style={{marginTop:8}}>
                <span className="sh-label">Featured</span>
              </div>
              <div className="feature-banner" onClick={() => open(featureArticle)}>
                <div className="fb-img-wrap">
                  {featureArticle.image_url
                    ? <img src={featureArticle.image_url} alt={featureArticle.title} className="fb-img"
                        onError={e => e.currentTarget.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=700&q=80'} />
                    : <div className="fb-ph">⚽</div>}
                </div>
                <div className="fb-body">
                  <div className="fb-kicker">{featureArticle.category}</div>
                  <div className="fb-title">{featureArticle.title}</div>
                  <div className="fb-excerpt">{featureArticle.excerpt}</div>
                  <div className="fb-meta"><strong>{featureArticle.author}</strong> · {fmt(featureArticle.created_at)}</div>
                </div>
              </div>
            </>
          )}

          {/* MORE STORIES */}
          <div className="sec-head-left">
            <span className="sh-label">More Stories</span>
            <button className="sh-more">See all →</button>
          </div>
          <div className="compact-list">
            {compactItems.map(s => (
              <div key={s.id} className="cl-item" onClick={() => open(s)}>
                {s.image_url
                  ? <img src={s.image_url} alt={s.title} className="cl-img" onError={e => e.currentTarget.style.display='none'} />
                  : <div className="cl-ph">⚽</div>}
                <div className="cl-body">
                  <div className="cl-kicker">{s.category}</div>
                  <div className="cl-title">{s.title}</div>
                  <div className="cl-meta">{s.author} · {fmt(s.created_at)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* PLAYER FOCUS */}
          {playerCards.length > 0 && (
            <>
              <div className="sec-head-left">
                <span className="sh-label">Player Focus</span>
                <button className="sh-more">See all →</button>
              </div>
              <div className="grid-3">
                {playerCards.slice(0,3).map(s => (
                  <div key={s.id} className="g-card" onClick={() => open(s)}>
                    <div className="g-img-wrap">
                      {s.image_url
                        ? <img src={s.image_url} alt={s.title} className="g-img" onError={e => e.currentTarget.style.display='none'} />
                        : <div className="g-ph">⚽</div>}
                    </div>
                    <div className="g-kicker">{s.category}</div>
                    <div className="g-title">{s.title}</div>
                    <div className="g-excerpt">{s.excerpt}</div>
                    <div className="g-meta"><strong>{s.author}</strong> · {fmt(s.created_at)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </>)}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="fb-name">The <em>Stretford</em> End</div>
            <p>Independent Manchester United fan blog. Not affiliated with Manchester United FC. All opinions are those of our writers.</p>
          </div>
          <div className="footer-col">
            <h4>Sections</h4>
            <a onClick={goHome}>Home</a>
            <a>Match Reports</a>
            <a>Transfer News</a>
            <a>Player Focus</a>
            <a>Opinion</a>
          </div>
          <div className="footer-col">
            <h4>About</h4>
            <a>About Us</a>
            <a>Contact</a>
            <a>Privacy Policy</a>
            <a>Terms of Use</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 The Stretford End · Manchester United Fan Blog · Not affiliated with MUFC</span>
        </div>
      </footer>
    </>
  )
}

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
    return { props: { initialArticles: [] } }
  }
}

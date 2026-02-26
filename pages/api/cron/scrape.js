import { getServiceClient } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const authHeader = req.headers['authorization']
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const articles = await fetchAndRewriteNews()
    const saved = await saveArticles(articles)
    await pruneOldLiveArticles()
    return res.status(200).json({ success: true, saved, timestamp: new Date().toISOString() })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

async function fetchOgImage(url) {
  if (!url) return null
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'Accept': 'text/html' },
      signal: AbortSignal.timeout(6000)
    })
    if (!res.ok) return null
    const html = await res.text()
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    if (ogMatch?.[1]) return ogMatch[1]
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)
    if (twMatch?.[1]) return twMatch[1]
    return null
  } catch (e) { return null }
}

const FALLBACK = {
  'Match Report':'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=800&q=80',
  'Transfer News':'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  'Transfers':'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  'Club News':'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  'Injury Update':'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  'Premier League':'https://images.unsplash.com/photo-1551958219-acbc595bc558?w=800&q=80',
  'Opinion':'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
  'Player Focus':'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&q=80',
  'Finance':'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
  'Analysis':'https://images.unsplash.com/photo-1551958219-acbc595bc558?w=800&q=80',
}

async function fetchAndRewriteNews() {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const prompt = `Search the web for the 6 most recent Manchester United news stories from today (${today}). Write each as a neutral journalist article. Return ONLY a JSON array, no markdown, exactly 6 objects each with: "title" (max 12 words), "excerpt" (1-2 sentences), "body" (3 paragraphs separated by \\n\\n), "category" (one of: "Transfer News","Match Report","Club News","Injury Update","Premier League","Opinion"), "tags" (2-4 strings), "source_url" (the real URL of the original article)`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!response.ok) throw new Error(`Anthropic API ${response.status}`)
  const data = await response.json()
  const text = (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('')
  if (!text) throw new Error('No text')
  const clean = text.replace(/```json|```/gi,'').trim()
  const s = clean.indexOf('['), e = clean.lastIndexOf(']')
  if (s===-1) throw new Error('No JSON array')
  return JSON.parse(clean.slice(s,e+1))
}

async function saveArticles(articles) {
  const supabase = getServiceClient()
  const ogImages = await Promise.all(articles.map(a => fetchOgImage(a.source_url)))
  const rows = articles.map((a,i) => ({
    title: String(a.title||'').slice(0,255),
    excerpt: String(a.excerpt||'').slice(0,500),
    body: String(a.body||''),
    category: String(a.category||'Club News'),
    author: 'Staff Reporter', is_live: true,
    image_url: ogImages[i] || FALLBACK[a.category] || FALLBACK['Match Report'],
    tags: Array.isArray(a.tags) ? a.tags.slice(0,10) : [],
    published: true
  }))
  const { data, error } = await supabase.from('articles').insert(rows).select('id')
  if (error) throw new Error('Insert failed: ' + error.message)
  return data?.length || 0
}

async function pruneOldLiveArticles() {
  const supabase = getServiceClient()
  const cutoff = new Date(Date.now() - 48*60*60*1000).toISOString()
  await supabase.from('articles').delete().eq('is_live',true).lt('created_at',cutoff)
}

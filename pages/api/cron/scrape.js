import { getServiceClient } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const authHeader = req.headers['authorization']
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  console.log('[scrape] Starting at', new Date().toISOString())
  try {
    const articles = await fetchAndRewriteNews()
    const saved = await saveArticles(articles)
    await pruneOldLiveArticles()
    return res.status(200).json({ success: true, saved, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('[scrape] Failed:', error.message)
    return res.status(500).json({ error: error.message })
  }
}

async function fetchImageForArticle(query) {
  try {
    const apiKey = 'AIzaSyA3zrsJ4TUEO-FFVoU8LskYO1Go5LCXI9o'
    const cx = '5315d2a10f3944f6d'
    const searchQuery = encodeURIComponent(`Manchester United ${query}`)
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${searchQuery}&searchType=image&num=1&imgSize=large&imgType=photo&safe=active`
    const res = await fetch(url)
    const data = await res.json()
    if (data.items && data.items.length > 0) return data.items[0].link
    return null
  } catch (e) {
    console.warn('[scrape] Image fetch failed:', e.message)
    return null
  }
}

async function fetchAndRewriteNews() {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const prompt = `Search the web for the 6 most recent Manchester United news stories published in the last 24 hours (today is ${today}).
For each story, write a short neutral news article in the style of a professional sports journalist. Use third-person voice, factual tone, no fan language, no "we" or "our". Do not reproduce sentences verbatim from any source.
Return ONLY a valid JSON array with no markdown fences, no explanation. Include exactly 6 objects, each with:
- "title": compelling headline (max 12 words)
- "excerpt": 1-2 sentence summary (max 35 words)
- "body": exactly 3 paragraphs separated by \\n\\n. Use real facts from search results only. Never invent statistics or quotes.
- "category": one of exactly: "Transfer News", "Match Report", "Club News", "Injury Update", "Premier League", "Opinion"
- "tags": array of 2-4 relevant tag strings`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Anthropic API ${response.status}: ${errText.slice(0, 300)}`)
  }
  const data = await response.json()
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  if (!text) throw new Error('No text in Anthropic response')
  const clean = text.replace(/```json|```/gi, '').trim()
  const start = clean.indexOf('[')
  const end = clean.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found')
  const parsed = JSON.parse(clean.slice(start, end + 1))
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty articles array')
  return parsed
}

async function saveArticles(articles) {
  const supabase = getServiceClient()
  console.log('[scrape] Fetching images...')
  const images = await Promise.all(articles.map(a => fetchImageForArticle(a.title)))
  const rows = articles.map((a, i) => ({
    title: String(a.title || '').slice(0, 255),
    excerpt: String(a.excerpt || '').slice(0, 500),
    body: String(a.body || ''),
    category: String(a.category || 'Club News'),
    author: 'Staff Reporter',
    is_live: true,
    image_url: images[i] || null,
    tags: Array.isArray(a.tags) ? a.tags.slice(0, 10) : [],
    published: true
  }))
  const { data, error } = await supabase.from('articles').insert(rows).select('id')
  if (error) throw new Error('Supabase insert failed: ' + error.message)
  return data?.length || 0
}

async function pruneOldLiveArticles() {
  const supabase = getServiceClient()
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase.from('articles').delete().eq('is_live', true).lt('created_at', cutoff)
  if (error) console.warn('[scrape] Prune warning:', error.message)
}

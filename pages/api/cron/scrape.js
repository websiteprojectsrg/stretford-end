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
    console.error('[scrape] Failed:', error.message)
    return res.status(500).json({ error: error.message })
  }
}

// Step 1: Extract og:image URL from source article page
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
  } catch (e) {
    console.warn('[scrape] og:image failed for', url?.slice(0, 50), e.message)
    return null
  }
}

// Step 2: Download image and upload to Supabase Storage
async function uploadToStorage(imageUrl, filename) {
  if (!imageUrl) return null
  try {
    // Download the image
    const imgRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        'Referer': 'https://www.google.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*'
      },
      signal: AbortSignal.timeout(8000)
    })
    if (!imgRes.ok) {
      console.warn('[scrape] Image download failed:', imgRes.status, imageUrl.slice(0, 60))
      return null
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      console.warn('[scrape] Not an image:', contentType)
      return null
    }

    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 1000) {
      console.warn('[scrape] Image too small, likely blocked')
      return null
    }

    // Upload to Supabase Storage
    const supabase = getServiceClient()
    const ext = contentType.includes('png') ? 'png' : contentType.includes('gif') ? 'gif' : contentType.includes('webp') ? 'webp' : 'jpg'
    const path = `articles/${filename}.${ext}`

    const { error } = await supabase.storage
      .from('article-images')
      .upload(path, buffer, {
        contentType,
        upsert: true
      })

    if (error) {
      console.warn('[scrape] Storage upload failed:', error.message)
      return null
    }

    // Get public URL
    const { data } = supabase.storage.from('article-images').getPublicUrl(path)
    console.log('[scrape] Uploaded to storage:', path)
    return data.publicUrl

  } catch (e) {
    console.warn('[scrape] Upload failed:', e.message)
    return null
  }
}

const FALLBACK = {
  'Match Report':   'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg',
  'Transfer News':  'https://icdn.strettynews.com/wp-content/uploads/2026/02/man-utd-ratcliffe-wilcox.jpg',
  'Transfers':      'https://icdn.strettynews.com/wp-content/uploads/2026/02/man-utd-ratcliffe-wilcox.jpg',
  'Club News':      'https://icdn.strettynews.com/wp-content/uploads/2026/01/amorim-carrick-man-utd.jpg',
  'Injury Update':  'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4459.jpeg',
  'Premier League': 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg',
  'Opinion':        'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg',
  'Player Focus':   'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4772.jpeg',
  'Finance':        'https://icdn.strettynews.com/wp-content/uploads/2026/02/man-utd-ratcliffe-wilcox.jpg',
  'Analysis':       'https://icdn.strettynews.com/wp-content/uploads/2026/01/amorim-carrick-man-utd.jpg',
  'Preview':        'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4292.jpeg',
}

// Player/topic images — matched against title AND tags
// Every entry is a real photo of a person — no grass, no balls, no stock images
const PLAYER_IMAGES = [
  // Players
  { keywords: ['sesko','sésko','šeško'],          url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg' },
  { keywords: ['mbeumo'],                          url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4772.jpeg' },
  { keywords: ['amad','diallo'],                   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4521.jpeg' },
  { keywords: ['mainoo','kobbie'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg' },
  { keywords: ['lammens','senne'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4783.jpeg' },
  { keywords: ['maguire','harry'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4168.jpeg' },
  { keywords: ['martinez','martínez','lisandro'],  url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4542.jpeg' },
  { keywords: ['ugarte','manuel'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/Zoomed-in-circle-frame-2.jpg' },
  { keywords: ['cunha','matheus'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4189.jpeg' },
  { keywords: ['yoro','leny'],                     url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/Zoomed-in-13.jpg' },
  { keywords: ['dalot','diogo'],                   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/Zoomed-in-13.jpg' },
  { keywords: ['dorgu','patrick'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4633.jpeg' },
  { keywords: ['mazraoui','noussair'],             url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/Zoomed-in-13.jpg' },
  { keywords: ['fernandes','bruno'],               url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4772.jpeg' },
  { keywords: ['zirkzee','joshua'],                url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4359.jpeg' },
  { keywords: ['mount','mason'],                   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4459.jpeg' },
  { keywords: ['de ligt','de-ligt','matthijs'],    url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4523.jpeg' },
  { keywords: ['casemiro'],                        url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg' },
  { keywords: ['rashford','marcus'],               url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4359.jpeg' },
  { keywords: ['shaw','luke'],                     url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4542.jpeg' },
  // Managers
  { keywords: ['carrick','michael'],               url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg' },
  { keywords: ['amorim','ruben','rúben'],           url: 'https://icdn.strettynews.com/wp-content/uploads/2025/09/Zoomed-in-39.jpg' },
  // Topics — still real United photos, just more general
  { keywords: ['transfer','signing','bid','fee','target','deal','window'], url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/man-utd-ratcliffe-wilcox.jpg' },
  { keywords: ['profit','revenue','financial','finance','accounts'],       url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/man-utd-ratcliffe-wilcox.jpg' },
  { keywords: ['newcastle','st james',"st. james"],                        url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4292.jpeg' },
  { keywords: ['palace','crystal'],                                        url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg' },
  { keywords: ['villa','aston'],                                           url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg' },
  { keywords: ['arsenal','emirates'],                                      url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4292.jpeg' },
  { keywords: ['liverpool','anfield'],                                     url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg' },
  { keywords: ['city','etihad','derby'],                                   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg' },
  { keywords: ['stretford','old trafford','terraces','fans','atmosphere'], url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg' },
  { keywords: ['injury','injured','fitness','return','setback','surgery'], url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4459.jpeg' },
  { keywords: ['permanent','manager','job','appointment','contract'],      url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/amorim-carrick-man-utd.jpg' },
  { keywords: ['third','table','top four','champions league','unbeaten'],  url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg' },
]

function getPlayerImage(title, tags) {
  // Search both title and tags
  const text = [title, ...(tags || [])].join(' ').toLowerCase()
  for (const p of PLAYER_IMAGES) {
    if (p.keywords.some(k => text.includes(k))) return p.url
  }
  return null
}

async function fetchAndRewriteNews() {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const prompt = `Search the web for the 6 most recent Manchester United news stories from today (${today}).
Write each as a neutral journalist article. Return ONLY a JSON array, no markdown fences, exactly 6 objects each with:
- "title": headline max 12 words
- "excerpt": 1-2 sentences max 35 words
- "body": 3 paragraphs separated by \\n\\n, factual only
- "category": one of: "Transfer News","Match Report","Club News","Injury Update","Premier League","Opinion","Preview","Player Focus","Analysis"
- "tags": array of 3-5 strings. IMPORTANT: always include the full surname of any player or manager mentioned (e.g. "Sesko", "Carrick", "Mainoo", "Fernandes", "Maguire", "Cunha", "Mbeumo", "Amorim"). These are used for image matching.
- "source_url": the real URL of the original article you found this story from`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!response.ok) throw new Error(`Anthropic API ${response.status}: ${await response.text().then(t => t.slice(0, 200))}`)
  const data = await response.json()
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  if (!text) throw new Error('No text in response')
  const clean = text.replace(/```json|```/gi, '').trim()
  const start = clean.indexOf('['), end = clean.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found')
  const parsed = JSON.parse(clean.slice(start, end + 1))
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty array')
  console.log(`[scrape] Got ${parsed.length} articles`)
  return parsed
}

async function saveArticles(articles) {
  const supabase = getServiceClient()

  // For each article: try og:image first, then player-specific image, then category fallback
  console.log('[scrape] Processing images...')
  const imageUrls = await Promise.all(articles.map(async (a, i) => {
    // 1. Try og:image from source URL and upload to our storage
    const ogUrl = await fetchOgImage(a.source_url)
    if (ogUrl) {
      const filename = `article-${Date.now()}-${i}`
      const stored = await uploadToStorage(ogUrl, filename)
      if (stored) {
        console.log(`[scrape] Article ${i + 1}: uploaded og:image ✓`)
        return stored
      }
      // og:image URL exists but upload failed — use the direct URL as fallback
      console.log(`[scrape] Article ${i + 1}: upload failed, using direct og:image URL`)
      return ogUrl
    }
    // 2. Try player-specific image based on title/tags
    const playerImg = getPlayerImage(a.title, a.tags)
    if (playerImg) {
      console.log(`[scrape] Article ${i + 1}: using player image ✓`)
      return playerImg
    }
    // 3. Category fallback
    console.log(`[scrape] Article ${i + 1}: using category fallback`)
    return FALLBACK[a.category] || FALLBACK['Match Report']
  }))

  const rows = articles.map((a, i) => ({
    title: String(a.title || '').slice(0, 255),
    excerpt: String(a.excerpt || '').slice(0, 500),
    body: String(a.body || ''),
    category: String(a.category || 'Club News'),
    author: 'Staff Reporter',
    is_live: true,
    image_url: imageUrls[i],
    tags: Array.isArray(a.tags) ? a.tags.slice(0, 10) : [],
    published: true
  }))

  const { data, error } = await supabase.from('articles').insert(rows).select('id')
  if (error) throw new Error('Insert failed: ' + error.message)
  return data?.length || 0
}

async function pruneOldLiveArticles() {
  const supabase = getServiceClient()
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  await supabase.from('articles').delete().eq('is_live', true).lt('created_at', cutoff)
}

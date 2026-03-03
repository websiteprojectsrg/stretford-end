import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { category, live, limit = 20 } = req.query

  let query = supabase
    .from('articles')
    .select('id, title, excerpt, body, category, author, is_live, image_url, tags, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit))

  if (category) query = query.eq('category', category)
  if (live === 'true') query = query.eq('is_live', true)
  if (live === 'false') query = query.eq('is_live', false)

  const { data, error } = await query

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ error: 'Failed to fetch articles' })
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
  return res.status(200).json({ articles: data || [] })
}

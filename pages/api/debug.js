// pages/api/debug.js
// Temporarily add this file to your project to diagnose the scrape failure
// Visit: https://stretford-end.vercel.app/api/debug

export default async function handler(req, res) {
  const results = {}

  // 1. Check env vars exist (don't expose values)
  results.env = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY ? `set (${process.env.ANTHROPIC_API_KEY?.slice(0,8)}...)` : 'MISSING',
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING',
    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY ? 'set' : 'MISSING',
    CRON_SECRET: !!process.env.CRON_SECRET ? 'set' : 'not set (ok)',
  }

  // 2. Test Anthropic API directly
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say OK' }]
      }),
      signal: AbortSignal.timeout(15000)
    })
    const data = await r.json()
    results.anthropic = r.ok
      ? { status: 'OK', model: data.model }
      : { status: 'FAILED', error: data.error?.message || JSON.stringify(data).slice(0, 200) }
  } catch (e) {
    results.anthropic = { status: 'CRASHED', error: e.message }
  }

  // 3. Test Supabase connection
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
    const { data, error } = await sb.from('articles').select('id').limit(1)
    results.supabase = error
      ? { status: 'FAILED', error: error.message }
      : { status: 'OK', rows: data?.length }
  } catch (e) {
    results.supabase = { status: 'CRASHED', error: e.message }
  }

  return res.status(200).json(results)
}

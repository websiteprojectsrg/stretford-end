// Fixes all articles in the DB that have generic/bad images
// Run with: node fix-images.mjs

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://kbcowhkqgxptkllvmgre.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY293aGtxZ3hwdGtsbHZtZ3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyMDg0OSwiZXhwIjoyMDg3Njk2ODQ5fQ.QcNLvNMvgj9L4TcvEwYyUxQfYsBW19EykP9Vfbq2m0Y',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Every image here is a real photo of a person or specific event — NO grass, NO balls, NO clipart
const PLAYER_IMAGES = [
  { keywords: ['sesko','sésko','šeško'],  url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg' },
  { keywords: ['mbeumo'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4772.jpeg' },
  { keywords: ['amad'],                   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4521.jpeg' },
  { keywords: ['mainoo'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg' },
  { keywords: ['lammens'],                url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4783.jpeg' },
  { keywords: ['maguire'],                url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4168.jpeg' },
  { keywords: ['martinez','martínez'],    url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4542.jpeg' },
  { keywords: ['ugarte'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/Zoomed-in-circle-frame-2.jpg' },
  { keywords: ['cunha'],                  url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4189.jpeg' },
  { keywords: ['yoro'],                   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/Zoomed-in-13.jpg' },
  { keywords: ['dalot'],                  url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/Zoomed-in-13.jpg' },
  { keywords: ['dorgu'],                  url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4633.jpeg' },
  { keywords: ['fernandes','bruno'],      url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4772.jpeg' },
  { keywords: ['zirkzee'],                url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4359.jpeg' },
  { keywords: ['mount'],                  url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4459.jpeg' },
  { keywords: ['de ligt','de-ligt'],      url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4523.jpeg' },
  { keywords: ['carrick'],                url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg' },
  { keywords: ['amorim'],                 url: 'https://icdn.strettynews.com/wp-content/uploads/2025/09/Zoomed-in-39.jpg' },
  { keywords: ['shaw'],                   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4542.jpeg' },
  { keywords: ['rashford'],               url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4359.jpeg' },
  { keywords: ['casemiro'],               url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg' },
  { keywords: ['transfer','signing','deal','bid','fee','target'], url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/man-utd-ratcliffe-wilcox.jpg' },
  { keywords: ['newcastle','st james'],   url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4292.jpeg' },
  { keywords: ['palace','crystal'],       url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg' },
  { keywords: ['villa','aston'],          url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg' },
  { keywords: ['profit','revenue','financial','finance'], url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/man-utd-ratcliffe-wilcox.jpg' },
  { keywords: ['stretford','old trafford','terraces','fans','crowd'], url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg' },
]

// Generic bad images to replace — any article with these gets auto-fixed
const BAD_IMAGES = [
  'photo-1522778526097',  // football pitch/grass
  'photo-1574629810360',  // stadium generic
  'photo-1459865264687',  // crowd generic
  'photo-1579952363873',  // tactics board
  'photo-1431324155629',  // transfer news generic
  'photo-1571019613454',  // injury generic
  'photo-1489944440615',  // premier league generic
  'photo-1543326727',     // player focus generic
  null, undefined, ''
]

function pickImage(title, category) {
  const text = (title || '').toLowerCase()
  for (const p of PLAYER_IMAGES) {
    if (p.keywords.some(k => text.includes(k))) return p.url
  }
  // Category defaults — all real photos
  const CAT = {
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
  return CAT[category] || 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg'
}

async function run() {
  console.log('📋 Fetching all articles...')
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, category, image_url')
    .order('created_at', { ascending: false })

  if (error) { console.error('Fetch error:', error.message); return }
  console.log(`Found ${articles.length} articles\n`)

  let fixed = 0
  for (const a of articles) {
    const isBad = !a.image_url || BAD_IMAGES.some(bad => bad && a.image_url?.includes(bad))
    if (!isBad) continue

    const newUrl = pickImage(a.title, a.category)
    const { error: updateError } = await supabase
      .from('articles')
      .update({ image_url: newUrl })
      .eq('id', a.id)

    if (updateError) {
      console.error(`❌ Failed [${a.id}]: ${updateError.message}`)
    } else {
      console.log(`✅ Fixed: "${a.title.slice(0, 55)}"`)
      console.log(`        → ${newUrl.split('/').pop()}\n`)
      fixed++
    }
  }

  console.log(`\n🎉 Done. Fixed ${fixed} articles with bad/generic images.`)
  if (fixed === 0) console.log('   (All articles already have good images)')
}

run().catch(console.error)

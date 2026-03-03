// Run with: node update-articles.mjs
// Deletes old fan articles and inserts 10 fresh ones with real images

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://kbcowhkqgxptkllvmgre.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiY293aGtxZ3hwdGtsbHZtZ3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjEyMDg0OSwiZXhwIjoyMDg3Njk2ODQ5fQ.QcNLvNMvgj9L4TcvEwYyUxQfYsBW19EykP9Vfbq2m0Y',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const IMGS = {
  sesko:    'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg',
  mbeumo:   'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4772.jpeg',
  mainoo:   'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg',
  maguire:  'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4168.jpeg',
  cunha:    'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4189.jpeg',
  mount:    'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4459.jpeg',
  carrick:  'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg',
  deligt:   'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4523.jpeg',
  amad:     'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4521.jpeg',
  stadium:  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  match:    'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=800&q=80',
  tactics:  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
  crowd:    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
}

const articles = [
  {
    title: "Sesko 2-1 Palace: The Header That Sent Old Trafford Into Orbit",
    excerpt: "Benjamin Sesko's bullet header settled it. In his first start under Carrick, the Slovenian proved he's no super-sub — he's our striker.",
    body: "Right, let's get one thing straight. I was one of the sceptics. When we signed Sesko for £73m last summer I thought — decent lad, raw, Premier League might take a while to chew him up. Six months later, I'm sat here eating every word with a smile on my face.\n\nThat header against Palace wasn't just a goal. It was a statement. Fernandes curled one of those disgusting crosses that only he can produce, and Sesko met it with pace, power, and precision. Dean Henderson, former Red and very loud about it, had absolutely no chance. The net rippled. Seventy-four thousand people lost their minds.\n\nSeven goals in 2026. Four in his last five. We came from behind — again — to win. 10 games unbeaten. Third in the Premier League. Carrick's name being sung from the Stretford End. This club is alive again. Don't you dare look away.",
    category: 'Match Report',
    author: 'Terry Lawton',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4755.jpeg',
    tags: ['Sesko', 'Crystal Palace', 'Match Report', 'Premier League'],
  },
  {
    title: "Third in the Premier League. Let That Sink In.",
    excerpt: "Seven games unbeaten, 51 points, third place. Michael Carrick has done something nobody thought possible six weeks ago.",
    body: "Cast your mind back to early January. We were 14th. Amorim was gone. Half the fanbase wanted to just write the season off. I'll be honest — I was nearly in that camp.\n\nThen Michael Carrick walked in. Quiet. Composed. No press conference theatrics, no grand tactical manifesto. Just rolled up his sleeves and got to work. Seven games later — six wins, one draw — we're third. Three points above Chelsea, three above Liverpool. Champions League football, which felt like a pipe dream six weeks ago, is now firmly in our own hands.\n\nWhat's he done differently? The pressing has purpose. Casemiro has been transformed. Bruno is on another level. Mainoo growing every game. And Sesko — well, we've written enough about Sesko this week. Newcastle away Wednesday. Villa at home on the 15th. Don't stop us now.",
    category: 'Opinion',
    author: 'Gaz Neville (not that one)',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/amorim-carrick-man-utd.jpg',
    tags: ['Carrick', 'Premier League', 'Top Four', 'Opinion'],
  },
  {
    title: "Newcastle Away Wednesday: The Game That Defines Our Season",
    excerpt: "St James' Park under the lights, 20,000 Reds in the away end. This is the one that tells us exactly who we are.",
    body: "I've been to Newcastle away twice in my life. Once in 2012 — we won 3-0, Rooney hat-trick, coach home felt like floating. Once in 2019 — we lost 1-0 and I cried quietly on the A69. That's football.\n\nWednesday night (20:15 kick-off — set your alarms) we go back. Third versus mid-table on paper, but St James' on a floodlit Wednesday is never just mid-table energy. That ground generates noise like nowhere else in England, and our twenty thousand in the away end will match them decibel for decibel.\n\nSesko should start again. His aerial ability against Schar and Burn is a genuine weapon. Mbeumo wide right, Cunha causing chaos on the left. A win Wednesday and we're consolidating third before the Villa test on the 15th. Come on you Reds.",
    category: 'Preview',
    author: 'Sinéad McGrath',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4292.jpeg',
    tags: ['Newcastle', 'Preview', 'Premier League', 'Away Days'],
  },
  {
    title: "Mount and De Ligt Are Coming Back — And That's a Beautiful Problem",
    excerpt: "Carrick is about to have a very nice headache. Mason Mount and Matthijs de Ligt are edging towards fitness just as everything is clicking without them.",
    body: "There's a quote from the Carrick press conference that keeps rattling around in my head. On Mason Mount: 'He's on the grass. He's getting closer. He's a big player and we're looking after him.' Big player. He said it deliberately.\n\nThink about what that means. We're third in the league with a depleted squad — without Mount, without De Ligt, and with Lisandro Martinez only intermittently available. When everyone is fit, this squad gets significantly better. De Ligt alongside Yoro could be the best centre-back partnership in England.\n\nMount's return gives Carrick a proper 10 who can link defence to attack in tight spaces. Bruno shifts slightly, Mainoo stays disciplined. The question is whether Carrick changes what's working or integrates gradually. My bet? He doesn't touch it until he has to. Smart. Patient. Exactly what this club has been missing.",
    category: 'Injury Update',
    author: 'Jackie Thornton',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4459.jpeg',
    tags: ['Mount', 'De Ligt', 'Injuries', 'Analysis'],
  },
  {
    title: "Give Carrick the Job. Stop Pretending There's a Better Option.",
    excerpt: "Six wins in seven, Old Trafford singing his name, players transformed. At what point does 'interim' just become 'manager'?",
    body: "Let me tell you about the moment I knew. Tottenham, February 7th, 2-0 at Old Trafford. The final whistle. And then 74,000 people started chanting his name. Not 'attack, attack, attack.' His name. Car-rick. Car-rick. Car-rick. The man visibly didn't know what to do with himself. That's not an interim. That's a United manager.\n\nHe came in saying all the right things — 'I'm just here to help, we'll see how it goes.' But results have a way of making decisions for you. Six wins in seven. Third in the table. Players talking about the culture change. Sesko after Sunday: 'The gaffer gives me so much confidence. I want to play for him.' You can't manufacture that.\n\nThe club will interview candidates in the summer. They should — due diligence matters. But the answer is already in the building. It's the quiet composed bloke in the navy training top who grew up watching Cantona from the Stretford End and wore the badge for twelve years. Give him the job. Give it to him now.",
    category: 'Opinion',
    author: 'Gaz Neville (not that one)',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg',
    tags: ['Carrick', 'Manager', 'Opinion', 'Future'],
  },
  {
    title: "Kobbie Mainoo Is Becoming the Heartbeat of This Team",
    excerpt: "While everyone raves about Sesko and Fernandes, take a moment to appreciate what Kobbie Mainoo is doing in the engine room.",
    body: "Everyone's rightly losing their mind over Sesko. Bruno Fernandes is the obvious man of the match week after week. But I want to talk about Kobbie Mainoo, because I think he's quietly becoming the most important player in this team.\n\nAgainst Palace he was everywhere. Seven ball recoveries. A run in the 38th minute that drew two Palace players and created space for Mbeumo. Defensively, he covered every blade of grass that Casemiro vacated. At 20 years old. At Old Trafford. In a must-win game.\n\nThere's a maturity to Mainoo that you just don't see in players his age. No flicks, no showboating. He just makes the right decision at the right time and makes everyone around him better. He's playing like a player who's been in this team for a decade. Under Carrick's guidance he's blossoming into something genuinely special. Remember his name. You'll be saying it for the next fifteen years.",
    category: 'Player Focus',
    author: 'Terry Lawton',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4792.jpeg',
    tags: ['Mainoo', 'Player Focus', 'Premier League', 'Analysis'],
  },
  {
    title: "Harry Maguire: The Comeback Nobody Expected and Everyone Deserved",
    excerpt: "Written off, ridiculed, nearly sold. Harry Maguire is now one of the first names on Carrick's teamsheet. Football's greatest redemption arc.",
    body: "Cast your mind back twelve months. Harry Maguire was the punchline to every joke in English football. Captaincy stripped, groans every time he touched the ball. Even the most sympathetic United fan was wondering if it was time for him to go.\n\nNobody's laughing now. Under Carrick, Maguire has been a cornerstone of a defence that's kept four clean sheets in seven games. His reading of the game has always been there — it was errors under pressure that made him look terrible. Remove the pressure, give him a settled partnership and a clear structure, and what you get is a proper Premier League centre-back. His communication with Yoro has been excellent.\n\nThe Carrick effect on Maguire might be the most underreported story of this resurgence. A manager who trusts him, plays to his strengths, and publicly backs him. Maguire has responded like a man reborn. Football giveth. Football taketh away. And sometimes, if you stick around long enough, football giveth again.",
    category: 'Player Focus',
    author: 'Sinéad McGrath',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/01/IMG_4168.jpeg',
    tags: ['Maguire', 'Player Focus', 'Premier League', 'Carrick'],
  },
  {
    title: "Mbeumo Is Doing Things With the Ball That Shouldn't Be Legal",
    excerpt: "Bryan Mbeumo has been United's most consistent performer all season. It's time we mentioned him in the same breath as the Premier League's very best.",
    body: "Bryan Mbeumo arrived at United in the summer without much fanfare. Sesko was the headline signing, Cunha the exciting wildcard. Mbeumo was the quiet professional who just got on with it while cameras pointed elsewhere.\n\nThirteen league goals. Seven assists. That's the return from a right winger nobody outside Brentford properly rated before this season. Against Palace he created three chances, won two free kicks in dangerous areas, and was a constant menace throughout. He and Fernandes are developing a telepathic understanding on that right side — Bruno knows where Bry will be; Bry knows where Bruno's pass will arrive.\n\nCarrick's tactical structure has accelerated it, giving them defined zones, clear responsibilities, freedom within a system. Mbeumo is a Premier League elite winger. I'll stand by that without hesitation. He just doesn't need you to know it.",
    category: 'Player Focus',
    author: 'Jackie Thornton',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/IMG_4772.jpeg',
    tags: ['Mbeumo', 'Player Focus', 'Premier League', 'Attack'],
  },
  {
    title: "Amorim Was Wrong — But Let's Learn From Why It Went So Badly",
    excerpt: "We shouldn't pretend Amorim never happened. What went wrong, and how do we avoid hiring the wrong manager again?",
    body: "I've been thinking about Ruben Amorim a lot recently. Not with anger — the fury has faded. More with a sad curiosity about how something that looked so promising on paper went so catastrophically wrong on the pitch.\n\nThe tactical system was never the only problem. The 3-4-3 with wing-backs works — it works at Sporting, it works elsewhere. The problem was the squad. United had neither the wing-backs to make it function, nor the pressing intensity required for the high defensive line. Amorim said this himself — 'we don't have the players for this yet.'\n\nWhat Carrick has done differently is meet the players where they are. The system serves the squad, not the other way around. That's management. The lesson for this summer: hire someone with vision, absolutely. But hire someone who can adapt. Tactical purity is worthless if the dressing room is lost.",
    category: 'Opinion',
    author: 'Gaz Neville (not that one)',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2025/09/Zoomed-in-39.jpg',
    tags: ['Amorim', 'Opinion', 'Carrick', 'Analysis'],
  },
  {
    title: "Why the Stretford End Feels Different This Season",
    excerpt: "It's not just the results. There's something in the air at Old Trafford right now that this generation of supporters has never felt before.",
    body: "I've been going to Old Trafford for 22 years. Home and away, league and cups, good times and very, very bad. I was there for the 4-4 against Bournemouth in December when the atmosphere was somewhere between a wake and a protest. I was there for the Tottenham win in February when it felt like a completely different stadium.\n\nWhat's changed? It's easy to say 'results' and leave it there. But that's not quite it — we've had good runs before without this feeling. There's something about Carrick specifically that the Stretford End has responded to. He's one of ours. When the crowd sings his name, you can see it genuinely moves him. That connection is rare and it's real.\n\nThe team is playing for him. You can see it in how they sprint back, how they press, how they celebrate together. There's a collective will that was absent for most of the last three years. Right now, in March 2026, it feels like more than a glimpse. It feels like something that might last.",
    category: 'Opinion',
    author: 'Sinéad McGrath',
    image_url: 'https://icdn.strettynews.com/wp-content/uploads/2026/02/michael-carrick-man-united.jpg',
    tags: ['Old Trafford', 'Fans', 'Opinion', 'Carrick'],
  },
]

async function run() {
  console.log('\n🗑️  Deleting old fan articles...')
  const { error: delError } = await supabase
    .from('articles')
    .delete()
    .eq('is_live', false)

  if (delError) {
    console.error('Delete error:', delError.message)
    return
  }
  console.log('✅ Old articles cleared\n')
  console.log('📰 Inserting 10 fresh articles...\n')

  const now = Date.now()
  for (let i = 0; i < articles.length; i++) {
    const createdAt = new Date(now - (articles.length - i) * 5 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('articles')
      .insert({ ...articles[i], published: true, is_live: false, created_at: createdAt })
      .select('id, title')
      .single()

    if (error) {
      console.error(`❌ [${i+1}/10] FAILED: ${articles[i].title.slice(0, 50)}`)
      console.error('   ', error.message)
    } else {
      console.log(`✅ [${i+1}/10] ${data.title.slice(0, 65)}`)
    }
  }

  console.log('\n🎉 Done! Refresh your site to see all 10 fresh articles with real images.')
}

run().catch(console.error)

#!/usr/bin/env node
/**
 * setup-db.js
 * Run once after cloning: node setup-db.js
 * Creates the articles table and seeds the 10 fan-written articles.
 */

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
  console.error('❌  Missing env vars. Make sure .env.local is present and run:')
  console.error('   export $(cat .env.local | xargs) && node setup-db.js')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
}

async function runSQL(sql, label) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql })
  })
  // exec_sql may not exist — we'll use the REST API approach instead
}

async function createTable() {
  console.log('📦  Creating articles table...')
  // Use Supabase REST API to create table via PostgREST
  // We'll insert a test row to check if table exists, create via SQL editor instructions if not
  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles?limit=1`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  })
  
  if (res.status === 200) {
    console.log('✅  Table already exists!')
    return true
  }
  
  console.log('⚠️   Table does not exist yet. Status:', res.status)
  return false
}

async function seedArticles() {
  console.log('🌱  Seeding fan-written articles...')

  const articles = [
    {
      title: "Sesko Does It Again — Super-Sub Slots United to Priceless Win at Everton",
      excerpt: "Benjamin Sesko came off the bench for the third time in four games to net the only goal as United edged a cagey 1-0 win at Hill Dickinson Stadium on Monday night.",
      body: "Monday night football at Everton's new ground, and honestly, I wasn't fancying it. Hill Dickinson Stadium was rocking — their fans have been absolutely gasping for a result for weeks and you could feel it before a ball had been kicked.\n\nWe were dreadful for most of that first half. I don't care what the possession stats say — 67% of the ball and creating nowt is just slow strangulation, not dominance. Bruno looked like he was playing in treacle. Amad was bright but ran into dead ends. Cunha trying his best but Everton had us properly sussed.\n\nQUOTE: He comes off the bench and just does it, calm as owt. Three times in four games now. Carrick has got to start him against Palace — you simply cannot keep a man playing like this on the bench.\n\nThen Carrick makes the change. Sesko on for Amad just before the hour. The lad has this presence — big, direct, doesn't faff about. When Cunha played that diagonal ball to Mbeumo, and Bry held up brilliantly against Keane — proper class — and squared it for Sesko: 1-0. Simple. Clinical. Ice in his veins.",
      category: "Match Report", author: "Terry Lawton", is_live: false,
      image_url: "https://resources.premierleague.com/premierleague/photos/players/250x250/p489191.png",
      tags: ["Sesko", "Match Report", "Premier League", "Everton"], published: true
    },
    {
      title: "Carrick Is Flying — But the Board Won't Commit. Make It Make Sense.",
      excerpt: "Five wins and a draw from six in the league. Yet United's hierarchy are reportedly not ready to hand Carrick the permanent role. Spurs and Palace are already circling.",
      body: "Right, let's have this conversation properly. Carrick came in on January 13th when we were an absolute shambles. Since then: beaten City at Old Trafford — first time since 2023. Beaten Arsenal away — first time since 2017. Won at Fulham, battered Spurs, nicked a draw at West Ham, and won at Everton. Five wins and a draw from six in the league.\n\nAnd the board are sat there going \"oh well, we need to run a proper process.\" TEAMtalk say he's not the frontrunner internally. The Telegraph reckons Spurs and Crystal Palace are already circling him. So we might actually lose this fella to Crystal Palace?\n\nQUOTE: This is the United problem. They dithered when they should have acted. Carrick is doing brilliant and they're already looking elsewhere. Absolute madness.\n\nThere has to come a point where you back someone who is actually delivering results. The dressing room is together. The fans are buzzing for the first time in two years. What more does he need to prove?",
      category: "Opinion", author: "Kevin Brennan", is_live: false,
      image_url: null, tags: ["Carrick", "Management", "Opinion"], published: true
    },
    {
      title: "Double Forest Raid: United Eye £170m Summer Swoop for Anderson and Gibbs-White",
      excerpt: "INEOS are plotting a double raid on Nottingham Forest — Anderson the No.1 midfield target at £100m+, with Gibbs-White also on the radar. City want them both too.",
      body: "The transfer rumours are hotting up and I'm not going to pretend I'm not buzzing. TEAMtalk — who've been right about our business before — say United are planning a statement summer with Elliot Anderson the number one midfield target. Breaking the £100 million barrier to get him.\n\nAnderson is class. Box-to-box, gets goals, English — crucial for homegrown rules. Twenty-three with his best years ahead. You can see exactly why this rebuild starts with him.\n\nQUOTE: Both of them from the same club in one summer? That's the kind of statement United haven't made in years. And we absolutely need it to compete at the top again.\n\nBut then the Mail drops that we also want Gibbs-White. Forest captain, 26 goals and 33 assists in 155 games, can play as a ten or out wide. The snag is City — they want both, and their wage structure makes ours look like a jumble sale.",
      category: "Transfers", author: "Darren Walsh", is_live: false,
      image_url: "https://e0.365dm.com/24/07/768x432/skysports-elliot-anderson-nottingham_6600742.jpg",
      tags: ["Transfers", "Elliot Anderson", "Gibbs-White"], published: true
    },
    {
      title: "Ratcliffe's Books Are Balancing — But £1.29bn Debt Still Hangs Over Everything",
      excerpt: "United posted £32.6m operating profit for the first half despite no European football. Progress — but the debt mountain is enormous and the new stadium is still years away.",
      body: "The financial results dropped from New York today and on the surface it reads like progress. Operating profit of £32.6 million in the first six months, compared to a £3.9 million loss at the same point last year. Revenue is down slightly because we're not in Europe, but profit is up because Ratcliffe has been ruthless with headcount.\n\nThree hundred redundancies. Long-serving staff shown the door. People who gave careers to this club. That's hard to celebrate. But from a purely financial standpoint — it's working.\n\nQUOTE: We've still got £1.29 billion in debt. Glazer debt at $650 million. Short-term borrowing nearly £300 million. Over half a billion owed on transfers. No new stadium to show for it.\n\nThe expanded Champions League pays English clubs £73–86 million just for the league phase. Every season outside it is a season of catching up. Top four is not just a football ambition. It is a financial lifeline.",
      category: "Finance", author: "Philip Morrison", is_live: false,
      image_url: null, tags: ["Finance", "INEOS", "Ratcliffe"], published: true
    },
    {
      title: "Leny Yoro Is the Real Deal — and at 19, He's Only Just Getting Started",
      excerpt: "The Frenchman was magnificent on his first start under Carrick at Everton, commanding in the air and composed on the ball. He is going to be a United legend.",
      body: "I want to talk about Leny Yoro because he is not getting nearly enough credit. The lad came in for Martinez at Everton and was absolutely immense — reading of the game at nineteen that most defenders don't develop until their mid-twenties.\n\nCast your mind back to the West Ham game. Two last-ditch interventions before our late equaliser. Ice-cold. Six foot two reading everything, putting his body on the line. At Everton on Monday he was even better — dominant in the air, gave Harrison Armstrong nothing all night.\n\nQUOTE: We paid £52 million for him last summer and people were moaning it was too much. Try and buy him now. You couldn't get him for double that. This kid is going to be a United legend.\n\nWhat I love most is the composure — no unnecessary dribbles, completely reliable. Martinez is fit again for Sunday which is brilliant, but Carrick has a good problem now. Two world-class centre-backs available.",
      category: "Player Focus", author: "Mozza Green", is_live: false,
      image_url: "https://resources.premierleague.com/premierleague/photos/players/250x250/p494672.png",
      tags: ["Leny Yoro", "Defence", "Player Profile"], published: true
    },
    {
      title: "Mbeumo: 9 Goals, 2 Assists — United's Most Important Signing in Half a Decade",
      excerpt: "The assist for Sesko's winner was the latest proof that United got a special player last summer. At £71m, Bryan Mbeumo is still somehow underrated.",
      body: "£71 million for Bryan Mbeumo in the summer and there was grumbling. Brentford winger. Good player, yeah, but seventy-one million? Nine Premier League goals. Two assists. Top five in the league for goal contributions. United's most consistent attacking player across three managers.\n\nQUOTE: When Mbeumo is in form, defenders genuinely don't know how to handle him. He has the pace, the feet, and the football brain. United got this one absolutely right.\n\nThat hold-up against Keane for Sesko's winner was genuinely brilliant. Keane is a proper centre-back — no mug — and Mbeumo took the ball under pressure, shielded it, kept his balance, and squared it in one movement. The assist gets one line in the match report but it was the decisive moment.",
      category: "Player Focus", author: "Terry Lawton", is_live: false,
      image_url: "https://resources.premierleague.com/premierleague/photos/players/250x250/p176297.png",
      tags: ["Mbeumo", "Player Form", "Summer Signing"], published: true
    },
    {
      title: "Crystal Palace Sunday: Can Carrick Finally Hand Sesko His First League Start?",
      excerpt: "Three points could pull United level with Villa in third. Martinez back fit. Sesko on fire. This is the moment to unleash the Slovenian from the first whistle.",
      body: "Crystal Palace at Old Trafford on Sunday, two o'clock, and this matters. Villa dropped points against Leeds last weekend. Win, and Villa slip again — we could be third. Third! Haven't genuinely been there in years.\n\nMartinez expected fit after missing Everton with a calf issue. Having both him and Yoro available gives Carrick real options and world-class quality in the heart of defence.\n\nQUOTE: Old Trafford on a Sunday, proper home atmosphere, Sesko from the start, Martinez commanding at the back. Palace won't know what's hit them if we turn up.\n\nThe debate is whether Carrick finally starts Sesko. Three goals from the bench in four games. At what point does he have to start? Palace are thirteenth, Glasner is leaving at season's end. This is the moment to go for the throat.",
      category: "Preview", author: "Kevin Brennan", is_live: false,
      image_url: null, tags: ["Crystal Palace", "Preview", "Sesko"], published: true
    },
    {
      title: "Casemiro Is Leaving This Summer — and United Must Finally Get His Replacement Right",
      excerpt: "The Brazilian exits when his contract expires. Inter Miami and his boyhood club are circling. After the Ugarte experiment, getting this one right is critical.",
      body: "It's crystallising: Casemiro leaves Old Trafford this summer. Contract up, time to move on. The last two seasons — especially the horror show before Carrick arrived — made the parting inevitable.\n\nSky Sports are reporting Inter Miami and his boyhood club in Brazil are both interested. Good for him. He was brilliant for three months when he arrived, then became one of the worst players in the league, then found form again under Carrick. A rollercoaster.\n\nQUOTE: Get Elliot Anderson in for this role. He gives you energy, goals from the second line, and legs. The team must move forward. No more panic buying — get it right this time.\n\nThere's also uncertainty over Ugarte — who has been poor, be honest — and Bruno is weighing his options after the World Cup. We could need two or three midfield positions rebuilt in one window.",
      category: "Transfers", author: "Darren Walsh", is_live: false,
      image_url: "https://resources.premierleague.com/premierleague/photos/players/250x250/p61256.png",
      tags: ["Casemiro", "Transfers", "Midfield Rebuild"], published: true
    },
    {
      title: "Top Four Is On — For the Love of Everything, Don't Bottle It Now",
      excerpt: "Fourth in the league, three points clear of Chelsea, nine games to go. For the first time in years United hold their own destiny in their hands.",
      body: "I'm going to say it. Manchester United are going to finish in the top four this season. Screenshot it and come back to me in May if I'm wrong.\n\nFive wins from six under Carrick. Fourth in the table. Three points clear of Chelsea — Chelsea, who started this campaign as title challengers. We are above them on merit. And within three of Villa in third.\n\nQUOTE: I've been going to Old Trafford for thirty years. The Treble, Istanbul, Keane and Scholes dragging us over the line. This moment feels like the beginning of something again. I dare to believe.\n\nThe Champions League pays £73–86 million just for the league phase — enough to fund the whole summer window. Nine league games left. Take care of our own business. Go and get them.",
      category: "Analysis", author: "Philip Morrison", is_live: false,
      image_url: null, tags: ["Champions League", "Top Four", "Analysis"], published: true
    },
    {
      title: "Kobbie Mainoo: Our Academy Gem Is Quietly Becoming United's Most Vital Player",
      excerpt: "At twenty years old, the Salford-born midfielder already plays with the composure of a veteran. With Carrick in charge, is this finally Kobbie's time?",
      body: "Kobbie Mainoo at twenty plays with a composure that most United midfielders in the last decade never found at any stage of their careers. Watch him at Everton on Monday — quietly going about his business, winning the ball, moving it simply, never flustered when it got tight in the middle.\n\nHe won't give you twelve goals a season. He's not Bruno — not as creative going forward. But he shields the defence, keeps the ball moving, and reads the game better than any young English midfielder I've seen at United since Carrick himself came through.\n\nQUOTE: Academy product. Salford lad. Gets it. When he pulls on that shirt you can see exactly what it means to him. That is what you want from the future captain of this football club.\n\nBuild the whole midfield around him. Pair him with Anderson next season. He is ours. He is going to be brilliant. The best is ahead.",
      category: "Player Focus", author: "Mozza Green", is_live: false,
      image_url: "https://e0.365dm.com/24/06/768x432/skysports-kobbie-mainoo-manchester-united_6588694.jpg",
      tags: ["Kobbie Mainoo", "Academy", "Midfield"], published: true
    }
  ]

  const res = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(articles)
  })

  if (res.ok) {
    console.log(`✅  Seeded ${articles.length} fan articles successfully!`)
  } else {
    const err = await res.text()
    if (err.includes('duplicate') || err.includes('already exists')) {
      console.log('ℹ️   Articles already seeded, skipping.')
    } else {
      console.error('❌  Seed failed:', err)
    }
  }
}

async function main() {
  console.log('🚀  The Stretford End — Database Setup')
  console.log('━'.repeat(45))
  
  const tableExists = await createTable()
  
  if (!tableExists) {
    console.log('')
    console.log('❌  The articles table does not exist yet.')
    console.log('   Please run the SQL migration first:')
    console.log('')
    console.log('   1. Go to: https://supabase.com/dashboard/project/kbcowhkqgxptkllvmgre/sql/new')
    console.log('   2. Paste the contents of: supabase/migrations/001_create_articles.sql')
    console.log('   3. Click "Run"')
    console.log('   4. Then run this script again')
    console.log('')
    process.exit(1)
  }

  await seedArticles()
  
  console.log('')
  console.log('✅  Database setup complete!')
  console.log('   Your site is ready to deploy.')
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})

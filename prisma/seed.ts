import { PrismaClient, MatchStatus, MatchHalf } from '@prisma/client'

const prisma = new PrismaClient()

// NRL Teams with logos (using placeholder images)
const NRL_TEAMS = [
  { name: 'Brisbane Broncos', logo: 'https://via.placeholder.com/100/C8102E/FFFFFF?text=BRI' },
  { name: 'Canberra Raiders', logo: 'https://via.placeholder.com/100/8CC63F/FFFFFF?text=CAN' },
  { name: 'Canterbury Bulldogs', logo: 'https://via.placeholder.com/100/0066CC/FFFFFF?text=CBY' },
  { name: 'Cronulla Sharks', logo: 'https://via.placeholder.com/100/00A0E2/FFFFFF?text=CRO' },
  { name: 'Gold Coast Titans', logo: 'https://via.placeholder.com/100/FFD200/000000?text=GCT' },
  { name: 'Manly Sea Eagles', logo: 'https://via.placeholder.com/100/800020/FFFFFF?text=MAN' },
  { name: 'Melbourne Storm', logo: 'https://via.placeholder.com/100/311C67/FFFFFF?text=MEL' },
  { name: 'Newcastle Knights', logo: 'https://via.placeholder.com/100/CC0000/FFFFFF?text=NEW' },
  {
    name: 'North Queensland Cowboys',
    logo: 'https://via.placeholder.com/100/003087/FFFFFF?text=NQL',
  },
  { name: 'Parramatta Eels', logo: 'https://via.placeholder.com/100/FFD200/003087?text=PAR' },
  { name: 'Penrith Panthers', logo: 'https://via.placeholder.com/100/000000/FFD200?text=PEN' },
  {
    name: 'South Sydney Rabbitohs',
    logo: 'https://via.placeholder.com/100/00843D/CC0000?text=SOU',
  },
  {
    name: 'St George Illawarra Dragons',
    logo: 'https://via.placeholder.com/100/CC0000/FFFFFF?text=STI',
  },
  { name: 'Sydney Roosters', logo: 'https://via.placeholder.com/100/012A58/E4002B?text=SYD' },
  { name: 'Warriors', logo: 'https://via.placeholder.com/100/00539F/FFFFFF?text=WAR' },
  { name: 'Wests Tigers', logo: 'https://via.placeholder.com/100/FF6600/000000?text=WST' },
]

// NRL Venues
const VENUES = [
  'Suncorp Stadium',
  'GIO Stadium',
  'Accor Stadium',
  'PointsBet Stadium',
  'Cbus Super Stadium',
  '4 Pines Park',
  'AAMI Park',
  'McDonald Jones Stadium',
  'Queensland Country Bank Stadium',
  'CommBank Stadium',
  'BlueBet Stadium',
  'Accor Stadium',
  'WIN Stadium',
  'Allianz Stadium',
  'Go Media Stadium',
  'Leichhardt Oval',
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing matches
  await prisma.match.deleteMany({})
  console.log('✓ Cleared existing matches')

  const now = new Date()
  const matches = []

  // Create 2 LIVE matches (Round 1)
  matches.push(
    {
      round: 1,
      homeTeam: NRL_TEAMS[6].name, // Melbourne Storm
      awayTeam: NRL_TEAMS[0].name, // Brisbane Broncos
      homeTeamLogo: NRL_TEAMS[6].logo,
      awayTeamLogo: NRL_TEAMS[0].logo,
      homeScore: 18,
      awayScore: 14,
      status: MatchStatus.LIVE,
      half: MatchHalf.SECOND_HALF,
      currentMinute: 65,
      kickoffTime: new Date(now.getTime() - 65 * 60000), // Started 65 minutes ago
      lastScoreTime: new Date(now.getTime() - 5 * 60000), // Last score 5 minutes ago
      venue: VENUES[6], // AAMI Park
      season: 2025,
      competition: 'NRL Premiership',
    },
    {
      round: 1,
      homeTeam: NRL_TEAMS[13].name, // Sydney Roosters
      awayTeam: NRL_TEAMS[10].name, // Penrith Panthers
      homeTeamLogo: NRL_TEAMS[13].logo,
      awayTeamLogo: NRL_TEAMS[10].logo,
      homeScore: 12,
      awayScore: 16,
      status: MatchStatus.LIVE,
      half: MatchHalf.SECOND_HALF,
      currentMinute: 52,
      kickoffTime: new Date(now.getTime() - 52 * 60000), // Started 52 minutes ago
      lastScoreTime: new Date(now.getTime() - 8 * 60000), // Last score 8 minutes ago
      venue: VENUES[13], // Allianz Stadium
      season: 2025,
      competition: 'NRL Premiership',
    }
  )

  // Create 4 UPCOMING matches (Round 1 - later today and tomorrow)
  matches.push(
    {
      round: 1,
      homeTeam: NRL_TEAMS[11].name, // South Sydney Rabbitohs
      awayTeam: NRL_TEAMS[3].name, // Cronulla Sharks
      homeTeamLogo: NRL_TEAMS[11].logo,
      awayTeamLogo: NRL_TEAMS[3].logo,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.UPCOMING,
      kickoffTime: new Date(now.getTime() + 3 * 60 * 60000), // In 3 hours
      venue: VENUES[11], // Accor Stadium
      season: 2025,
      competition: 'NRL Premiership',
    },
    {
      round: 1,
      homeTeam: NRL_TEAMS[9].name, // Parramatta Eels
      awayTeam: NRL_TEAMS[2].name, // Canterbury Bulldogs
      homeTeamLogo: NRL_TEAMS[9].logo,
      awayTeamLogo: NRL_TEAMS[2].logo,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.UPCOMING,
      kickoffTime: new Date(now.getTime() + 5 * 60 * 60000), // In 5 hours
      venue: VENUES[9], // CommBank Stadium
      season: 2025,
      competition: 'NRL Premiership',
    },
    {
      round: 1,
      homeTeam: NRL_TEAMS[14].name, // Warriors
      awayTeam: NRL_TEAMS[4].name, // Gold Coast Titans
      homeTeamLogo: NRL_TEAMS[14].logo,
      awayTeamLogo: NRL_TEAMS[4].logo,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.UPCOMING,
      kickoffTime: new Date(now.getTime() + 24 * 60 * 60000), // Tomorrow
      venue: VENUES[14], // Go Media Stadium
      season: 2025,
      competition: 'NRL Premiership',
    },
    {
      round: 1,
      homeTeam: NRL_TEAMS[7].name, // Newcastle Knights
      awayTeam: NRL_TEAMS[5].name, // Manly Sea Eagles
      homeTeamLogo: NRL_TEAMS[7].logo,
      awayTeamLogo: NRL_TEAMS[5].logo,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.UPCOMING,
      kickoffTime: new Date(now.getTime() + 26 * 60 * 60000), // Tomorrow evening
      venue: VENUES[7], // McDonald Jones Stadium
      season: 2025,
      competition: 'NRL Premiership',
    }
  )

  // Create 3 COMPLETED matches (Round 1 - earlier this week)
  matches.push(
    {
      round: 1,
      homeTeam: NRL_TEAMS[1].name, // Canberra Raiders
      awayTeam: NRL_TEAMS[8].name, // North Queensland Cowboys
      homeTeamLogo: NRL_TEAMS[1].logo,
      awayTeamLogo: NRL_TEAMS[8].logo,
      homeScore: 24,
      awayScore: 20,
      status: MatchStatus.COMPLETED,
      half: MatchHalf.FULL_TIME,
      currentMinute: 80,
      kickoffTime: new Date(now.getTime() - 2 * 24 * 60 * 60000), // 2 days ago
      lastScoreTime: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 78 * 60000),
      venue: VENUES[1], // GIO Stadium
      season: 2025,
      competition: 'NRL Premiership',
    },
    {
      round: 1,
      homeTeam: NRL_TEAMS[15].name, // Wests Tigers
      awayTeam: NRL_TEAMS[12].name, // St George Illawarra Dragons
      homeTeamLogo: NRL_TEAMS[15].logo,
      awayTeamLogo: NRL_TEAMS[12].logo,
      homeScore: 16,
      awayScore: 22,
      status: MatchStatus.COMPLETED,
      half: MatchHalf.FULL_TIME,
      currentMinute: 80,
      kickoffTime: new Date(now.getTime() - 3 * 24 * 60 * 60000), // 3 days ago
      lastScoreTime: new Date(now.getTime() - 3 * 24 * 60 * 60000 + 76 * 60000),
      venue: VENUES[15], // Leichhardt Oval
      season: 2025,
      competition: 'NRL Premiership',
    },
    {
      round: 1,
      homeTeam: NRL_TEAMS[10].name, // Penrith Panthers
      awayTeam: NRL_TEAMS[0].name, // Brisbane Broncos
      homeTeamLogo: NRL_TEAMS[10].logo,
      awayTeamLogo: NRL_TEAMS[0].logo,
      homeScore: 28,
      awayScore: 12,
      status: MatchStatus.COMPLETED,
      half: MatchHalf.FULL_TIME,
      currentMinute: 80,
      kickoffTime: new Date(now.getTime() - 4 * 24 * 60 * 60000), // 4 days ago
      lastScoreTime: new Date(now.getTime() - 4 * 24 * 60 * 60000 + 77 * 60000),
      venue: VENUES[10], // BlueBet Stadium
      season: 2025,
      competition: 'NRL Premiership',
    }
  )

  // Insert all matches
  for (const match of matches) {
    await prisma.match.create({ data: match })
  }

  console.log(`✓ Created ${matches.length} matches:`)
  console.log(`  - 2 LIVE matches`)
  console.log(`  - 4 UPCOMING matches`)
  console.log(`  - 3 COMPLETED matches`)
  console.log('\n✅ Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

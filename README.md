# 🎮 LoL Jungle Coach Dashboard

**Professional League of Legends Jungle Coaching Dashboard** with live Riot API integration, advanced analytics, and AI-powered coaching insights.

## ✨ Features

### 🚀 **Live Data Integration**
- **Direct Riot API** connection with rate limiting and caching
- **Automated match scraping** for jungle games
- **Smart data sources**: Riot API primary, Notion fallback
- **Real-time updates** via webhooks

### 📊 **Advanced Analytics** 
- **Death Binary Protocol** tracking (≤5 deaths)
- **Jungle Efficiency** (CS/min optimization)
- **Objective Control** analysis
- **Vision Dominance** metrics
- **Early/Late Game Impact** scoring

### 🤖 **AI Coaching Insights**
- **Pattern Recognition** for performance issues
- **Champion Mastery** recommendations
- **Actionable Feedback** with priority levels
- **Performance Trends** analysis

### 🛠️ **Professional Infrastructure**
- **Rate Limiting** with riot-ratelimiter
- **Redis Caching** (with memory fallback)
- **Error Handling** and retry logic
- **Type Safety** with TypeScript

## 🏁 Demo

**Live Dashboard**: [https://lol-coaching-dashboard.vercel.app](https://lol-coaching-dashboard.vercel.app)

### Sample Analytics Output:
```json
{
  "kpis": {
    "winrate": "67.0%",
    "avgDeaths": "6.3",
    "protocolCompliance": "67.0%",
    "jungleEfficiency": "82.4%",
    "objectiveControl": "74.2%",
    "visionDominance": "68.1%"
  },
  "insights": [
    {
      "type": "success",
      "title": "Champion Strength Identified",
      "message": "Kindred: 100.0% WR in 1 games",
      "action": "Continue playing Kindred for consistency"
    }
  ]
}
```

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/minelearnai/lol-coaching-dashboard.git
cd lol-coaching-dashboard
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Configure your `.env.local`:
```env
# Required
RIOT_API_KEY=RGAPI-your-riot-api-key-here
NOTION_TOKEN=secret_your-notion-token
NOTION_GAMES_DB=your-notion-database-id

# Optional (for caching)
REDIS_URL=your-upstash-redis-url

# Optional (for webhooks)
WEBHOOK_SECRET=your-webhook-secret
```

### 3. Get API Keys

#### Riot API Key
1. Go to [Riot Developer Portal](https://developer.riotgames.com/)
2. Sign in with your Riot account
3. Create a new app and get your API key
4. Add to `.env.local` as `RIOT_API_KEY`

#### Notion Integration
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create new integration
3. Get your token and database IDs
4. Add to `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 API Endpoints

### Test Endpoints
```bash
# Health check
GET /api/test-riot?action=health

# Test account lookup
GET /api/test-riot?action=account

# Test match scraping
GET /api/test-riot?action=matches

# Test analytics
GET /api/test-riot?action=analytics
```

### Webhook Endpoints
```bash
# Manual refresh
GET /api/riot-webhook?action=refresh

# Webhook (with secret)
POST /api/riot-webhook
{
  "action": "match_completed",
  "matchId": "EUN1_1234567890",
  "puuid": "player-puuid"
}
```

## 🎨 Architecture

### Data Flow
```
┌─────────────┐
│  Riot API     │ → Rate Limiter → Cache → Analytics → Dashboard
└─────────────┘
       │
       v
┌─────────────┐
│ Notion API   │ ← Webhook ← Match Scraper
└─────────────┘
```

### Key Components

#### 🛠️ **RiotClient** (`lib/riot-api/client.ts`)
- Professional API client inspired by LeagueStats
- Rate limiting, caching, retry logic
- Regional endpoint handling

#### 🌲 **MatchScraper** (`lib/scraper/MatchScraper.ts`) 
- Intelligent jungle role detection
- Automatic match parsing
- Batch processing with delays

#### 📊 **JungleAnalytics** (`lib/analytics/JungleAnalytics.ts`)
- Advanced KPI calculations
- AI coaching insight generation
- Performance trend analysis

## 📈 KPI Calculations

### **Death Binary Protocol**
```typescript
protocolCompliance = (games with ≤5 deaths / total games) × 100
```

### **Jungle Efficiency**
```typescript
efficiency = (jungleCS / gameMinutes / 4.0) × 100 // Target: 4 CS/min
```

### **Vision Dominance**  
```typescript
vision = (visionScore / gameMinutes / 1.5) × 100 // Target: 1.5/min
```

### **Objective Control**
```typescript
objectives = Math.min(avgObjectiveDamage / 5000 × 100, 100)
```

## 🔧 Development

### Project Structure
```
lib/
├── riot-api/          # Riot API integration
│   ├── client.ts       # Main API client  
│   ├── config.ts       # Configuration
│   ├── cache.ts        # Redis caching
│   └── types.ts        # TypeScript types
├── scraper/           # Match scraping
│   └── MatchScraper.ts # Jungle match parser
├── analytics/         # Analytics engine
│   └── JungleAnalytics.ts # KPI calculations
└── notion-enhanced.ts # Smart data integration
```

### Testing
```bash
# Test full integration
curl "https://your-app.vercel.app/api/test-riot?action=analytics"

# Manual data refresh
curl "https://your-app.vercel.app/api/riot-webhook?action=refresh"
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```env
RIOT_API_KEY=RGAPI-your-production-key
NOTION_TOKEN=secret_production-token
NOTION_GAMES_DB=production-database-id
REDIS_URL=upstash-redis-production-url
WEBHOOK_SECRET=secure-production-secret
```

### Redis Setup (Optional)
1. Create [Upstash Redis](https://console.upstash.com/) database
2. Get connection URL
3. Add as `REDIS_URL` environment variable

## 🎆 Recent Updates

### v2.0 - Riot API Integration
- ✅ Direct Riot API connection with professional rate limiting
- ✅ Automated match scraping with intelligent jungle detection
- ✅ Advanced analytics engine with 8 professional KPIs
- ✅ AI coaching insights with priority-based recommendations
- ✅ Redis caching with memory fallback
- ✅ Webhook system for real-time updates
- ✅ Comprehensive error handling and retry logic
- ✅ Type-safe TypeScript implementation

### v1.0 - Notion Foundation  
- ✅ Notion API integration
- ✅ Basic KPI tracking (Winrate, Deaths, Protocol)
- ✅ Manual game entry system
- ✅ Live dashboard with real-time updates

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project for your own LoL coaching!

## 🚀 Roadmap

- [ ] **Timeline Analysis**: Game-by-game timeline data
- [ ] **Multi-Champion Builds**: Item build optimization
- [ ] **Team Composition Analysis**: Draft phase insights  
- [ ] **Live Game Integration**: Real-time match assistance
- [ ] **Multi-Player Support**: Coach multiple players
- [ ] **Advanced Visualizations**: Interactive charts and heatmaps

---

**Built with:** Next.js 15, TypeScript, Tailwind CSS, Riot API, Notion API, Redis

**Inspired by:** LeagueStats.gg professional architecture

**For:** Serious jungle players who want to climb with data-driven improvements
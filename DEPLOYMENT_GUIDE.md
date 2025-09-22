# 🚀 Deployment Guide - LoL Jungle Coach Dashboard

## 🎯 Quick Deploy to Vercel (5 minutes)

### 1. Prerequisites
- GitHub account with this repository
- Riot Games account 
- Notion account (optional for manual fallback)

### 2. Get Your Riot API Key
1. Go to [Riot Developer Portal](https://developer.riotgames.com/)
2. Sign in with your Riot account
3. Click **"Create App"**
4. Choose **"Personal API Key"** for testing
5. Copy your API key (starts with `RGAPI-`)

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Set Environment Variables:

```env
RIOT_API_KEY=RGAPI-your-key-here
NODE_ENV=production
```

5. Click **"Deploy"**
6. Wait 2-3 minutes for build to complete

### 4. Test Your Deployment
Visit your Vercel URL and add `/api/test-riot?action=health`:

```
https://your-app.vercel.app/api/test-riot?action=health
```

Should return:
```json
{
  "success": true,
  "results": {
    "apiHealthy": true,
    "hasApiKey": true
  }
}
```

## 🔧 Advanced Setup (Full Features)

### Redis Cache (Recommended)
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create new Redis database
3. Copy connection URL
4. Add to Vercel environment variables:
```env
REDIS_URL=rediss://default:password@host:port
```

### Notion Integration (Optional)
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create new integration
3. Get integration token
4. Create games database in Notion
5. Add to Vercel:
```env
NOTION_TOKEN=secret_your-token
NOTION_GAMES_DB=your-database-id
```

### Webhook Security (Optional)
```env
WEBHOOK_SECRET=your-secure-random-string
```

## 🧪 Testing Your Setup

### 1. Health Check
```bash
curl "https://your-app.vercel.app/api/test-riot?action=health"
```

### 2. Account Lookup
```bash
curl "https://your-app.vercel.app/api/test-riot?action=account"
```

### 3. Match Data
```bash
curl "https://your-app.vercel.app/api/test-riot?action=matches"
```

### 4. Full Analytics
```bash
curl "https://your-app.vercel.app/api/test-riot?action=analytics"
```

## 🔍 Troubleshooting

### ❌ "Invalid API Key" Error
- Verify your Riot API key is correct
- Check if key has expired (Personal keys expire every 24 hours)
- Ensure key starts with `RGAPI-`

### ❌ "Account Not Found" Error
- Update the gameName/tagLine in code to match your account
- Ensure you're on the correct region (EUNE for Feraxin)

### ❌ "No Matches Found" Error
- Play some ranked jungle games first
- Check if you're playing on the correct queue (Ranked Solo)
- Verify account has recent jungle games

### ❌ "Cache Connection Failed" Error
- Redis is optional - app works without it
- Check REDIS_URL format if using Upstash
- Falls back to memory cache automatically

## 🎮 Customization

### Change Target Player
Edit `lib/scraper/MatchScraper.ts`:
```typescript
// Change this function
export async function createFeraxinScraper(): Promise<MatchScraper | null> {
  const account = await riotClient.getAccountByRiotId('YourGameName', 'YourTag');
  // ...
}
```

### Change Region
Edit `lib/riot-api/config.ts`:
```typescript
export const RIOT_CONFIG: RiotConfig = {
  apiKey: process.env.RIOT_API_KEY || '',
  region: 'na1', // Change to your region
  // ...
};
```

### Adjust KPI Targets
Edit `lib/analytics/JungleAnalytics.ts`:
```typescript
// Change target values
private calculateJungleEfficiency(games: JungleGameData[]): number {
  return Math.min(csPerMin / 4, 1); // Change 4 to your target CS/min
}
```

## 📊 Monitoring

### Vercel Analytics
- Go to your Vercel dashboard
- Click on your project
- View "Functions" tab for API endpoint performance
- Check "Analytics" for traffic patterns

### Error Tracking
- Check Vercel function logs for errors
- Monitor API usage to avoid rate limits
- Set up alerts for failed deployments

### Performance
- Dashboard loads in <2s with cache
- API requests: 100-500ms typical
- Rate limit: 100 requests/2 minutes (personal key)
- Cache hit rate: 80%+ with Redis

## 🔄 Updates

### Automatic Updates
- Push to GitHub master branch
- Vercel auto-deploys in 1-2 minutes
- Zero downtime deployments

### Manual Updates
```bash
# Local development
git pull origin master
npm run dev

# Test locally
curl "http://localhost:3000/api/test-riot?action=health"

# Deploy
git push origin master
```

### API Key Rotation
1. Get new API key from Riot Developer Portal
2. Update in Vercel environment variables
3. Redeploy (automatic)

## 🏆 Production Checklist

- [ ] Riot API key configured
- [ ] Health check passes
- [ ] Account lookup works
- [ ] Match scraping functional
- [ ] Analytics generating insights
- [ ] Redis cache connected (optional)
- [ ] Notion integration working (optional)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring setup

## 🎯 Next Steps

1. **Play jungle games** - Dashboard needs data!
2. **Bookmark your dashboard** - Check daily for insights
3. **Set up automated refresh** - Use webhook for real-time updates
4. **Share with friends** - Other junglers can benefit too
5. **Contribute improvements** - Open source project!

## 🆘 Support

### Common Issues
- **Rate limiting**: Wait 2 minutes between tests
- **Old data**: Use manual refresh endpoint
- **Missing games**: Ensure playing ranked jungle
- **Performance**: Enable Redis cache

### Getting Help
1. Check GitHub Issues
2. Create new issue with error details
3. Include test endpoint results
4. Provide Vercel function logs

---

**Deployment Time**: 5 minutes (basic) / 15 minutes (full setup)  
**Maintenance**: Minimal - mostly API key rotation  
**Cost**: Free tier sufficient for personal use  

🚀 **Ready to climb with data!**
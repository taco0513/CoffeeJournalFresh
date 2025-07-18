# Data Architecture - Dual Purpose System

## Overview
The Coffee Journal app uses a hybrid data architecture that combines local-first privacy with community-driven insights.

## 1. User's Phone (Primary Storage)
- **All personal tasting data stored locally**
- **Private, offline-first**
- **User owns their data**
- Uses AsyncStorage for persistence
- Works without internet connection
- No account required

## 2. Backend DB Server (Supabase) - Community Features

### Analytics & Insights (for developers)
- Anonymous usage patterns
- Feature adoption metrics
- App improvement insights

### Community Coffee Database
- **Crowd-sourced coffee catalog**
- **Shared tasting experiences**
- **Collective learning platform**

## Community Features

### "What Others Tasted"
See how others rated the same coffee you're tasting

### Flavor Consensus
Most common flavors detected by the community for each coffee

### Average Scores
- Community average sensory scores
- Your scores vs community average
- Distribution of ratings

### Tasting Trends
- Popular coffees by season
- Trending roasteries
- Regional preferences

## Example User Journey

```
User tastes "Ethiopia Yirgacheffe from Blue Bottle"
→ App shows: "87 others have tasted this coffee"
→ Community average: 4.2/5 body, 4.5/5 acidity
→ Top flavors: Blueberry (65%), Lemon (52%), Floral (48%)
→ Your match score: 85% vs Community average: 78%
```

## Crowd-Sourced Coffee Database

### Adding New Coffee
1. User searches for coffee
2. If not found, user can add:
   - Coffee name
   - Roastery
   - Origin, variety, process
   - Official roaster notes
3. Data saved to Supabase
4. Available for all future users

### Benefits
- **Growing database** - Enriched with every new entry
- **Less manual entry** - Pre-filled data for known coffees
- **Verified information** - Community validates accuracy
- **Global discovery** - Find coffees worldwide

## Privacy & Data Flow

### What stays local (private):
- Your personal tasting sessions
- Your flavor selections
- Your sensory scores
- Your notes and preferences

### What gets shared (anonymous):
- Coffee was tasted (for count)
- Flavor selections (for consensus)
- Sensory scores (for averages)
- Match scores (for community comparison)

### User Control
- Can use app completely offline
- Can opt-out of community features
- Can export/delete all local data
- No personal identification required

## Technical Implementation

### Local Storage (AsyncStorage)
```typescript
// Personal tasting data
{
  id: "local-123",
  coffeeName: "Ethiopia Yirgacheffe",
  personalNotes: "My private thoughts",
  // ... all personal data
}
```

### Community Database (Supabase)
```typescript
// Shared coffee information
{
  coffeeId: "coffee-456",
  name: "Ethiopia Yirgacheffe",
  roastery: "Blue Bottle",
  roasterNotes: "Blueberry, lemon, floral",
  // Aggregated community data
  totalTastings: 87,
  avgBody: 4.2,
  avgAcidity: 4.5,
  topFlavors: [
    { flavor: "Blueberry", percentage: 65 },
    { flavor: "Lemon", percentage: 52 }
  ]
}
```

## Benefits of This Architecture

### For Users
- **Privacy first** - Own your data
- **Work offline** - No internet required
- **Learn from others** - Community insights
- **Contribute knowledge** - Help others discover

### For Community
- **Collective intelligence** - Learn together
- **Coffee discovery** - Find new coffees
- **Palate development** - Compare with others
- **Quality validation** - Consensus on coffee quality

### For Developers
- **Understand usage** - Improve the app
- **Feature priorities** - What users need
- **Coffee trends** - Industry insights
- **Quality metrics** - App performance

## Future Possibilities
- Coffee recommendations based on preferences
- Roastery ratings and reviews
- Seasonal coffee tracking
- Regional taste preferences
- Coffee journey mapping
- Palate development tracking

This architecture creates a unique value proposition: **Personal privacy with community wisdom**.
# Coffee Journal Fresh - Design Guidelines (MVP Beta)

## Design Philosophy for MVP Beta

### Core Principles
- **Professional & Clean**: Minimize visual clutter for a premium coffee app experience
- **Focus on Content**: Let coffee data and user content be the star
- **Consistent Experience**: Standardized visual elements across all screens
- **Accessibility First**: Clear, readable interface for all users

## Icon & Emoji Usage Guidelines

### CURRENT STATUS: ALL ICONS REMOVED (2025-07-26)

#### Navigation & Core Features
- **Tab Bar**: Text labels only (홈, 기록, +, 프로필, 설정)
- **Headers**: Text-based navigation ("뒤로" instead of arrow icons)
- **Status Indicators**: Text or Unicode symbols (↑↓ for trends)

#### Functional Context
- **Achievement Badges**: No icons, text-only labels
- **Coffee Ratings**: Numeric ratings only
- **Loading States**: Native spinners without decorative icons

### PROHIBITED Icons/Emojis

#### Decorative Usage
- Random emojis in buttons, headers, or labels
- Multiple emojis in single UI elements
- Emoji-heavy section headers
- Decorative icons without functional purpose

#### Over-Categorization
- Category icons for every feature
- Emoji bullets in lists
- Icon-heavy developer/admin interfaces
- Excessive visual hierarchy markers

### Specific Rules

#### Replace With Text
- **Statistics Cards**: Remove emoji icons, use clean typography
- **Settings Sections**: Use clear text labels instead of emoji categories
- **Action Buttons**: Focus on clear text, not decorative icons
- **Admin Interface**: Professional text-based navigation

#### Keep Minimal
- **Maximum 1 emoji** per UI component
- **Functional purpose required** for any icon usage
- **No emoji in production error messages**
- **No decorative emoji in data displays**

## Implementation Guidelines

### Button Design
```
❌ ☕ 커피 기록하기 → 새로운 커피를 테이스팅해보세요
✅ 커피 기록하기 → 새로운 커피를 테이스팅해보세요
```

### Statistics Cards
```
❌ ☕ 152 총 커피
✅ 152 총 커피
```

### Navigation
```
❌ 🏆 가장 많이 마신 로스터리
✅ 가장 많이 마신 로스터리
```

### Settings/Admin
```
❌ 🐛 Debug Settings (count: 3)
✅ Debug Settings (3 active)
```

## Before/After Examples

### Statistics Section
**Before**: 🏆 가장 많이 마신 로스터리, ☕ 가장 많이 마신 커피, 🏠 자주 방문한 카페
**After**: 가장 많이 마신 로스터리, 자주 방문한 카페 (clean typography focus)

### Home Screen
**Before**: Multiple emoji icons in stats cards
**After**: Clean numerical display with no icons

### Developer Interface
**Before**: Icon-heavy category system with emoji bullets
**After**: Professional text-based organization

### Tab Bar Navigation
**Before**: 🏠 📝 ➕ 🏆 ⚙️ icons
**After**: 홈, 기록, +, 프로필, 설정 text labels

## Typography Focus

### Hierarchy Through Typography
- **Font weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Font sizes**: Clear scale from 12px (captions) to 28px (hero numbers)
- **Color contrast**: Proper text contrast ratios
- **Spacing**: Consistent margins and padding

### Content-First Design
- Let coffee names, roastery names, and tasting notes shine
- Use whitespace effectively
- Consistent card layouts
- Professional data presentation

## MVP Beta Goals

1. **Professional Appearance**: Suitable for coffee industry professionals
2. **User Focus**: Highlight user's coffee journey and data
3. **Clean Interface**: Remove visual distractions
4. **Scalable Design**: Consistent patterns for future features

## Implementation Checklist

- [x] Remove decorative emojis from statistics displays
- [x] Clean up developer/admin interface icons
- [x] Standardize button text without emoji decoration
- [x] Remove all tab bar icons and use text labels
- [x] Replace header icons with text navigation
- [ ] Focus on typography hierarchy
- [ ] Ensure consistent spacing and alignment
- [ ] Test accessibility with screen readers
- [ ] Validate professional appearance with stakeholders

---

*Last Updated: 2025-07-26*
*Version: MVP Beta v1.1*
*Major Change: Complete removal of all icons and emojis*
# CupNote + Tamagui Migration Plan

## Phase 1: Setup & Configuration (Day 1)

### 1. Install Tamagui
```bash
# Core packages
npm install @tamagui/core @tamagui/static @tamagui/animations-react-native

# Config and build tools
npm install @tamagui/babel-plugin babel-plugin-transform-inline-environment-variables

# Optional but recommended
npm install @tamagui/shorthands @tamagui/themes
```

### 2. Configure Babel
```javascript
// babel.config.js
module.exports = {
  plugins: [
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './tamagui.config.ts',
        logTimings: true,
        disableExtraction: process.env.NODE_ENV === 'development',
      },
    ],
  ],
};
```

### 3. Create Tamagui Config
```typescript
// tamagui.config.ts
import { createTamagui } from '@tamagui/core'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'
import { createInterFont } from '@tamagui/font-inter'

// CupNote specific tokens
const cupNoteTokens = {
  ...tokens,
  color: {
    ...tokens.color,
    // Coffee-themed colors
    espresso: '#3E2723',
    latte: '#D7CCC8',
    foam: '#EFEBE9',
    bean: '#6F4E37',
    cupBlue: '#2196F3',
    cupBlueLight: '#E3F2FD',
  },
  space: {
    ...tokens.space,
    // Your existing spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}

const config = createTamagui({
  tokens: cupNoteTokens,
  themes: {
    light: {
      ...themes.light,
      primary: cupNoteTokens.color.cupBlue,
      background: tokens.color.gray1,
    },
    dark: {
      ...themes.dark,
      primary: cupNoteTokens.color.cupBlue,
    },
  },
  shorthands,
  fonts: {
    heading: createInterFont(),
    body: createInterFont(),
  },
})

export default config
```

## Phase 2: Component Migration (Days 2-3)

### Before (Current React Native)
```typescript
// HomeCafeScreen.tsx - Current
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
```

### After (Tamagui)
```typescript
// HomeCafeScreen.tsx - With Tamagui
import { YStack, H1, Button, Card, Text } from 'tamagui'

export function HomeCafeScreen() {
  return (
    <YStack f={1} bg="$background" space="$4">
      <YStack px="$4" py="$4">
        <H1 size="$7" color="$color">홈카페 정보</H1>
        <Text size="$3" color="$gray10">
          5개 필드로 빠르게 기록해보세요
        </Text>
      </YStack>

      <Card elevate size="$4" mx="$4">
        <Card.Header>
          <H2>드리퍼 선택</H2>
        </Card.Header>
        <XStack space="$2" flexWrap="wrap">
          {drippers.map(dripper => (
            <Button
              key={dripper.id}
              size="$3"
              variant="outlined"
              onPress={() => setDripper(dripper)}
            >
              {dripper.name}
            </Button>
          ))}
        </XStack>
      </Card>
    </YStack>
  )
}
```

## Phase 3: Create CupNote Component Library (Days 4-5)

### 1. Recipe Card Component
```typescript
// components/RecipeCard.tsx
import { Card, H3, Text, XStack, YStack, Button } from 'tamagui'

export const RecipeCard = ({ recipe, onSelect, isSelected }) => (
  <Card
    elevate={isSelected}
    pressStyle={{ scale: 0.97 }}
    animation="quick"
    onPress={onSelect}
    borderWidth={isSelected ? 2 : 1}
    borderColor={isSelected ? '$primary' : '$borderColor'}
  >
    <Card.Header padded>
      <H3 size="$5">{recipe.name}</H3>
      <XStack space="$2" alignItems="center">
        <Text theme="alt2">☕ {recipe.coffee}g</Text>
        <Text theme="alt2">💧 {recipe.water}ml</Text>
      </XStack>
    </Card.Header>
  </Card>
)
```

### 2. Sensory Expression Button
```typescript
// components/SensoryButton.tsx
import { Button, styled } from 'tamagui'

export const SensoryButton = styled(Button, {
  name: 'SensoryButton',
  
  variants: {
    category: {
      acidity: {
        backgroundColor: '$orange3',
        pressStyle: { backgroundColor: '$orange5' },
      },
      sweetness: {
        backgroundColor: '$pink3',
        pressStyle: { backgroundColor: '$pink5' },
      },
      body: {
        backgroundColor: '$purple3',
        pressStyle: { backgroundColor: '$purple5' },
      },
    },
    
    selected: {
      true: {
        backgroundColor: '$primary',
        borderWidth: 2,
        borderColor: '$primary',
      },
    },
  },
})
```

## Phase 4: Performance Optimizations (Day 6)

### 1. Static Extraction
```typescript
// Next.js or Metro config
const { withTamagui } = require('@tamagui/next-plugin')

module.exports = withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
})
```

### 2. Animation Performance
```typescript
// Use native driver animations
import { createAnimations } from '@tamagui/animations-react-native'

const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
})
```

## Migration Checklist

### Week 1
- [ ] Install and configure Tamagui
- [ ] Create tamagui.config.ts with CupNote tokens
- [ ] Migrate Header component
- [ ] Migrate Button components
- [ ] Migrate Card components

### Week 2
- [ ] Convert HomeCafeScreen to Tamagui
- [ ] Convert PersonalCommentScreen
- [ ] Create SensoryExpression components
- [ ] Migrate form inputs

### Week 3
- [ ] Performance testing
- [ ] Theme switching implementation
- [ ] Accessibility audit
- [ ] Documentation

## Expected Benefits

### Performance Improvements
- **50% reduction** in bundle size for styles
- **Zero runtime** style calculation overhead
- **Native animations** with better frame rates
- **Automatic code splitting** for components

### Developer Experience
- **TypeScript autocomplete** for all style props
- **Variant system** reduces component variations
- **Responsive props** without media queries
- **Hot reload** works with styles

### Code Quality
```typescript
// Before: 736 lines
HomeCafeSimpleForm.tsx

// After: ~300 lines
HomeCafeSimpleForm.tsx (logic only)
├── RecipeSection.tsx (100 lines)
├── TimerSection.tsx (80 lines)
└── DripperSection.tsx (60 lines)
```

## Comparison with Your Current Design System

| Feature | Current Design System | Tamagui |
|---------|---------------------|---------|
| Setup Time | ✅ 1 day | 2-3 days |
| Learning Curve | ✅ Low | Medium |
| Performance | Good | ✅ Excellent |
| Component Library | Build yourself | ✅ Pre-built options |
| Theme System | Basic | ✅ Advanced |
| Web Support | No | ✅ Yes |
| Community | Small | ✅ Growing fast |

## Decision Framework

### Use Tamagui if:
- Performance is critical (it is for you)
- You want SwiftUI-like DX
- Future web support matters
- You're willing to invest 1 week in migration

### Stick with Current Design System if:
- You need to ship in <1 week
- Team is resistant to new tools
- You're happy with current performance

## My Recommendation

Given your performance concerns and SwiftUI interest, I recommend:

1. **Continue current design system work** (this week)
2. **Prototype one screen with Tamagui** (next week)
3. **Compare performance metrics**
4. **Make informed decision**

The beauty is that Tamagui can wrap your existing components, so migration can be gradual!
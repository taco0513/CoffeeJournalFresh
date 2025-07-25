# Tamagui Style System Unification Guide

## Overview

This guide provides a comprehensive approach to unifying the style system after the Tamagui migration. It maps legacy HIGColors and constants to Tamagui design tokens for consistency across the codebase.

## 🎨 Design Token Mapping

### Color Tokens

| Legacy (HIGColors) | Tamagui Token | Usage |
|-------------------|---------------|--------|
| `HIGColors.blue` / `#007AFF` | `$cupBlue` | Primary actions, links |
| `HIGColors.systemGreen` / `#34C759` | `$green9` | Success states |
| `HIGColors.systemRed` / `#FF3B30` | `$red9` | Error states, destructive actions |
| `HIGColors.systemOrange` / `#FF9500` | `$orange9` | Warnings, acidity |
| `HIGColors.systemBrown` / `#8B4513` | `$cupBrown` | Coffee theme |
| `HIGColors.label` | `$color` | Primary text |
| `HIGColors.secondaryLabel` | `$gray11` | Secondary text |
| `HIGColors.systemBackground` | `$background` | Main background |
| `HIGColors.separator` | `$borderColor` | Borders, dividers |

### Spacing Tokens

| Legacy (HIGConstants) | Tamagui Token | Value |
|---------------------|---------------|-------|
| `SPACING_XS` | `$xs` | 4px |
| `SPACING_SM` | `$sm` | 8px |
| `SPACING_MD` | `$md` | 16px |
| `SPACING_LG` | `$lg` | 24px |
| `SPACING_XL` | `$xl` | 32px |

### Typography Tokens

| Legacy | Tamagui Token | Size |
|--------|---------------|------|
| `FONT_SIZE_H1` | `$7` | 32px |
| `FONT_SIZE_H2` | `$6` | 28px |
| `FONT_SIZE_H3` | `$5` | 24px |
| `FONT_SIZE_TITLE` | `$4` | 20px |
| `FONT_SIZE_BODY` | `$3` | 18px |
| `FONT_SIZE_CAPTION` | `$2` | 16px |

### Border Radius Tokens

| Legacy | Tamagui Token | Value |
|--------|---------------|-------|
| `BORDER_RADIUS` | `$2` | 8px |
| `BORDER_RADIUS_LARGE` | `$3` | 12px |
| `BORDER_RADIUS_LG` | `$4` | 16px |
| `BORDER_RADIUS_SM` | `$1` | 4px |

## 🔄 Migration Steps

### Step 1: Update Imports

Replace legacy style imports with Tamagui tokens:

```typescript
// Before
import { HIGColors, HIGConstants } from '../styles/common';

// After
// No import needed - tokens are available globally in styled components
```

### Step 2: Update Color References

```typescript
// Before
backgroundColor: HIGColors.systemBlue
color: HIGColors.label

// After
backgroundColor: '$cupBlue'
color: '$color'
```

### Step 3: Update Spacing

```typescript
// Before
padding: HIGConstants.SPACING_MD
marginBottom: HIGConstants.SPACING_LG

// After
padding: '$md'
marginBottom: '$lg'
```

### Step 4: Update Typography

```typescript
// Before
fontSize: HIGConstants.FONT_SIZE_TITLE
fontWeight: '600'

// After
fontSize: '$4'
fontWeight: '600'
```

## 📦 Component Patterns

### Container Pattern

```typescript
const Container = styled(View, {
  name: 'Container',
  flex: 1,
  backgroundColor: '$background',
  padding: '$lg',
});
```

### Card Pattern

```typescript
const Card = styled(View, {
  name: 'Card',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$3',
  padding: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',
  animation: 'lazy',
  enterStyle: {
    opacity: 0,
    y: 20,
  },
});
```

### Button Pattern

```typescript
const PrimaryButton = styled(Button, {
  name: 'PrimaryButton',
  backgroundColor: '$cupBlue',
  borderRadius: '$2',
  paddingHorizontal: '$lg',
  paddingVertical: '$md',
  animation: 'quick',
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$cupBlueDark',
  },
});
```

### Text Pattern

```typescript
const Title = styled(Text, {
  name: 'Title',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
});

const BodyText = styled(Text, {
  name: 'BodyText',
  fontSize: '$3',
  color: '$color',
  lineHeight: '$3',
});
```

## 🎭 Animation Patterns

### Three Animation Presets

1. **quick** - Immediate feedback (buttons, toggles)
```typescript
animation: 'quick'
```

2. **lazy** - Content appearance (cards, sections)
```typescript
animation: 'lazy'
enterStyle: { opacity: 0, y: 20 }
```

3. **bouncy** - Playful interactions (achievements)
```typescript
animation: 'bouncy'
enterStyle: { scale: 0.9 }
```

## 🛠 Tools & Utilities

### Migration Helper Function

Use the provided helper in `src/styles/tamagui-unified-tokens.ts`:

```typescript
import { migrateStyleValue } from '../styles/tamagui-unified-tokens';

// Automatically converts legacy values to Tamagui tokens
const newValue = migrateStyleValue('HIGColors.blue'); // Returns: '$cupBlue'
```

### Token Reference

Access the complete token reference:

```typescript
import { unifiedTokens, componentGuidelines } from '../styles/tamagui-unified-tokens';
```

## 📋 Checklist for Legacy Cleanup

- [ ] Remove imports of `HIGColors` and `HIGConstants`
- [ ] Replace all color references with Tamagui tokens
- [ ] Update spacing values to use token scale
- [ ] Convert font sizes to token system
- [ ] Replace border radius values
- [ ] Remove `StyleSheet.create()` usage
- [ ] Convert to styled components pattern
- [ ] Add proper TypeScript types with `GetProps`
- [ ] Implement consistent animations
- [ ] Test theme switching (if applicable)

## 🚀 Benefits of Unified System

1. **Consistency**: Single source of truth for all design tokens
2. **Theme Support**: Easy to implement dark mode
3. **Performance**: Optimized token resolution
4. **Developer Experience**: IntelliSense for all tokens
5. **Maintainability**: Centralized design system updates

## 📝 Common Patterns to Replace

### Shadow Styles

```typescript
// Before
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,

// After (in styled component)
shadowColor: '$shadowColor',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 3,
```

### Conditional Styles

```typescript
// Before
style={[styles.button, active && styles.buttonActive]}

// After
<StyledButton active={isActive} />

// With variants
const StyledButton = styled(Button, {
  variants: {
    active: {
      true: { backgroundColor: '$cupBlue' },
      false: { backgroundColor: 'transparent' },
    },
  },
});
```

## 🎯 Next Steps

1. **Phase 1**: Update critical screens to use unified tokens
2. **Phase 2**: Remove legacy style files
3. **Phase 3**: Implement theme switching
4. **Phase 4**: Document component library

The unified style system is now ready for implementation across the CupNote app!
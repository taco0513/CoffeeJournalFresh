# Coffee Journal - Beta Color System Guide

## Design Philosophy
For beta testing, the app uses a **monochrome color system** with:
- Black and white primary colors
- Gray scale for secondary elements
- Preserved status colors for important UI feedback (green for success, red for errors, orange for warnings)

## Future Development
- Full color system will be implemented post-beta
- Current monochrome design ensures clean, accessible UI for testing

## Color Palette

### Primary Colors
- **Pure Black (#000000)**: Primary actions, main text, active states
- **Pure White (#FFFFFF)**: Backgrounds, inverted text

### Grayscale
- **Gray 60% (#666666)**: Secondary text, inactive elements
- **Gray 40% (#999999)**: Tertiary text, placeholders, disabled states
- **Gray 20% (#CCCCCC)**: Quaternary labels, very light text
- **Gray 12% (#E0E0E0)**: Borders, dividers
- **Gray 6% (#F0F0F0)**: Tag backgrounds, subtle fills
- **Gray 3% (#F8F8F8)**: Secondary backgrounds
- **Gray 2% (#FAFAFA)**: Primary background tint

### Status Colors (Preserved)
- **Success Green (#2E7D32)**: Success states, confirmations
- **Error Red (#D32F2F)**: Errors, destructive actions
- **Warning Orange (#F57C00)**: Warnings, important alerts

## Usage Guidelines

### Text Hierarchy
1. **Primary Text**: #000000 (Pure black)
2. **Secondary Text**: #666666 (60% black)
3. **Tertiary Text**: #999999 (40% black)
4. **Disabled Text**: #999999 (40% black)

### Backgrounds
1. **Primary Background**: #FFFFFF (Pure white)
2. **Secondary Background**: #F8F8F8 (3% black)
3. **Tag/Card Background**: #F0F0F0 (6% black)

### Interactive Elements
1. **Primary Button**: Black background (#000000) with white text
2. **Secondary Button**: Light gray (#F0F0F0) with gray border (#E0E0E0)
3. **Outline Button**: Transparent with black border
4. **Disabled Button**: Light gray (#CCCCCC)

### Status States
- **Success Actions**: Use green (#2E7D32) sparingly
- **Error/Delete Actions**: Use red (#D32F2F) for warnings only
- **Warning States**: Use orange (#F57C00) for important alerts

### Navigation
- **Active Tab**: #000000 (Black)
- **Inactive Tab**: #999999 (40% black)
- **Headers**: Black background with white text

## Implementation Notes

1. The blue color (#007AFF) has been replaced with black (#000000) for all primary actions
2. Brown colors have been replaced with dark gray (#333333)
3. All decorative colors (purple, pink, yellow) have been replaced with black
4. Status colors (green, red, orange) are preserved for important UI feedback
5. The color system maintains high contrast for accessibility

## Color Mode Toggle

### Implementation
- Color mode can be toggled in Profile screen
- Uses `toggleColorMode()` function from `common.ts`
- Default mode: Monochrome (B&W)
- State persists during app session

### Usage in Code
```typescript
import { HIGColors, toggleColorMode, getColorMode } from '../styles/common';

// Get current mode
const currentMode = getColorMode(); // 'color' or 'monochrome'

// Toggle mode
toggleColorMode();

// Colors automatically update based on mode
const primaryColor = HIGColors.blue; // #007AFF in color mode, #000000 in monochrome
```

## Migration Notes

- [x] Dynamic color system implemented
- [x] Original colors preserved
- [x] Color mode toggle in Profile screen
- [x] Navigation colors responsive to mode
- [x] Tab bar colors responsive to mode
- [ ] Add persistence with AsyncStorage
- [ ] Add smooth transition animation
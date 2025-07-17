# 🤖 Coffee Tasting Journal - AI Prompts Library (HIG Edition)

> **Reusable prompts for 1-person AI development** | Optimized for Windsurf + Claude Code
> **Now with Apple HIG compliance built-in!** 🍎

---

## 🎨 Windsurf Cascade Prompts (HIG Compliant)

### 🏗️ Screen Creation Template (HIG Version)
```
Create [ScreenName] screen for React Native iOS app:

Tech requirements:
- TypeScript
- React Native CLI (no Expo)
- Zustand for state management
- Realm for local storage

HIG requirements:
- Minimum touch targets: 44×44pt
- Minimum text size: 11pt with Dynamic Type support
- Color contrast: 4.5:1 minimum
- Use iOS native system fonts (no fontFamily needed)
- Standard iOS navigation patterns (UITabBar + UINavigationBar)
- Immediate feedback: visual + haptic for all actions
- Animations: max 0.4s with spring effects

UI requirements:
- Follow iOS design patterns
- Use system colors and semantic colors
- Consistent spacing: 8pt grid
- Safe area insets respected
- Support dark mode preparation

Functionality:
[Specific features for this screen]

Navigation:
- Tab bar position: [which tab]
- Navigation stack: Previous [PrevScreen] → Current → Next [NextScreen]
- Progress indicator: [X/6] in navigation bar

Accessibility:
- VoiceOver labels for all interactive elements
- Reduce Motion alternative behaviors
- Color-blind safe design
```

### 📱 Screen-Specific Prompts (HIG Enhanced)

#### HomeScreen (HIG Version)
```
Create HomeScreen with HIG compliance:

Navigation:
- Tab bar: "홈" tab (first position)
- Navigation bar title: "Coffee Journal" (시스템 폰트 17pt Bold)

Layout:
- Large title: "오늘의 커피는?" (시스템 폰트 28pt, fontWeight: '700')
- Primary CTA button:
  - Text: "새 테이스팅 시작"
  - Height: 50pt, corner radius: 25pt
  - System tint color fill
  - Haptic feedback on tap
- Recent tastings list:
  - Cell height: minimum 60pt
  - Leading/trailing padding: 20pt
  - Swipe actions for delete
  - Separator insets matching system

Empty state:
- If no records: "첫 테이스팅을 시작해보세요!"
- Include illustration placeholder

Animations:
- List appear: staggered fade-in (0.3s total)
- Button press: scale 0.95 with spring
```

#### CoffeeInfoScreen (HIG Version)
```
Create CoffeeInfoScreen with HIG standards:

Navigation:
- Back button: system chevron.left
- Title: "커피 정보"
- Progress: "2/6" in nav bar
- Progress bar: 4pt height below nav

Form elements:
- Text fields:
  - Height: 44pt minimum
  - Left padding: 16pt
  - Clear button: system xmark.circle.fill
  - Placeholder color: systemGray
- Dropdowns:
  - Use system chevron.down icon
  - Native picker presentation

Smart features:
- Location banner:
  - "📍 현재 위치: [카페명]" 
  - Background: systemGray6
  - Height: 36pt
- OCR button:
  - Icon: camera.fill
  - Text: "패키지 촬영하기"
  - Secondary style button

Permissions:
- Camera: request only when OCR button tapped
- Location: request on screen appear (if not granted)

Next button:
- Disabled state: systemGray3 background
- Enabled: system tint color
- Show activity indicator while validating
```

#### FlavorSelectionScreen (HIG Grid)
```
Create Flavor Level screens with HIG multi-select:

Grid layout:
- Item size: 60×60pt minimum (content 44×44pt)
- Spacing: 12pt between items
- Section spacing: 24pt
- Columns: 3 on iPhone, 4 on iPad

Selection states:
- Unselected: systemBackground + systemGray4 border (1pt)
- Selected: tintColor background + white checkmark.circle.fill
- Haptic: selection (light impact)

Visual feedback:
- Selection animation: spring (0.2s)
- Checkmark fade-in: 0.15s
- Touch down: scale 0.95

Counter:
- "선택: N개" below grid
- Update with number animation

Skip button (if allowed):
- Top right position
- Touch area: 44×44pt
- Text color: systemBlue
```

### 🧩 Component Creation (HIG Components)

#### NavigationHeader Component
```
Create NavigationHeader component:

HIG Requirements:
- Height: 44pt (standard) or 96pt (large title)
- Back button: minimum 44×44pt hit area
- Title: 시스템 폰트 17pt (fontWeight: '600')
- Right items: 44×44pt touch targets

Props:
- title: string
- showBack: boolean
- rightAction?: () => void
- progress?: string (e.g., "2/6")

Features:
- Blur effect background (UIVisualEffectView style)
- Safe area top padding
- Smooth transition between standard/large
```

#### HapticButton Component
```
Create HapticButton with HIG compliance:

Requirements:
- Minimum size: 44×44pt
- Visual + haptic feedback
- Loading state support
- Disabled state styling

Props:
interface HapticButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'text';
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

Behavior:
- Touch down: scale 0.95 + haptic
- Disabled: opacity 0.3, no interaction
- Loading: show ActivityIndicator

Sizes:
- small: 44pt height
- medium: 50pt height  
- large: 56pt height
```

### 🎯 HIG-Specific Implementation Patterns

#### Permission Request Pattern
```
Implement permission request following HIG:

1. Just-in-time: Request only when feature is used
2. Context: Explain why before system prompt
3. Fallback: Graceful handling if denied
4. Settings: Deep link to app settings

Example for camera:
- User taps OCR button
- Show custom explanation modal
- Then trigger system permission
- If denied, show "Enable in Settings" button
```

#### Feedback Pattern
```
Implement HIG-compliant feedback:

Visual feedback:
- Success: checkmark.circle.fill + systemGreen
- Error: exclamationmark.triangle + systemRed
- Info: info.circle + systemBlue

Toast/Banner:
- Slide from top (not Android-style bottom)
- Auto-dismiss after 3 seconds
- Include action button if applicable

Haptic feedback mapping:
- Selection: UIImpactFeedbackGenerator.light()
- Success: UINotificationFeedbackGenerator.success()
- Error: UINotificationFeedbackGenerator.error()
- Warning: UINotificationFeedbackGenerator.warning()
```

#### Adaptive Layout Pattern
```
Implement size class adaptations:

iPhone Portrait:
- Single column layouts
- Full-width buttons
- Compact navigation

iPhone Landscape:
- Consider two-column where appropriate
- Side-by-side buttons
- Adjusted spacing

iPad:
- Sidebar navigation option
- Grid layouts with more columns
- Popover presentations
- Keyboard shortcuts support
```

---

## 🛠️ Claude Code CLI Prompts (HIG Focus)

### 🐛 HIG Compliance Checks
```bash
# Check touch target sizes
claude "Audit all buttons in [Screen] for 44pt minimum touch targets"

# Fix text sizes
claude "Update all text to minimum 11pt with Dynamic Type support"

# Add haptic feedback
claude "Add appropriate haptic feedback to all interactive elements"

# Fix color contrast
claude "Check and fix color contrast ratios to meet 4.5:1 minimum"
```

### ⚡ Performance + HIG
```bash
# Optimize animations for HIG
claude "Ensure all animations complete within 0.4s using spring curves"

# Reduce Motion support
claude "Add Reduce Motion checks and alternative behaviors"

# Memory-efficient blur effects
claude "Implement efficient blur effects for modal presentations"
```

---

## 💡 HIG Quick Reference for Prompts

### Always Include:
1. **Touch targets**: "minimum 44×44pt"
2. **Text size**: "minimum 11pt with Dynamic Type"
3. **System fonts**: "iOS native fonts (no fontFamily needed)"
4. **Feedback**: "haptic + visual feedback"
5. **Animation**: "spring animation, max 0.4s"
6. **Colors**: "system semantic colors"
7. **Navigation**: "standard iOS patterns"

### Component Names to Use:
- Button → `TouchableOpacity` with proper sizing
- Navigation → `NavigationController` + `TabBarController`
- Inputs → Native `TextInput` with 44pt height
- Lists → `FlatList` with 60pt minimum row height
- Modals → `Modal` with iOS presentation style

### Spacing Grid:
```
4pt:  Hairline spacing
8pt:  Compact spacing
12pt: Default element spacing
16pt: Default padding
20pt: Screen margins
24pt: Section spacing
```

---

## 📋 HIG Validation Checklist Template

```
For every screen/component, validate:

Visual Design:
□ All text ≥ 11pt
□ Color contrast ≥ 4.5:1
□ Uses system colors
□ Supports dark mode prep

Interactive Elements:
□ Touch targets ≥ 44×44pt
□ Visual feedback on all taps
□ Haptic feedback where appropriate
□ Disabled states clearly indicated

Navigation:
□ Standard iOS navigation patterns
□ Clear hierarchy
□ Progress indicators where needed
□ Gesture support (swipe back)

Motion:
□ Animations < 0.4s
□ Spring curves used
□ Reduce Motion alternative
□ No excessive animation

Accessibility:
□ VoiceOver labels
□ Dynamic Type support
□ Color-blind safe
□ Sufficient contrast
```

---

## 🚀 Quick Copy Templates (HIG Enhanced)

### HIG-Compliant Screen
```
Create [Screen] following iOS HIG:
- Navigation: [tab position] tab, [title] in nav bar
- Layout: [description] with proper spacing
- Interactions: all buttons 44pt+, haptic feedback
- Text: min 11pt, Dynamic Type ready
- Colors: system semantic colors only
- Animation: spring, max 0.4s
- Include loading and error states
```

### HIG Component
```
Create [Component] meeting HIG standards:
- Size: minimum 44×44pt touch target
- States: normal, pressed, disabled, loading
- Feedback: visual + appropriate haptic
- Animation: subtle spring effects
- Accessibility: full VoiceOver support
- Dark mode: use semantic colors
```

### HIG Fix Request
```
Fix [Component/Screen] for HIG compliance:
Current issues:
- [list specific issues]

Requirements:
- Touch targets: expand to 44pt minimum
- Contrast: improve to 4.5:1 ratio
- Feedback: add haptic responses
- Animation: reduce to 0.4s max
```

---

**Remember**: HIG compliance = Better UX = Happier users = App Store featuring! 🍎✨
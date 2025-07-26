/**
 * CupNote Typography System
 * 
 * Research-backed typography scale based on Material Design and 
 * data-heavy interface best practices. Supports both primary content
 * and secondary information with proper WCAG accessibility compliance.
 */

// ===== FONT SIZE SCALE =====
export const FontSizes = {
  // Micro text (10px) - Use sparingly for metadata only
  micro: 10,
  
  // Secondary Scale (11-13px) - Labels and captions  
  overline: 11,    // Status badges, metadata only
  caption: 13,     // Secondary information, helper text
  
  // Primary Scale (16px+) - Main content (baseline: 16px)
  body: 16,        // Primary body text, main labels (baseline)
  subtitle: 18,    // Section headers, important labels
  heading: 22,     // Page headings, stat values
  title: 26,       // Screen titles
  display: 30,     // Hero text
  hero: 34,        // Large display text
} as const;

// ===== TAMAGUI TOKEN MAPPING =====
export const TamaguiTypographyMapping = {
  // Map to Tamagui $1-$8 tokens
  '$1': FontSizes.overline,    // 11px - Status badges, metadata
  '$2': FontSizes.caption,     // 13px - Secondary info, helper text
  '$3': FontSizes.body,        // 16px - Body text, main labels (baseline)
  '$4': FontSizes.subtitle,    // 18px - Section headers, important labels
  '$5': FontSizes.heading,     // 22px - Page headings, stat values
  '$6': FontSizes.title,       // 26px - Screen titles
  '$7': FontSizes.display,     // 30px - Hero text
  '$8': FontSizes.hero,        // 34px - Large display
} as const;

// ===== FONT WEIGHTS =====
export const FontWeights = {
  light: '300',
  regular: '400', 
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

// ===== LINE HEIGHTS =====
export const LineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// ===== TYPOGRAPHY COMPONENT STYLES =====
export const TypographyStyles = {
  // Navigation and Headers
  navigationTitle: {
    fontSize: TamaguiTypographyMapping['$4'], // 18px
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
  },
  
  // Status Badges (Current implementation is correct)
  statusBadge: {
    fontSize: TamaguiTypographyMapping['$1'], // 11px - Appropriate for badges
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
  },
  
  // Body Text
  bodyPrimary: {
    fontSize: TamaguiTypographyMapping['$3'], // 16px - WCAG minimum
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },
  
  bodySecondary: {
    fontSize: TamaguiTypographyMapping['$2'], // 13px - Secondary content
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },
  
  // Headings
  h1: {
    fontSize: TamaguiTypographyMapping['$8'], // 34px
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
  },
  
  h2: {
    fontSize: TamaguiTypographyMapping['$7'], // 30px
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
  },
  
  h3: {
    fontSize: TamaguiTypographyMapping['$6'], // 26px
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.tight,
  },
  
  h4: {
    fontSize: TamaguiTypographyMapping['$5'], // 22px
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
  },
  
  // Statistics and Data
  statValue: {
    fontSize: TamaguiTypographyMapping['$5'], // 22px - Prominent data
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights.tight,
  },
  
  statLabel: {
    fontSize: TamaguiTypographyMapping['$3'], // 16px - Balanced readability for main stat labels
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
  },
  
  // Metadata and Timestamps
  metadata: {
    fontSize: FontSizes.micro, // 10px - Timestamps only
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },
  
  // Captions and Footnotes
  caption: {
    fontSize: TamaguiTypographyMapping['$2'], // 13px
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },
  
  // Buttons
  buttonPrimary: {
    fontSize: TamaguiTypographyMapping['$3'], // 16px
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.normal,
  },
  
  buttonSecondary: {
    fontSize: TamaguiTypographyMapping['$2'], // 13px
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
  },
  
  // Input and Form Labels
  inputLabel: {
    fontSize: TamaguiTypographyMapping['$2'], // 13px
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.normal,
  },
  
  inputText: {
    fontSize: TamaguiTypographyMapping['$3'], // 16px
    fontWeight: FontWeights.regular,
    lineHeight: LineHeights.normal,
  },
} as const;

// ===== USAGE GUIDELINES =====
export const TypographyGuidelines = {
  // When to use each size - Updated for balanced UX
  usage: {
    micro: ['timestamps', 'version-info', 'build-numbers'],
    overline: ['status-badges', 'metadata-only'], // 11px - Use sparingly for badges
    caption: ['secondary-info', 'footnotes', 'helper-text', 'form-hints'], // 13px - Secondary information
    body: ['main-content', 'descriptions', 'form-inputs', 'stat-labels', 'navigation-labels'], // 16px - Primary content (baseline)
    subtitle: ['section-headers', 'card-titles', 'important-labels'], // 18px - Section headers
    heading: ['page-sections', 'modal-titles', 'stat-values'], // 22px - Headings and prominent data
    title: ['screen-titles', 'page-headers'], // 26px - Screen titles
    display: ['hero-text', 'welcome-messages'], // 30px - Hero text
    hero: ['landing-headers', 'splash-screens'], // 34px - Large display
  },
  
  // Accessibility considerations
  accessibility: {
    minimumBodyText: TamaguiTypographyMapping['$3'], // 16px
    contrastRequirement: '4.5:1 for normal text, 3:1 for large text (18px+)',
    touchTargets: 'Minimum 44px for interactive elements',
    scalability: 'Support system font scaling preferences',
  },
  
  // Best practices
  bestPractices: [
    'Use semantic token names ($1-$8) instead of hardcoded pixel values',
    'Reserve 10-12px text for secondary information only',
    'Maintain consistent line heights within content blocks',
    'Test accessibility with system font scaling enabled',
    'Ensure sufficient contrast ratios for all text sizes',
  ],
} as const;

// ===== TYPE EXPORTS =====
export type FontSizeToken = keyof typeof FontSizes;
export type TamaguiToken = keyof typeof TamaguiTypographyMapping;
export type FontWeightToken = keyof typeof FontWeights;
export type LineHeightToken = keyof typeof LineHeights;
export type TypographyStyleToken = keyof typeof TypographyStyles;
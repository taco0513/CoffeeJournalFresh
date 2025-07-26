const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Type replacements map
const typeReplacements = {
  // Bridge types
  'params: any[]': 'params: BridgeParam[]',
  'param: any': 'param: BridgeParam',
  'sanitized: any': 'sanitized: { [key: string]: BridgeParam }',
  '...args: any[]': '...args: unknown[]',
  
  // Firecrawl types
  'as any[]': 'as CoffeeProduct[]',
  'marketData.roasters': 'marketData.roasters as RoasterData[]',
  'marketData.priceRanges': 'marketData.priceRanges as PriceRange[]',
  'marketData.newProducts': 'marketData.newProducts as CoffeeProduct[]',
  'options: any': 'options: FirecrawlScrapeOptions | FirecrawlAnalysisOptions | FirecrawlCrawlOptions',
  
  // Achievement types
  'definition: any': 'definition: AchievementDefinition',
  'rewards: any': 'rewards: AchievementReward',
  'userAchievement: any': 'userAchievement: UserAchievement',
  'action: UserAction': 'action: UserAction',
  
  // Error handling
  'error: any': 'error: Error',
  'catch (error: any)': 'catch (error)',
  '(error as any).message': '(error as Error).message',
  'error?: any': 'error?: Error',
  
  // Common patterns
  'data: any': 'data: unknown',
  'context: any': 'context: Record<string, unknown>',
  'metadata: any': 'metadata: Record<string, unknown>',
  'options?: any': 'options?: Record<string, unknown>',
  'config: any': 'config: Record<string, unknown>',
  'params?: any': 'params?: Record<string, unknown>',
  
  // Function types
  'callback: any': 'callback: (...args: unknown[]) => void',
  'handler: any': 'handler: (...args: unknown[]) => void | Promise<void>',
  
  // React/Component types
  'style?: any': 'style?: StyleProp<ViewStyle>',
  'props: any': 'props: Record<string, unknown>',
  'state: any': 'state: Record<string, unknown>',
};

// Files that need specific imports
const fileImports = {
  'src/utils/bridgeDebugger.ts': [
    "import { BridgeParam, BridgeCall, BridgeCallback, NativeBridge } from '../types/bridge';"
  ],
  'src/services/FirecrawlDemo.ts': [
    "import { FirecrawlScrapeOptions, FirecrawlAnalysisOptions, FirecrawlCrawlOptions, RoasterData, MarketAnalysisData, CoffeeProduct, PriceRange, CompanyInfo, CoffeeProductData, MarketIntelligenceData } from '../types/firecrawl';"
  ],
  'src/services/AchievementSystem.ts': [
    "import { UserAction, AchievementDefinition, AchievementReward, UserAchievement, AchievementProgress, AchievementStats } from '../types/achievement';"
  ],
};

let totalFixed = 0;
let filesProcessed = 0;

function addImportsIfNeeded(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  const imports = fileImports[relativePath];
  
  if (imports && imports.length > 0) {
    // Check if imports already exist
    const hasImports = imports.every(imp => content.includes(imp));
    if (!hasImports) {
      // Add imports after the first import statement
      const firstImportIndex = content.indexOf('import ');
      if (firstImportIndex !== -1) {
        const firstImportEnd = content.indexOf('\n', firstImportIndex);
        const before = content.substring(0, firstImportEnd + 1);
        const after = content.substring(firstImportEnd + 1);
        
        // Add new imports
        const newImports = imports.filter(imp => !content.includes(imp)).join('\n');
        return before + newImports + '\n' + after;
      }
    }
  }
  
  return content;
}

function fixAnyTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixCount = 0;
  
  // Skip type definition files
  if (filePath.endsWith('.d.ts')) return;
  
  // Add necessary imports
  content = addImportsIfNeeded(filePath, content);
  
  // Apply type replacements
  for (const [pattern, replacement] of Object.entries(typeReplacements)) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, replacement);
      fixCount += matches.length;
    }
  }
  
  // Fix specific patterns with regex
  const patterns = [
    // Fix array type annotations
    { pattern: /:\s*any\[\]/g, replacement: ': unknown[]' },
    // Fix generic any in angle brackets
    { pattern: /<any>/g, replacement: '<unknown>' },
    // Fix as any casts
    { pattern: /as\s+any(?=\s|;|,|\)|>)/g, replacement: 'as unknown' },
    // Fix function parameters
    { pattern: /\(([^)]*?):\s*any([^)]*?)\)/g, replacement: '($1: unknown$2)' },
  ];
  
  for (const { pattern, replacement } of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fixCount += matches.length;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fixCount} any types in: ${path.relative(process.cwd(), filePath)}`);
    totalFixed += fixCount;
    filesProcessed++;
  }
}

// Priority files to fix first
const priorityFiles = [
  'src/utils/bridgeDebugger.ts',
  'src/services/FirecrawlDemo.ts',
  'src/services/AchievementSystem.ts',
  'src/utils/logger.ts',
  'src/services/auth/SecureStorage.ts',
  'src/services/auth/UnifiedAuthService.ts',
  'src/services/FlavorDataOptimizer.ts',
];

console.log(`\n🔧 Fixing TypeScript 'any' types...\n`);

// Fix priority files first
priorityFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixAnyTypes(fullPath);
  }
});

// Then fix remaining files
const allFiles = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

allFiles.forEach(file => {
  if (!priorityFiles.includes(path.relative(process.cwd(), file))) {
    fixAnyTypes(file);
  }
});

console.log(`\n✨ Fixed ${totalFixed} 'any' types across ${filesProcessed} files!\n`);
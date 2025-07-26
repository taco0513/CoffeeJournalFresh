const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Extended type replacements based on analysis of remaining files
const typeReplacements = {
  // Common patterns from first script
  'params: any[]': 'params: BridgeParam[]',
  'params: any': 'params: BridgeParam[]',
  'error: any': 'error: Error',
  'data: any': 'data: unknown',
  'value: any': 'value: unknown',
  'result: any': 'result: unknown',
  'response: any': 'response: unknown',
  'item: any': 'item: unknown',
  'element: any': 'element: unknown',
  'obj: any': 'obj: unknown',
  'args: any[]': 'args: unknown[]',
  'props: any': 'props: unknown',
  '(error: any)': '(error: Error)',
  'catch (error: any)': 'catch (error)',
  'options: any': 'options: unknown',
  'config: any': 'config: unknown',
  
  // React patterns
  'children: any': 'children: React.ReactNode',
  'component: any': 'component: React.ComponentType',
  'Component: any': 'Component: React.ComponentType',
  
  // Additional patterns from analyzed files
  'error: unknown': 'error: Error',
  'currentMarketInfo: unknown': 'currentMarketInfo: MarketInfo',
  'competitorData: unknown[]': 'competitorData: CompetitorData[]',
  'priceData: unknown': 'priceData: PriceData',
  'record: unknown': 'record: TastingRecord',
  'roaster: unknown': 'roaster: IRoasterInfo',
  'cafe: unknown': 'cafe: ICafeInfo',
  '} as unknown': '}',
  'forEach((record: unknown)': 'forEach((record: TastingRecord)',
  
  // Realm patterns
  'as unknown as Realm.Results': 'as Realm.Results',
  
  // HomeCafe patterns - remove unnecessary casts
  'dripper: dripper as unknown': 'dripper: dripper',
  'filter: filters[i % filters.length] as unknown': 'filter: filters[i % filters.length]',
  'pourTechnique: pourTechniques[i % pourTechniques.length] as unknown': 'pourTechnique: pourTechniques[i % pourTechniques.length]',
  'dripper: expertDrippers[Math.floor(Math.random() * expertDrippers.length)] as unknown': 'dripper: expertDrippers[Math.floor(Math.random() * expertDrippers.length)]',
  'filter: \'bleached\' as unknown': 'filter: \'bleached\'',
  'pourTechnique: expertTechniques[Math.floor(Math.random() * expertTechniques.length)] as unknown': 'pourTechnique: expertTechniques[Math.floor(Math.random() * expertTechniques.length)]',
  'agitation: \'swirl\' as unknown': 'agitation: \'swirl\'',
  
  // Sensory patterns - remove unnecessary casts
  'selectedFlavors: beginnerFlavors.slice(0, Math.floor(Math.random() * 3) + 1) as unknown': 'selectedFlavors: beginnerFlavors.slice(0, Math.floor(Math.random() * 3) + 1)',
  'selectedFlavors: intermediateFlavors.slice(0, Math.floor(Math.random() * 5) + 2) as unknown': 'selectedFlavors: intermediateFlavors.slice(0, Math.floor(Math.random() * 5) + 2)',
  'selectedFlavors: expertFlavors.slice(0, Math.floor(Math.random() * 8) + 4) as unknown': 'selectedFlavors: expertFlavors.slice(0, Math.floor(Math.random() * 8) + 4)',
  'return beginnerExpressions.slice(0, Math.floor(Math.random() * 2) + 1) as unknown': 'return beginnerExpressions.slice(0, Math.floor(Math.random() * 2) + 1)',
  'return intermediateExpressions.slice(0, Math.floor(Math.random() * 3) + 2) as unknown': 'return intermediateExpressions.slice(0, Math.floor(Math.random() * 3) + 2)',
  'return expertExpressions.slice(0, Math.floor(Math.random() * 4) + 3) as unknown': 'return expertExpressions.slice(0, Math.floor(Math.random() * 4) + 3)',
  'return homeCafeExpressions as unknown': 'return homeCafeExpressions',
  
  // Mouthfeel patterns
  'mouthfeel: [\'Clean\', \'Creamy\', \'Juicy\', \'Silky\'][Math.floor(Math.random() * 4)] as unknown': 'mouthfeel: [\'Clean\', \'Creamy\', \'Juicy\', \'Silky\'][Math.floor(Math.random() * 4)] as MouthfeelType',
  
  // Error handling patterns
  'error as unknown': 'error as Error',
  '(error as unknown }).message': '(error as Error).message',
  'catch (error: Error)': 'catch (error)',
  
  // Agitation patterns
  'agitation: [\'none\', \'swirl\', \'stir\'][i % 3] as unknown': 'agitation: [\'none\', \'swirl\', \'stir\'][i % 3] as AgitationType',
  
  // Type assertions
  'as any': 'as unknown',
  'as any[]': 'as unknown[]',
  
  // Function returns
  '): any': '): unknown',
  '): any[]': '): unknown[]',
  '): Promise<any>': '): Promise<unknown>',
  
  // Generics
  '<any>': '<unknown>',
  'Array<any>': 'Array<unknown>',
  'Promise<any>': 'Promise<unknown>',
  'Observable<any>': 'Observable<unknown>',
  
  // Common variables
  'let data: any': 'let data: unknown',
  'const data: any': 'const data: unknown',
  'var data: any': 'var data: unknown',
  
  // Special case for flavor data
  'selectedFlavors: [\n          { level: 1, value: \'Fruity\', koreanValue: \'과일향\' },\n          { level: 2, value: \'Berry\', koreanValue: \'베리류\' }\n        ] as unknown': 'selectedFlavors: [\n          { level: 1, value: \'Fruity\', koreanValue: \'과일향\' },\n          { level: 2, value: \'Berry\', koreanValue: \'베리류\' }\n        ]',
};

// Additional type imports to add to specific files
const fileImports = {
  'src/components/testing/MarketConfigurationTester_Original.tsx': [
    "import { MarketInfo, CompetitorData, PriceData } from '../../types/market';",
  ],
  'src/services/realm/RoasterService.ts': [
    "import { TastingRecord } from '../types';",
  ],
  'src/services/realm/CafeService.ts': [
    "import { TastingRecord } from '../types';",
  ],
  'src/services/MockDataService.ts': [
    "import { MouthfeelType, AgitationType } from '../types/tasting';",
    "import { TastingRecord } from './realm/types';",
  ]
};

let totalFixed = 0;
let filesProcessed = 0;

function addImportsIfNeeded(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  const imports = fileImports[relativePath];
  
  if (imports && imports.length > 0) {
    // Check if imports already exist
    const hasImports = imports.every(imp => {
      const importName = imp.match(/import.*from/)?.[0];
      return importName && content.includes(importName);
    });
    
    if (!hasImports) {
      // Find the last import statement
      const importRegex = /^import\s+.*$/gm;
      const matches = [...content.matchAll(importRegex)];
      
      if (matches.length > 0) {
        const lastImport = matches[matches.length - 1];
        const insertPosition = lastImport.index + lastImport[0].length;
        
        // Add new imports
        const newImports = imports.filter(imp => {
          const importName = imp.match(/import.*from/)?.[0];
          return importName && !content.includes(importName);
        }).join('\n');
        
        if (newImports) {
          content = content.slice(0, insertPosition) + '\n' + newImports + content.slice(insertPosition);
        }
      }
    }
  }
  
  return content;
}

function fixAnyTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixCount = 0;
  
  // Skip type definition files and files that may have already been processed
  if (filePath.endsWith('.d.ts') || filePath.includes('node_modules')) return;
  
  // Add necessary imports first
  content = addImportsIfNeeded(filePath, content);
  
  // Apply type replacements
  for (const [pattern, replacement] of Object.entries(typeReplacements)) {
    // Create regex with proper escaping
    const escapedPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\n/g, '\n'); // Preserve newlines in patterns
    
    const regex = new RegExp(escapedPattern, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      content = content.replace(regex, replacement);
      fixCount += matches.length;
    }
  }
  
  // Additional regex patterns for complex cases
  const patterns = [
    // Fix array type annotations
    { pattern: /:\s*any\[\]/g, replacement: ': unknown[]' },
    // Fix generic any in angle brackets
    { pattern: /<any>/g, replacement: '<unknown>' },
    // Fix as any casts with word boundary
    { pattern: /\bas\s+any\b/g, replacement: 'as unknown' },
    // Fix function parameters with any
    { pattern: /\(([^:)]*?):\s*any\)/g, replacement: '($1: unknown)' },
    // Fix standalone any type declarations
    { pattern: /:\s*any\s*(?=[;,\s})])/g, replacement: ': unknown' },
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
    console.log(`✅ Fixed ${fixCount} any/unknown types in: ${path.relative(process.cwd(), filePath)}`);
    totalFixed += fixCount;
    filesProcessed++;
  }
}

// Files that likely have remaining any types
const targetFiles = [
  'src/components/testing/MarketConfigurationTester_Original.tsx',
  'src/services/FirecrawlDemo.ts',
  'src/services/realm/RoasterService.ts',
  'src/services/realm/CafeService.ts',
  'src/services/MockDataService.ts',
  'src/screens/**/*.tsx',
  'src/components/**/*.tsx',
  'src/services/**/*.ts',
  'src/utils/**/*.ts',
];

console.log(`\n🔧 Fixing remaining TypeScript 'any' and 'unknown' types...\n`);

// Process all TypeScript files
const allFiles = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/*.d.ts']
});

allFiles.forEach(file => {
  fixAnyTypes(file);
});

console.log(`\n✨ Fixed ${totalFixed} 'any/unknown' types across ${filesProcessed} files!\n`);

// Check remaining any types
console.log('\n🔍 Checking for remaining any types...\n');

const remainingFiles = [];
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const anyMatches = content.match(/\bany\b/g);
  if (anyMatches && anyMatches.length > 0) {
    // Filter out comments and strings
    const lines = content.split('\n');
    let realAnyCount = 0;
    lines.forEach((line, index) => {
      if (!line.trim().startsWith('//') && !line.trim().startsWith('*') && line.match(/\bany\b/)) {
        realAnyCount++;
      }
    });
    if (realAnyCount > 0) {
      remainingFiles.push({ file: path.relative(process.cwd(), file), count: realAnyCount });
    }
  }
});

if (remainingFiles.length > 0) {
  console.log('Files with remaining any types:');
  remainingFiles.sort((a, b) => b.count - a.count).forEach(({ file, count }) => {
    console.log(`  ${file}: ${count} occurrences`);
  });
  console.log(`\nTotal files with any types: ${remainingFiles.length}`);
} else {
  console.log('✅ No remaining any types found!');
}
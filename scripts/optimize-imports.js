#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Optimizing Tamagui imports...');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
});

let totalOptimized = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let hasChanges = false;

  // Pattern 1: Replace full tamagui imports with specific imports
  const fullImportPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]tamagui['"]/g;
  const matches = content.match(fullImportPattern);
  
  if (matches) {
    matches.forEach(match => {
      const imports = match.match(/{\s*([^}]+)\s*}/)[1];
      const importList = imports.split(',').map(i => i.trim());
      
      // Group imports by their source
      const coreImports = ['View', 'Text', 'Stack', 'XStack', 'YStack', 'styled', 'useTheme', 'getTokens'];
      const animationImports = ['AnimatePresence', 'animation'];
      const componentImports = ['Button', 'Card', 'Input', 'ScrollView', 'Spinner', 'Progress'];
      const textImports = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Paragraph', 'SizableText'];
      
      const groupedImports = {
        '@tamagui/core': importList.filter(i => coreImports.includes(i)),
        '@tamagui/animations-react-native': importList.filter(i => animationImports.includes(i)),
        '@tamagui/button': importList.filter(i => i === 'Button'),
        '@tamagui/card': importList.filter(i => i === 'Card'),
        '@tamagui/input': importList.filter(i => i === 'Input'),
        '@tamagui/scroll-view': importList.filter(i => i === 'ScrollView'),
        '@tamagui/spinner': importList.filter(i => i === 'Spinner'),
        '@tamagui/progress': importList.filter(i => i === 'Progress'),
        '@tamagui/text': importList.filter(i => textImports.includes(i)),
      };
      
      // Keep only the imports that don't have specific packages
      const remainingImports = importList.filter(i => 
        !Object.values(groupedImports).flat().includes(i)
      );
      
      if (remainingImports.length === 0) {
        // All imports can be optimized
        let newImports = [];
        Object.entries(groupedImports).forEach(([pkg, imports]) => {
          if (imports.length > 0) {
            newImports.push(`import { ${imports.join(', ')} } from '${pkg}';`);
          }
        });
        
        content = content.replace(match, newImports.join('\n'));
        hasChanges = true;
        totalOptimized++;
      }
    });
  }

  if (hasChanges) {
    fs.writeFileSync(file, content);
    console.log(`✅ Optimized: ${file}`);
  }
});

console.log(`\n✨ Optimization complete! Optimized ${totalOptimized} imports.`);
#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

console.log('🔧 Fixing duplicate import statements...');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
});

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let hasChanges = false;
  
  // Fix pattern: "import import { X } from 'Y'" -> "import { X } from 'Y'"
  const duplicateImportPattern = /import\s+import\s+([^}]*}\s*from\s*['"][^'"]+['"])/g;
  if (duplicateImportPattern.test(content)) {
    content = content.replace(duplicateImportPattern, 'import $1');
    hasChanges = true;
  }
  
  // Fix pattern: "import import X } from 'Y'" -> "import { X } from 'Y'"
  const malformedImportPattern = /import\s+import\s+([^}]*}\s*from\s*['"][^'"]+['"])/g;
  if (malformedImportPattern.test(content)) {
    content = content.replace(malformedImportPattern, 'import { $1');
    hasChanges = true;
  }
  
  // Fix pattern: "import { import X } from 'Y'" -> "import { X } from 'Y'"
  const innerDuplicatePattern = /import\s*{\s*import\s+([^}]+)}\s*from/g;
  if (innerDuplicatePattern.test(content)) {
    content = content.replace(innerDuplicatePattern, 'import { $1 } from');
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed: ${file}`);
    totalFixed++;
  }
});

console.log(`\n🎉 Fixed ${totalFixed} files with duplicate imports.`);
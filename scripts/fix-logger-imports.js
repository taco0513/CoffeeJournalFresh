#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');

console.log('🔧 Fixing Logger import statements...');

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
});

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let hasChanges = false;
  
  // Fix pattern: "import { { Logger } from" -> "import { Logger } from"
  const doubleBracePattern = /import\s*{\s*{\s*Logger\s*}\s*}\s*from/g;
  if (doubleBracePattern.test(content)) {
    content = content.replace(doubleBracePattern, 'import { Logger } from');
    hasChanges = true;
  }
  
  // Fix pattern: "import { { Logger  } from" -> "import { Logger } from"
  const doubleBraceSpacePattern = /import\s*{\s*{\s*Logger\s*\s*}\s*}\s*from/g;
  if (doubleBraceSpacePattern.test(content)) {
    content = content.replace(doubleBraceSpacePattern, 'import { Logger } from');
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(file, content);
    console.log(`✅ Fixed: ${file}`);
    totalFixed++;
  }
});

console.log(`\n🎉 Fixed ${totalFixed} files with Logger import issues.`);
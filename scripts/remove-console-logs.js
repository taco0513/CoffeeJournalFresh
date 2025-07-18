#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to process
const directories = ['src'];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Counter for removed logs
let totalRemoved = 0;
let filesProcessed = 0;

// Patterns to remove or comment out
const patterns = [
  // Remove simple console.log statements
  /^\s*console\.(log|error|warn|info|debug)\(.*\);\s*$/gm,
  // Remove console.log statements that span multiple lines
  /^\s*console\.(log|error|warn|info|debug)\([^;]*\);\s*$/gm,
];

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let removedInFile = 0;

  patterns.forEach(pattern => {
    const matches = modified.match(pattern);
    if (matches) {
      removedInFile += matches.length;
      // Comment out instead of removing (safer for beta)
      modified = modified.replace(pattern, (match) => {
        // Preserve indentation
        const indent = match.match(/^\s*/)[0];
        return `${indent}// ${match.trim()}`;
      });
    }
  });

  if (removedInFile > 0) {
    fs.writeFileSync(filePath, modified);
    console.log(`✓ ${filePath}: Commented out ${removedInFile} console statements`);
    totalRemoved += removedInFile;
    filesProcessed++;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', '.git', 'build', 'dist', 'coverage'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (extensions.includes(path.extname(file))) {
      processFile(filePath);
    }
  });
}

console.log('🧹 Starting console.log cleanup...\n');

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});

console.log(`\n✅ Cleanup complete!`);
console.log(`📊 Summary:`);
console.log(`   - Files processed: ${filesProcessed}`);
console.log(`   - Console statements commented out: ${totalRemoved}`);
console.log(`\n💡 Tip: Console statements were commented out (not deleted) so you can easily restore them if needed.`);
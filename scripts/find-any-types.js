const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/React files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

const anyTypeUsages = [];
const unknownTypeUsages = [];

// Patterns to match any and unknown types
const patterns = {
  any: [
    /:\s*any(?:\s|;|,|\)|>|\[)/g,              // : any
    /:\s*any\[\]/g,                           // : any[]
    /:\s*Array<any>/g,                        // : Array<any>
    /<any>/g,                                 // <any>
    /as\s+any/g,                              // as any
    /:\s*\{[^}]*:\s*any[^}]*\}/g,           // : { prop: any }
    /\(([^)]*:\s*any[^)]*)\)/g,             // function params
  ],
  unknown: [
    /:\s*unknown(?:\s|;|,|\)|>|\[)/g,        // : unknown
    /:\s*unknown\[\]/g,                       // : unknown[]
    /:\s*Array<unknown>/g,                    // : Array<unknown>
    /<unknown>/g,                             // <unknown>
    /as\s+unknown/g,                          // as unknown
  ]
};

function extractContext(content, match, index) {
  const lines = content.split('\n');
  let currentPos = 0;
  let lineNumber = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (currentPos + lines[i].length >= index) {
      lineNumber = i + 1;
      break;
    }
    currentPos += lines[i].length + 1; // +1 for newline
  }
  
  const line = lines[lineNumber - 1] || '';
  return {
    lineNumber,
    line: line.trim(),
    context: line
  };
}

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip type definition files
  if (filePath.endsWith('.d.ts')) return;
  
  // Find any types
  patterns.any.forEach(pattern => {
    const regex = new RegExp(pattern);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const context = extractContext(content, match[0], match.index);
      anyTypeUsages.push({
        file: path.relative(process.cwd(), filePath),
        lineNumber: context.lineNumber,
        line: context.line,
        match: match[0].trim()
      });
    }
  });
  
  // Find unknown types
  patterns.unknown.forEach(pattern => {
    const regex = new RegExp(pattern);
    let match;
    while ((match = regex.exec(content)) !== null) {
      const context = extractContext(content, match[0], match.index);
      unknownTypeUsages.push({
        file: path.relative(process.cwd(), filePath),
        lineNumber: context.lineNumber,
        line: context.line,
        match: match[0].trim()
      });
    }
  });
});

// Group by file
const anyByFile = {};
anyTypeUsages.forEach(usage => {
  if (!anyByFile[usage.file]) {
    anyByFile[usage.file] = [];
  }
  anyByFile[usage.file].push(usage);
});

const unknownByFile = {};
unknownTypeUsages.forEach(usage => {
  if (!unknownByFile[usage.file]) {
    unknownByFile[usage.file] = [];
  }
  unknownByFile[usage.file].push(usage);
});

// Sort files by number of any/unknown usages
const sortedAnyFiles = Object.entries(anyByFile)
  .sort(([, a], [, b]) => b.length - a.length);

const sortedUnknownFiles = Object.entries(unknownByFile)
  .sort(([, a], [, b]) => b.length - a.length);

console.log(`\n📊 TypeScript Type Analysis Report\n`);
console.log(`${'='.repeat(80)}\n`);

console.log(`Total 'any' type usages: ${anyTypeUsages.length}`);
console.log(`Total 'unknown' type usages: ${unknownTypeUsages.length}`);
console.log(`Total files with 'any': ${Object.keys(anyByFile).length}`);
console.log(`Total files with 'unknown': ${Object.keys(unknownByFile).length}`);

console.log(`\n🔥 Top 10 Files with 'any' Types:\n`);
sortedAnyFiles.slice(0, 10).forEach(([file, usages]) => {
  console.log(`\n${file} (${usages.length} usages):`);
  usages.slice(0, 3).forEach(usage => {
    console.log(`  Line ${usage.lineNumber}: ${usage.line.substring(0, 80)}...`);
  });
  if (usages.length > 3) {
    console.log(`  ... and ${usages.length - 3} more`);
  }
});

if (unknownTypeUsages.length > 0) {
  console.log(`\n⚠️  Files with 'unknown' Types:\n`);
  sortedUnknownFiles.forEach(([file, usages]) => {
    console.log(`\n${file} (${usages.length} usages):`);
    usages.forEach(usage => {
      console.log(`  Line ${usage.lineNumber}: ${usage.line.substring(0, 80)}...`);
    });
  });
}

// Write detailed report to file
const report = {
  summary: {
    totalAny: anyTypeUsages.length,
    totalUnknown: unknownTypeUsages.length,
    filesWithAny: Object.keys(anyByFile).length,
    filesWithUnknown: Object.keys(unknownByFile).length
  },
  anyTypes: anyByFile,
  unknownTypes: unknownByFile
};

fs.writeFileSync(
  'typescript-any-unknown-report.json',
  JSON.stringify(report, null, 2)
);

console.log(`\n📄 Detailed report saved to: typescript-any-unknown-report.json\n`);
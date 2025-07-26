const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns that indicate incomplete interfaces
const incompletePatterns = [
  /interface\s+\w+\s*{\s*}/,                    // Empty interface
  /interface\s+\w+\s*{\s*\/\/\s*TODO/i,        // Interface with TODO
  /interface\s+\w+\s*{\s*\/\/\s*FIXME/i,       // Interface with FIXME
  /interface\s+\w+\s*{\s*\[key:\s*string\]:\s*any\s*}/,  // Index signature with any
  /:\s*any(?:\s*[;,}])/,                       // Properties typed as any
  /:\s*unknown(?:\s*[;,}])/,                   // Properties typed as unknown
  /:\s*Function(?:\s*[;,}])/,                  // Properties typed as Function
  /:\s*object(?:\s*[;,}])/,                    // Properties typed as object
  /interface\s+\w+\s*extends\s*any/,           // Interface extending any
];

class InterfaceAnalyzer {
  constructor() {
    this.incompleteInterfaces = [];
    this.totalInterfaces = 0;
    this.fileCount = 0;
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find all interfaces
    const interfaceRegex = /interface\s+(\w+)(?:\s*<[^>]+>)?\s*(?:extends\s+[^{]+)?\s*{/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      this.totalInterfaces++;
      const interfaceName = match[1];
      const startIndex = match.index;
      const startLine = content.substring(0, startIndex).split('\n').length;
      
      // Extract the interface body
      const interfaceBody = this.extractInterfaceBody(content, startIndex);
      
      // Check if incomplete
      const issues = this.checkIncomplete(interfaceBody);
      if (issues.length > 0) {
        this.incompleteInterfaces.push({
          file: filePath,
          name: interfaceName,
          line: startLine,
          issues: issues,
          body: interfaceBody.substring(0, 200) + (interfaceBody.length > 200 ? '...' : '')
        });
      }
    }
  }

  extractInterfaceBody(content, startIndex) {
    let braceCount = 0;
    let inInterface = false;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inInterface = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inInterface && braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
    
    return content.substring(startIndex, endIndex);
  }

  checkIncomplete(interfaceBody) {
    const issues = [];
    
    // Check for empty interface
    if (/interface\s+\w+\s*{\s*}/.test(interfaceBody)) {
      issues.push('Empty interface');
    }
    
    // Check for TODO/FIXME
    if (/\/\/\s*(TODO|FIXME)/i.test(interfaceBody)) {
      issues.push('Contains TODO/FIXME');
    }
    
    // Check for any types
    const anyMatches = interfaceBody.match(/:\s*any(?:\s*[;,}])/g);
    if (anyMatches) {
      issues.push(`Contains ${anyMatches.length} 'any' types`);
    }
    
    // Check for unknown types
    const unknownMatches = interfaceBody.match(/:\s*unknown(?:\s*[;,}])/g);
    if (unknownMatches) {
      issues.push(`Contains ${unknownMatches.length} 'unknown' types`);
    }
    
    // Check for Function types
    if (/:\s*Function(?:\s*[;,}])/.test(interfaceBody)) {
      issues.push('Contains generic Function type');
    }
    
    // Check for object types
    if (/:\s*object(?:\s*[;,}])/.test(interfaceBody)) {
      issues.push('Contains generic object type');
    }
    
    // Check for index signature with any
    if (/\[key:\s*string\]:\s*any/.test(interfaceBody)) {
      issues.push('Index signature with any');
    }
    
    return issues;
  }

  generateReport() {
    // Group by issue type
    const byIssue = {};
    this.incompleteInterfaces.forEach(item => {
      item.issues.forEach(issue => {
        if (!byIssue[issue]) {
          byIssue[issue] = [];
        }
        byIssue[issue].push(item);
      });
    });
    
    // Group by file
    const byFile = {};
    this.incompleteInterfaces.forEach(item => {
      const relPath = path.relative(process.cwd(), item.file);
      if (!byFile[relPath]) {
        byFile[relPath] = [];
      }
      byFile[relPath].push(item);
    });
    
    return {
      summary: {
        totalInterfaces: this.totalInterfaces,
        incompleteInterfaces: this.incompleteInterfaces.length,
        completionRate: ((this.totalInterfaces - this.incompleteInterfaces.length) / this.totalInterfaces * 100).toFixed(1) + '%',
        filesAnalyzed: this.fileCount,
        filesWithIssues: Object.keys(byFile).length
      },
      byIssue,
      byFile,
      topIssues: Object.entries(byIssue)
        .map(([issue, items]) => ({ issue, count: items.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  }
}

// Main execution
console.log('🔍 Searching for incomplete TypeScript interfaces...\n');

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
});

const analyzer = new InterfaceAnalyzer();

files.forEach(file => {
  analyzer.fileCount++;
  analyzer.analyzeFile(file);
});

const report = analyzer.generateReport();

// Display report
console.log('📊 Interface Analysis Report\n');
console.log('Summary:');
console.log(`  Total Interfaces: ${report.summary.totalInterfaces}`);
console.log(`  Incomplete Interfaces: ${report.summary.incompleteInterfaces}`);
console.log(`  Completion Rate: ${report.summary.completionRate}`);
console.log(`  Files Analyzed: ${report.summary.filesAnalyzed}`);
console.log(`  Files with Issues: ${report.summary.filesWithIssues}\n`);

console.log('Top Issues:');
report.topIssues.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.issue}: ${item.count} interfaces`);
});

console.log('\n\nMost Affected Files:');
const sortedFiles = Object.entries(report.byFile)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10);

sortedFiles.forEach(([file, interfaces]) => {
  console.log(`\n${file} (${interfaces.length} issues):`);
  interfaces.forEach(item => {
    console.log(`  - ${item.name} (line ${item.line}): ${item.issues.join(', ')}`);
  });
});

// Save detailed report
const detailedReport = {
  ...report,
  interfaces: analyzer.incompleteInterfaces
};

fs.writeFileSync('incomplete-interfaces-report.json', JSON.stringify(detailedReport, null, 2));
console.log('\n\n✅ Detailed report saved to incomplete-interfaces-report.json');

// Generate migration suggestions
console.log('\n\n🔧 Migration Suggestions:\n');

// Suggest fixes for common patterns
if (report.byIssue['Empty interface']) {
  console.log('Empty Interfaces:');
  console.log('  Consider adding properties or removing if unused');
  console.log(`  Found in ${report.byIssue['Empty interface'].length} locations\n`);
}

if (report.byIssue["Contains 1 'any' types"] || report.byIssue["Contains 2 'any' types"]) {
  console.log('Any Types:');
  console.log('  Replace with specific types:');
  console.log('  - any[] → Array<SpecificType>');
  console.log('  - any → unknown (if type is truly unknown)');
  console.log('  - any → specific interface or type union\n');
}

if (report.byIssue['Contains generic Function type']) {
  console.log('Function Types:');
  console.log('  Replace with specific function signatures:');
  console.log('  - Function → () => void');
  console.log('  - Function → (param: Type) => ReturnType\n');
}
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const crypto = require('crypto');

// Configuration
const MIN_LINES = 5; // Minimum lines to consider as duplication
const MIN_TOKENS = 20; // Minimum tokens to consider
const SIMILARITY_THRESHOLD = 0.85; // 85% similarity for similar code detection

class DuplicationAnalyzer {
  constructor() {
    this.codeBlocks = new Map();
    this.duplicates = [];
    this.totalLines = 0;
    this.duplicatedLines = 0;
  }

  // Extract code blocks from a file
  extractCodeBlocks(filePath, content) {
    const lines = content.split('\n');
    const blocks = [];
    
    // Extract functions and classes with more patterns
    const functionRegex = /^(\s*)(export\s+)?(async\s+)?function\s+(\w+)|^(\s*)(export\s+)?const\s+(\w+)\s*=\s*(async\s*)?\(|^(\s*)(export\s+)?class\s+(\w+)|^(\s*)(\w+):\s*(async\s*)?\(/gm;
    const matches = [...content.matchAll(functionRegex)];
    
    matches.forEach(match => {
      const startLine = content.substring(0, match.index).split('\n').length - 1;
      const block = this.extractBlock(lines, startLine);
      
      if (block.lines.length >= MIN_LINES) {
        blocks.push({
          file: filePath,
          name: match[4] || match[7] || match[12] || match[13] || 'anonymous',
          startLine,
          endLine: startLine + block.lines.length,
          lines: block.lines,
          content: block.content,
          hash: this.hashContent(block.content),
          type: match[0].includes('class') ? 'class' : 'function'
        });
      }
    });
    
    // Also extract JSX components and large object literals
    this.extractJSXComponents(filePath, lines, blocks);
    this.extractObjectLiterals(filePath, lines, blocks);
    this.extractHooks(filePath, lines, blocks);
    this.extractConstants(filePath, lines, blocks);
    
    return blocks;
  }

  // Extract a code block starting from a line
  extractBlock(lines, startLine) {
    const blockLines = [];
    let braceCount = 0;
    let inBlock = false;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      blockLines.push(line);
      
      // Count braces
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          inBlock = true;
        } else if (char === '}') {
          braceCount--;
        }
      }
      
      // Check if block is complete
      if (inBlock && braceCount === 0) {
        break;
      }
    }
    
    return {
      lines: blockLines,
      content: blockLines.join('\n')
    };
  }

  // Extract JSX components
  extractJSXComponents(filePath, lines, blocks) {
    const componentRegex = /^(\s*)(export\s+)?(default\s+)?(\w+):\s*React\.(FC|FunctionComponent)|return\s*\(/gm;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('return (') && i > 0) {
        const block = this.extractJSXBlock(lines, i);
        if (block.lines.length >= MIN_LINES) {
          blocks.push({
            file: filePath,
            name: 'JSX Component',
            startLine: i,
            endLine: i + block.lines.length,
            lines: block.lines,
            content: block.content,
            hash: this.hashContent(block.content),
            type: 'jsx'
          });
        }
      }
    }
  }

  // Extract JSX block
  extractJSXBlock(lines, startLine) {
    const blockLines = [];
    let parenCount = 0;
    let inBlock = false;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      blockLines.push(line);
      
      // Count parentheses for JSX
      for (const char of line) {
        if (char === '(') {
          parenCount++;
          inBlock = true;
        } else if (char === ')') {
          parenCount--;
        }
      }
      
      if (inBlock && parenCount === 0) {
        break;
      }
    }
    
    return {
      lines: blockLines,
      content: blockLines.join('\n')
    };
  }

  // Extract large object literals (like styles)
  extractObjectLiterals(filePath, lines, blocks) {
    const patterns = [
      /StyleSheet\.create/,
      /const\s+\w+Styles\s*=/,
      /export\s+const\s+\w+\s*=\s*\{/,
      /const\s+\w+\s*=\s*\{\s*$/
    ];
    
    for (let i = 0; i < lines.length; i++) {
      if (patterns.some(pattern => pattern.test(lines[i]))) {
        const block = this.extractBlock(lines, i);
        if (block.lines.length >= MIN_LINES) {
          blocks.push({
            file: filePath,
            name: lines[i].match(/const\s+(\w+)/)?.[1] || 'object',
            startLine: i,
            endLine: i + block.lines.length,
            lines: block.lines,
            content: block.content,
            hash: this.hashContent(block.content),
            type: 'object'
          });
        }
      }
    }
  }

  // Extract React hooks
  extractHooks(filePath, lines, blocks) {
    const hookRegex = /^(\s*)const\s+(use\w+)\s*=\s*\(/gm;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/const\s+use\w+\s*=/)) {
        const block = this.extractBlock(lines, i);
        if (block.lines.length >= MIN_LINES) {
          blocks.push({
            file: filePath,
            name: lines[i].match(/const\s+(use\w+)/)?.[1] || 'hook',
            startLine: i,
            endLine: i + block.lines.length,
            lines: block.lines,
            content: block.content,
            hash: this.hashContent(block.content),
            type: 'hook'
          });
        }
      }
    }
  }

  // Extract constants and arrays
  extractConstants(filePath, lines, blocks) {
    const constantRegex = /^(\s*)(export\s+)?const\s+(\w+)\s*=\s*\[/gm;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/const\s+\w+\s*=\s*\[/)) {
        const block = this.extractArrayBlock(lines, i);
        if (block.lines.length >= MIN_LINES) {
          blocks.push({
            file: filePath,
            name: lines[i].match(/const\s+(\w+)/)?.[1] || 'array',
            startLine: i,
            endLine: i + block.lines.length,
            lines: block.lines,
            content: block.content,
            hash: this.hashContent(block.content),
            type: 'array'
          });
        }
      }
    }
  }

  // Extract array block
  extractArrayBlock(lines, startLine) {
    const blockLines = [];
    let bracketCount = 0;
    let inBlock = false;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      blockLines.push(line);
      
      // Count brackets for arrays
      for (const char of line) {
        if (char === '[') {
          bracketCount++;
          inBlock = true;
        } else if (char === ']') {
          bracketCount--;
        }
      }
      
      if (inBlock && bracketCount === 0) {
        break;
      }
    }
    
    return {
      lines: blockLines,
      content: blockLines.join('\n')
    };
  }

  // Hash content for comparison
  hashContent(content) {
    // Normalize whitespace and remove comments for better matching
    const normalized = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  // Calculate similarity between two code blocks
  calculateSimilarity(block1, block2) {
    const tokens1 = this.tokenize(block1.content);
    const tokens2 = this.tokenize(block2.content);
    
    if (tokens1.length < MIN_TOKENS || tokens2.length < MIN_TOKENS) {
      return 0;
    }
    
    const commonTokens = this.countCommonTokens(tokens1, tokens2);
    const similarity = (2 * commonTokens) / (tokens1.length + tokens2.length);
    
    return similarity;
  }

  // Tokenize code for similarity comparison
  tokenize(code) {
    return code
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  // Count common tokens
  countCommonTokens(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    let count = 0;
    
    for (const token of set1) {
      if (set2.has(token)) {
        count++;
      }
    }
    
    return count;
  }

  // Analyze all files
  analyzeFiles(files) {
    console.log(`\n📊 Analyzing ${files.length} files for duplication...\n`);
    
    // Extract all code blocks
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const blocks = this.extractCodeBlocks(file, content);
      
      blocks.forEach(block => {
        const key = block.hash;
        if (!this.codeBlocks.has(key)) {
          this.codeBlocks.set(key, []);
        }
        this.codeBlocks.get(key).push(block);
      });
      
      this.totalLines += content.split('\n').length;
    });
    
    // Find exact duplicates
    for (const [hash, blocks] of this.codeBlocks.entries()) {
      if (blocks.length > 1) {
        const duplicateGroup = {
          hash,
          blocks,
          lineCount: blocks[0].lines.length,
          instances: blocks.length,
          totalDuplicatedLines: blocks[0].lines.length * (blocks.length - 1),
          similarity: 1.0
        };
        
        this.duplicates.push(duplicateGroup);
        this.duplicatedLines += duplicateGroup.totalDuplicatedLines;
      }
    }
    
    // Find similar code blocks (not exact duplicates)
    const allBlocks = Array.from(this.codeBlocks.values()).flat();
    const processedPairs = new Set();
    
    for (let i = 0; i < allBlocks.length; i++) {
      for (let j = i + 1; j < allBlocks.length; j++) {
        const block1 = allBlocks[i];
        const block2 = allBlocks[j];
        
        // Skip if same hash (already handled) or from same file
        if (block1.hash === block2.hash || block1.file === block2.file) continue;
        
        // Create unique pair ID
        const pairId = `${block1.hash}-${block2.hash}`;
        const reversePairId = `${block2.hash}-${block1.hash}`;
        
        if (processedPairs.has(pairId) || processedPairs.has(reversePairId)) continue;
        processedPairs.add(pairId);
        
        const similarity = this.calculateSimilarity(block1, block2);
        
        if (similarity >= SIMILARITY_THRESHOLD && similarity < 1.0) {
          const similarGroup = {
            hash: `similar-${this.duplicates.length}`,
            blocks: [block1, block2],
            lineCount: Math.max(block1.lines.length, block2.lines.length),
            instances: 2,
            totalDuplicatedLines: Math.min(block1.lines.length, block2.lines.length),
            similarity
          };
          
          this.duplicates.push(similarGroup);
          this.duplicatedLines += similarGroup.totalDuplicatedLines;
        }
      }
    }
    
    // Sort duplicates by impact (total duplicated lines)
    this.duplicates.sort((a, b) => b.totalDuplicatedLines - a.totalDuplicatedLines);
  }

  // Generate report
  generateReport() {
    const report = {
      summary: {
        totalFiles: 0,
        totalLines: this.totalLines,
        duplicatedLines: this.duplicatedLines,
        duplicationRatio: (this.duplicatedLines / this.totalLines * 100).toFixed(2) + '%',
        duplicateGroups: this.duplicates.length,
        potentialSavings: this.calculatePotentialSavings()
      },
      topDuplicates: this.duplicates.slice(0, 10).map(dup => ({
        type: dup.blocks[0].type,
        name: dup.blocks[0].name,
        lineCount: dup.lineCount,
        instances: dup.instances,
        totalDuplicatedLines: dup.totalDuplicatedLines,
        locations: dup.blocks.map(b => ({
          file: path.relative(process.cwd(), b.file),
          lines: `${b.startLine + 1}-${b.endLine + 1}`
        }))
      })),
      byType: this.analyzeByType(),
      recommendations: this.generateRecommendations(),
      similarityAnalysis: this.analyzeSimilarCode()
    };
    
    return report;
  }

  // Calculate potential savings
  calculatePotentialSavings() {
    let savings = 0;
    
    this.duplicates.forEach(dup => {
      // Each duplicate group could be refactored into a shared component/function
      savings += dup.lineCount * (dup.instances - 1);
    });
    
    return savings;
  }

  // Analyze duplication by type
  analyzeByType() {
    const byType = {};
    
    this.duplicates.forEach(dup => {
      const type = dup.blocks[0].type;
      if (!byType[type]) {
        byType[type] = {
          count: 0,
          totalLines: 0,
          examples: []
        };
      }
      
      byType[type].count++;
      byType[type].totalLines += dup.totalDuplicatedLines;
      
      if (byType[type].examples.length < 3) {
        byType[type].examples.push({
          name: dup.blocks[0].name,
          lineCount: dup.lineCount,
          instances: dup.instances
        });
      }
    });
    
    return byType;
  }

  // Analyze similar code patterns
  analyzeSimilarCode() {
    const similarGroups = this.duplicates.filter(d => d.similarity && d.similarity < 1.0);
    return {
      count: similarGroups.length,
      averageSimilarity: similarGroups.length > 0 
        ? (similarGroups.reduce((sum, g) => sum + g.similarity, 0) / similarGroups.length).toFixed(2)
        : 0,
      potentialRefactoring: similarGroups.reduce((sum, g) => sum + g.totalDuplicatedLines, 0)
    };
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];
    
    // Check for style duplication
    const styleDuplicates = this.duplicates.filter(d => d.blocks[0].type === 'styles' || d.blocks[0].type === 'object');
    if (styleDuplicates.length > 3) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Styles',
        issue: `Found ${styleDuplicates.length} duplicate style/object definitions`,
        solution: 'Create a shared styles file or use a design system',
        estimatedSavings: styleDuplicates.reduce((sum, d) => sum + d.totalDuplicatedLines, 0)
      });
    }
    
    // Check for component duplication
    const componentDuplicates = this.duplicates.filter(d => d.blocks[0].type === 'jsx');
    if (componentDuplicates.length > 2) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Components',
        issue: `Found ${componentDuplicates.length} duplicate JSX components`,
        solution: 'Extract shared components to a common directory',
        estimatedSavings: componentDuplicates.reduce((sum, d) => sum + d.totalDuplicatedLines, 0)
      });
    }
    
    // Check for function duplication
    const functionDuplicates = this.duplicates.filter(d => d.blocks[0].type === 'function');
    if (functionDuplicates.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Functions',
        issue: `Found ${functionDuplicates.length} duplicate functions`,
        solution: 'Create utility modules for shared functions',
        estimatedSavings: functionDuplicates.reduce((sum, d) => sum + d.totalDuplicatedLines, 0)
      });
    }
    
    // Check for hook duplication
    const hookDuplicates = this.duplicates.filter(d => d.blocks[0].type === 'hook');
    if (hookDuplicates.length > 2) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Hooks',
        issue: `Found ${hookDuplicates.length} duplicate React hooks`,
        solution: 'Extract shared hooks to a hooks directory',
        estimatedSavings: hookDuplicates.reduce((sum, d) => sum + d.totalDuplicatedLines, 0)
      });
    }
    
    // Check for similar code
    const similarGroups = this.duplicates.filter(d => d.similarity && d.similarity < 1.0);
    if (similarGroups.length > 10) {
      recommendations.push({
        priority: 'LOW',
        category: 'Similar Code',
        issue: `Found ${similarGroups.length} similar code blocks (85%+ similarity)`,
        solution: 'Consider abstracting common patterns',
        estimatedSavings: similarGroups.reduce((sum, d) => sum + d.totalDuplicatedLines, 0)
      });
    }
    
    return recommendations;
  }
}

// Main execution
const analyzer = new DuplicationAnalyzer();

// Find all TypeScript/JavaScript files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
});

// Analyze files
analyzer.analyzeFiles(files);

// Generate and display report
const report = analyzer.generateReport();
report.summary.totalFiles = files.length;

console.log('📋 Code Duplication Analysis Report\n');
console.log('Summary:');
console.log(`  Total Files: ${report.summary.totalFiles}`);
console.log(`  Total Lines: ${report.summary.totalLines.toLocaleString()}`);
console.log(`  Duplicated Lines: ${report.summary.duplicatedLines.toLocaleString()}`);
console.log(`  Duplication Ratio: ${report.summary.duplicationRatio}`);
console.log(`  Duplicate Groups: ${report.summary.duplicateGroups}`);
console.log(`  Potential Savings: ${report.summary.potentialSavings.toLocaleString()} lines\n`);

console.log('Top 10 Duplicates:');
report.topDuplicates.forEach((dup, index) => {
  console.log(`\n${index + 1}. ${dup.type}: ${dup.name}`);
  console.log(`   Lines: ${dup.lineCount} | Instances: ${dup.instances} | Total Duplicated: ${dup.totalDuplicatedLines}`);
  console.log('   Locations:');
  dup.locations.forEach(loc => {
    console.log(`     - ${loc.file}:${loc.lines}`);
  });
});

console.log('\n\nDuplication by Type:');
Object.entries(report.byType).forEach(([type, data]) => {
  console.log(`\n${type}:`);
  console.log(`  Count: ${data.count}`);
  console.log(`  Total Lines: ${data.totalLines.toLocaleString()}`);
  if (data.examples.length > 0) {
    console.log('  Examples:');
    data.examples.forEach(ex => {
      console.log(`    - ${ex.name} (${ex.lineCount} lines, ${ex.instances} instances)`);
    });
  }
});

console.log('\n\nRecommendations:');
report.recommendations.forEach((rec, index) => {
  console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}`);
  console.log(`   Issue: ${rec.issue}`);
  console.log(`   Solution: ${rec.solution}`);
  console.log(`   Estimated Savings: ${rec.estimatedSavings.toLocaleString()} lines`);
});

if (report.similarityAnalysis && report.similarityAnalysis.count > 0) {
  console.log('\n\nSimilar Code Analysis:');
  console.log(`  Similar Groups: ${report.similarityAnalysis.count}`);
  console.log(`  Average Similarity: ${report.similarityAnalysis.averageSimilarity}`);
  console.log(`  Potential Refactoring: ${report.similarityAnalysis.potentialRefactoring.toLocaleString()} lines`);
}

// Save detailed report
fs.writeFileSync('code-duplication-report.json', JSON.stringify(report, null, 2));
console.log('\n\n✅ Detailed report saved to code-duplication-report.json');
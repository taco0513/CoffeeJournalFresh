#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 이모지 제거로 인한 Logger 구문 오류 수정
function fixLoggerSyntax() {
  const srcDir = '/Users/zimo_mbp16_m1max/Projects/CoffeeJournalFresh-20250720-oauth-admin/src';
  
  // TypeScript 파일들 찾기
  const files = glob.sync('**/*.{ts,tsx}', { cwd: srcDir });
  
  let fixedCount = 0;
  let totalFiles = 0;
  
  files.forEach(file => {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 패턴 1: Logger.debug abc', -> Logger.debug('abc',
    content = content.replace(
      /(Logger\.(debug|error|info|warn))\s+([^'"`][^,]*)',/g,
      "$1('$3',"
    );
    
    // 패턴 2: Logger.debug abc`, -> Logger.debug(`abc`,
    content = content.replace(
      /(Logger\.(debug|error|info|warn))\s+([^'"`][^,]*)\`,/g,
      "$1(`$3`,"
    );
    
    // 패턴 3: Logger.debug abc"); -> Logger.debug("abc");
    content = content.replace(
      /(Logger\.(debug|error|info|warn))\s+([^'"`][^)]*)\)/g,
      "$1('$3')"
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
    totalFiles++;
  });
  
  console.log(`\n📊 Results:`);
  console.log(`Total files checked: ${totalFiles}`);
  console.log(`Files fixed: ${fixedCount}`);
}

fixLoggerSyntax();
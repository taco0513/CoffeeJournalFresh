#!/bin/bash

echo "🔧 Logger 구문 오류 일괄 수정 시작..."

# find all TypeScript files with Logger syntax errors
find src -name "*.ts" -o -name "*.tsx" | while IFS= read -r file; do
    echo "Processing: $file"
    
    # Fix Logger.debug patterns
    sed -i '' 's/Logger\.debug \([^'"'"'"`][^:]*:\)/Logger.debug('"'"'\1/g' "$file"
    sed -i '' 's/Logger\.error \([^'"'"'"`][^:]*:\)/Logger.error('"'"'\1/g' "$file"
    sed -i '' 's/Logger\.info \([^'"'"'"`][^:]*:\)/Logger.info('"'"'\1/g' "$file"
    sed -i '' 's/Logger\.warn \([^'"'"'"`][^:]*:\)/Logger.warn('"'"'\1/g' "$file"
    
    # Fix template literal patterns with backticks
    sed -i '' 's/Logger\.debug \([^'"'"'"`][^$}]*\${[^}]*}[^'"'"'`]*\)`,/Logger.debug(`\1`,/g' "$file"
    sed -i '' 's/Logger\.error \([^'"'"'"`][^$}]*\${[^}]*}[^'"'"'`]*\)`,/Logger.error(`\1`,/g' "$file"
done

echo "✅ Logger 구문 오류 수정 완료!"
echo "📊 남은 오류 확인 중..."

# Check remaining errors
remaining=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -n "Logger\.\(debug\|error\|info\|warn\) [^'\"]*'" | wc -l)
echo "남은 오류: $remaining 개"

if [ "$remaining" -eq 0 ]; then
    echo "🎉 모든 Logger 구문 오류가 수정되었습니다!"
else
    echo "⚠️  아직 수정되지 않은 오류들:"
    find src -name "*.ts" -o -name "*.tsx" | xargs grep -n "Logger\.\(debug\|error\|info\|warn\) [^'\"]*'" | head -5
fi
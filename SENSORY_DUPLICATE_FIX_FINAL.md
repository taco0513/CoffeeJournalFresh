# Sensory Evaluation Duplicate Fix - Final Solution

## Problem
Users could select the same Korean expression multiple times across different categories, causing duplicates like "묵직한", "바닐라", "꿀 같은" to appear multiple times in the preview box.

## Root Cause
The previous deduplication was using `expressionId` as the unique key, but the same Korean expression can have different IDs in different categories. This allowed the same text to be selected multiple times.

## Solution Implemented

### 1. Store-Level Deduplication (tastingStore.ts:98-114)
Changed deduplication to use Korean text as the unique identifier:
```typescript
const uniqueKey = expr.korean; // Instead of expr.expressionId
```

### 2. Component-Level Prevention (CompactSensoryEvaluation.tsx:52-75)
Added check to prevent selecting already-selected Korean expressions:
```typescript
const koreanAlreadySelected = currentExpressions.some(
  item => item.expression.korean === expression.korean
);

if (koreanAlreadySelected) {
  return; // Prevent duplicate selection
}
```

### 3. Visual Feedback (CompactSensoryEvaluation.tsx:168-201)
Added visual indicators for globally selected expressions:
- Grayed out appearance with strikethrough text
- "이미 선택됨" (Already Selected) overlay
- Disabled interaction

## Result
- ✅ No more duplicate Korean expressions in preview box
- ✅ Clear visual feedback showing which expressions are already selected
- ✅ Proper disabled state preventing re-selection
- ✅ Each unique Korean expression can only be selected once across all categories
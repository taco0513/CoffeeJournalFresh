import { SelectedSensoryExpression } from '../types/tasting';

// Create a simple test for the deduplication logic
function deduplicateExpressions(expressions: SelectedSensoryExpression[]): SelectedSensoryExpression[] {
  const seen = new Set<string>();
  return expressions.filter(expr => {
    const uniqueKey = expr.korean;
    if (seen.has(uniqueKey)) {
      return false;
    }
    seen.add(uniqueKey);
    return true;
  });
}

describe('Sensory Expression Deduplication Logic', () => {
  test('should deduplicate expressions based on Korean text', () => {
    // Create test expressions with same Korean text but different IDs
    const expressions: SelectedSensoryExpression[] = [
      {
        categoryId: 'acidity',
        expressionId: 'expr1',
        korean: '묵직한',
        english: 'Heavy',
        emoji: '💪',
        intensity: 3,
        selected: true,
      },
      {
        categoryId: 'body',
        expressionId: 'expr2', // Different ID
        korean: '묵직한', // Same Korean text
        english: 'Heavy',
        emoji: '💪',
        intensity: 3,
        selected: true,
      },
      {
        categoryId: 'sweetness',
        expressionId: 'expr3',
        korean: '바닐라',
        english: 'Vanilla',
        emoji: '🍦',
        intensity: 3,
        selected: true,
      },
    ];

    // Apply deduplication
    const deduplicated = deduplicateExpressions(expressions);

    // Should only have 2 expressions (duplicated '묵직한' should be filtered out)
    expect(deduplicated).toHaveLength(2);
    
    // Check that we have one '묵직한' and one '바닐라'
    const koreanTexts = deduplicated.map(expr => expr.korean);
    expect(koreanTexts).toContain('묵직한');
    expect(koreanTexts).toContain('바닐라');
    expect(koreanTexts.filter(text => text === '묵직한')).toHaveLength(1);
  });

  test('should allow different Korean expressions', () => {
    const expressions: SelectedSensoryExpression[] = [
      {
        categoryId: 'acidity',
        expressionId: 'expr1',
        korean: '싱그러운',
        english: 'Fresh',
        emoji: '🌿',
        intensity: 3,
        selected: true,
      },
      {
        categoryId: 'sweetness',
        expressionId: 'expr2',
        korean: '달콤한',
        english: 'Sweet',
        emoji: '🍯',
        intensity: 3,
        selected: true,
      },
    ];

    const deduplicated = deduplicateExpressions(expressions);

    // Should have both expressions since they have different Korean text
    expect(deduplicated).toHaveLength(2);
  });

  test('should handle empty array', () => {
    const expressions: SelectedSensoryExpression[] = [];
    const deduplicated = deduplicateExpressions(expressions);
    expect(deduplicated).toHaveLength(0);
  });

  test('should preserve first occurrence when duplicates exist', () => {
    const expressions: SelectedSensoryExpression[] = [
      {
        categoryId: 'acidity',
        expressionId: 'expr1',
        korean: '묵직한',
        english: 'Heavy',
        emoji: '💪',
        intensity: 3,
        selected: true,
      },
      {
        categoryId: 'body',
        expressionId: 'expr2',
        korean: '묵직한', // Duplicate
        english: 'Heavy',
        emoji: '💪',
        intensity: 2, // Different intensity
        selected: true,
      },
    ];

    const deduplicated = deduplicateExpressions(expressions);
    
    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0].categoryId).toBe('acidity'); // First occurrence
    expect(deduplicated[0].intensity).toBe(3); // First occurrence values
  });
});
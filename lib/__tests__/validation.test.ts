import {
  validateSensoryExpressions,
  validateCoffeeInfo,
  validateEmail,
  validateRating,
  validateKoreanText,
  sanitizeUserInput,
  validateBatch
} from '../validation';
import { SelectedSensoryExpression } from '../../src/types/tasting';

describe('Validation Library', () => {
  describe('validateSensoryExpressions', () => {
    const createExpression = (id: string, korean: string, categoryId: string): SelectedSensoryExpression => ({
      categoryId,
      expressionId: id,
      korean,
      english: 'English',
      emoji: '👍',
      intensity: 3,
      selected: true,
    });

    test('should pass validation for valid expressions', () => {
      const expressions = [
        createExpression('1', '묵직한', 'body'),
        createExpression('2', '달콤한', 'sweetness'),
        createExpression('3', '싱그러운', 'acidity'),
      ];

      const result = validateSensoryExpressions(expressions);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect duplicate Korean expressions', () => {
      const expressions = [
        createExpression('1', '묵직한', 'body'),
        createExpression('2', '묵직한', 'acidity'), // Same Korean text
        createExpression('3', '달콤한', 'sweetness'),
      ];

      const result = validateSensoryExpressions(expressions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate Korean expressions found: 묵직한');
    });

    test('should allow duplicates when allowDuplicates is true', () => {
      const expressions = [
        createExpression('1', '묵직한', 'body'),
        createExpression('2', '묵직한', 'acidity'),
      ];

      const result = validateSensoryExpressions(expressions, { allowDuplicates: true });
      
      expect(result.isValid).toBe(true);
    });

    test('should enforce category limits', () => {
      const expressions = [
        createExpression('1', '묵직한', 'body'),
        createExpression('2', '부드러운', 'body'),
        createExpression('3', '크리미한', 'body'),
        createExpression('4', '벨벳같은', 'body'), // 4th in same category
      ];

      const result = validateSensoryExpressions(expressions, { maxPerCategory: 3 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Category 'body' has 4 expressions (max: 3)");
    });

    test('should warn about missing required categories', () => {
      const expressions = [
        createExpression('1', '묵직한', 'body'),
      ];

      const result = validateSensoryExpressions(expressions, { 
        requiredCategories: ['acidity', 'sweetness'] 
      });
      
      expect(result.isValid).toBe(true); // Warnings don't make it invalid
      expect(result.warnings).toContain("Required category 'acidity' has no expressions");
      expect(result.warnings).toContain("Required category 'sweetness' has no expressions");
    });

    test('should detect empty Korean text', () => {
      const expressions = [
        { ...createExpression('1', '', 'body'), korean: '' },
      ];

      const result = validateSensoryExpressions(expressions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expression at index 0 has empty Korean text');
    });

    test('should detect empty expressionId', () => {
      const expressions = [
        { ...createExpression('', '묵직한', 'body'), expressionId: '' },
      ];

      const result = validateSensoryExpressions(expressions);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Expression at index 0 has empty expressionId');
    });
  });

  describe('validateCoffeeInfo', () => {
    test('should pass validation for valid coffee info', () => {
      const coffeeInfo = {
        coffeeName: 'Ethiopia Yirgacheffe',
        roastery: 'Blue Bottle',
        origin: 'Ethiopia',
        temperature: 'hot' as const,
      };

      const result = validateCoffeeInfo(coffeeInfo);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should require coffee name', () => {
      const coffeeInfo = {
        roastery: 'Blue Bottle',
      };

      const result = validateCoffeeInfo(coffeeInfo);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Coffee name is required');
    });

    test('should validate temperature values', () => {
      const coffeeInfo = {
        coffeeName: 'Test Coffee',
        temperature: 'warm' as any, // Invalid temperature
      };

      const result = validateCoffeeInfo(coffeeInfo);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Temperature must be either "hot" or "cold"');
    });

    test('should provide warnings for missing recommended fields', () => {
      const coffeeInfo = {
        coffeeName: 'Test Coffee',
      };

      const result = validateCoffeeInfo(coffeeInfo);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Roastery information is recommended');
      expect(result.warnings).toContain('Origin information is recommended');
    });
  });

  describe('validateEmail', () => {
    test('should pass validation for valid email', () => {
      const result = validateEmail('user@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for invalid email format', () => {
      const result = validateEmail('invalid-email');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('should require email', () => {
      const result = validateEmail('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });
  });

  describe('validateRating', () => {
    test('should pass validation for valid ratings', () => {
      [1, 2, 3, 4, 5].forEach(rating => {
        const result = validateRating(rating);
        expect(result.isValid).toBe(true);
      });
    });

    test('should fail validation for out of range ratings', () => {
      const result1 = validateRating(0);
      const result2 = validateRating(6);
      
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Rating must be between 1 and 5');
      
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Rating must be between 1 and 5');
    });

    test('should fail validation for non-integer ratings', () => {
      const result = validateRating(3.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Rating must be a whole number');
    });

    test('should fail validation for non-number input', () => {
      const result = validateRating('3' as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Rating must be a number');
    });
  });

  describe('validateKoreanText', () => {
    test('should pass validation for valid Korean text', () => {
      const result = validateKoreanText('묵직한 바디감');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should require Korean characters', () => {
      const result = validateKoreanText('Heavy body');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text should contain Korean characters');
    });

    test('should enforce minimum length', () => {
      const result = validateKoreanText('가', { minLength: 2 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Korean text must be at least 2 characters');
    });

    test('should enforce maximum length', () => {
      const longText = '가'.repeat(101);
      const result = validateKoreanText(longText, { maxLength: 100 });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Korean text must not exceed 100 characters');
    });

    test('should require non-empty text', () => {
      const result = validateKoreanText('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Korean text is required');
    });
  });

  describe('sanitizeUserInput', () => {
    test('should trim whitespace', () => {
      const result = sanitizeUserInput('  hello world  ');
      expect(result).toBe('hello world');
    });

    test('should remove HTML tags', () => {
      const result = sanitizeUserInput('hello <script>alert("xss")</script> world');
      expect(result).toBe('hello alert("xss") world');
    });

    test('should normalize whitespace', () => {
      const result = sanitizeUserInput('hello    world\n\ntab\there');
      expect(result).toBe('hello world tab here');
    });

    test('should enforce max length', () => {
      const longText = 'a'.repeat(1500);
      const result = sanitizeUserInput(longText, 100);
      expect(result).toHaveLength(100);
    });

    test('should handle non-string input', () => {
      const result = sanitizeUserInput(null as any);
      expect(result).toBe('');
    });
  });

  describe('validateBatch', () => {
    const createTestValidator = (shouldFail: boolean) => (item: string) => ({
      isValid: !shouldFail,
      errors: shouldFail ? [`Invalid item: ${item}`] : [],
      warnings: ['Test warning']
    });

    test('should validate all items in batch', () => {
      const items = ['item1', 'item2', 'item3'];
      const result = validateBatch(items, createTestValidator(false));
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(3);
    });

    test('should collect all errors from failed validations', () => {
      const items = ['item1', 'item2'];
      const result = validateBatch(items, createTestValidator(true));
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item 0: Invalid item: item1');
      expect(result.errors).toContain('Item 1: Invalid item: item2');
    });

    test('should handle empty batch', () => {
      const result = validateBatch([], createTestValidator(false));
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
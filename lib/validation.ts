/**
 * Validation library for CupNote app
 * Provides validation functions for sensory expressions, coffee data, and user inputs
 */

import { SelectedSensoryExpression } from '../src/types/tasting';

// Korean sensory expression validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SensoryExpressionValidationOptions {
  maxPerCategory?: number;
  allowDuplicates?: boolean;
  requiredCategories?: string[];
}

/**
 * Validates sensory expressions to prevent duplicates and enforce limits
 */
export function validateSensoryExpressions(
  expressions: SelectedSensoryExpression[],
  options: SensoryExpressionValidationOptions = {}
): ValidationResult {
  const {
    maxPerCategory = 3,
    allowDuplicates = false,
    requiredCategories = []
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicate Korean expressions
  if (!allowDuplicates) {
    const koreanTexts = expressions.map(expr => expr.korean);
    const duplicates = koreanTexts.filter((text, index) => koreanTexts.indexOf(text) !== index);
    
    if (duplicates.length > 0) {
      errors.push(`Duplicate Korean expressions found: ${[...new Set(duplicates)].join(', ')}`);
    }
  }

  // Check category limits
  const categoryGroups = expressions.reduce((acc, expr) => {
    if (!acc[expr.categoryId]) {
      acc[expr.categoryId] = [];
    }
    acc[expr.categoryId].push(expr);
    return acc;
  }, {} as Record<string, SelectedSensoryExpression[]>);

  Object.entries(categoryGroups).forEach(([categoryId, categoryExpressions]) => {
    if (categoryExpressions.length > maxPerCategory) {
      errors.push(`Category '${categoryId}' has ${categoryExpressions.length} expressions (max: ${maxPerCategory})`);
    }
  });

  // Check required categories
  requiredCategories.forEach(categoryId => {
    if (!categoryGroups[categoryId] || categoryGroups[categoryId].length === 0) {
      warnings.push(`Required category '${categoryId}' has no expressions`);
    }
  });

  // Check for empty expressions
  expressions.forEach((expr, index) => {
    if (!expr.korean || expr.korean.trim() === '') {
      errors.push(`Expression at index ${index} has empty Korean text`);
    }
    if (!expr.expressionId || expr.expressionId.trim() === '') {
      errors.push(`Expression at index ${index} has empty expressionId`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Coffee information validation
 */
export interface CoffeeInfo {
  cafeName?: string;
  roastery?: string;
  coffeeName?: string;
  origin?: string;
  variety?: string;
  process?: string;
  altitude?: string;
  roastLevel?: string;
  temperature?: 'hot' | 'cold';
}

export function validateCoffeeInfo(coffeeInfo: CoffeeInfo): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!coffeeInfo.coffeeName || coffeeInfo.coffeeName.trim() === '') {
    errors.push('Coffee name is required');
  }

  // Validate temperature
  if (coffeeInfo.temperature && !['hot', 'cold'].includes(coffeeInfo.temperature)) {
    errors.push('Temperature must be either "hot" or "cold"');
  }

  // Warnings for missing optional but recommended fields
  if (!coffeeInfo.roastery || coffeeInfo.roastery.trim() === '') {
    warnings.push('Roastery information is recommended');
  }

  if (!coffeeInfo.origin || coffeeInfo.origin.trim() === '') {
    warnings.push('Origin information is recommended');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * User input sanitization
 */
export function sanitizeUserInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags completely
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate rating (1-5 scale)
 */
export function validateRating(rating: number): ValidationResult {
  const errors: string[] = [];

  if (typeof rating !== 'number' || isNaN(rating)) {
    errors.push('Rating must be a number');
  } else if (rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  } else if (!Number.isInteger(rating)) {
    errors.push('Rating must be a whole number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate Korean text input
 */
export function validateKoreanText(text: string, options: { minLength?: number; maxLength?: number } = {}): ValidationResult {
  const { minLength = 1, maxLength = 100 } = options;
  const errors: string[] = [];

  if (!text || text.trim() === '') {
    errors.push('Korean text is required');
    return { isValid: false, errors };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < minLength) {
    errors.push(`Korean text must be at least ${minLength} characters`);
  }

  if (trimmedText.length > maxLength) {
    errors.push(`Korean text must not exceed ${maxLength} characters`);
  }

  // Check if contains some Korean characters (Hangul)
  const hasKorean = /[가-힣]/.test(trimmedText);
  if (!hasKorean) {
    errors.push('Text should contain Korean characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Batch validation utility
 */
export function validateBatch<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  items.forEach((item, index) => {
    const result = validator(item);
    if (!result.isValid) {
      result.errors.forEach(error => {
        allErrors.push(`Item ${index}: ${error}`);
      });
    }
    if (result.warnings) {
      result.warnings.forEach(warning => {
        allWarnings.push(`Item ${index}: ${warning}`);
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  };
}
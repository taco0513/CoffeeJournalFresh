import { HIGColors } from '../constants/HIG';

/**
 * Get color for difficulty level
 * Shared utility to avoid code duplication
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return HIGColors.systemGreen;
    case 'intermediate':
      return HIGColors.systemOrange;
    case 'advanced':
      return HIGColors.systemRed;
    default:
      return HIGColors.systemGray;
}
}

/**
 * Get Korean text for difficulty level
 * Shared utility to avoid code duplication
 */
export function getDifficultyText(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return '초보자';
    case 'intermediate':
      return '중급자';
    case 'advanced':
      return '고급자';
    default:
      return difficulty;
}
}

/**
 * Get difficulty level from numeric scale
 * Converts 1-5 scale to difficulty text
 */
export function getDifficultyLevel(value: number): string {
  if (value <= 2) return 'beginner';
  if (value <= 3) return 'intermediate';
  return 'advanced';
}
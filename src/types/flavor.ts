// Type definitions for flavor wheel data structures

export interface FlavorWheelData {
  level1: Record<string, string>;
  level2: Record<string, string[]>;
  level3: Record<string, string[]>;
  translations: Record<string, string>;
}

export interface TransformedFlavor {
  name: string;
  koreanName: string;
}

export interface TransformedSubcategory {
  name: string;
  koreanName: string;
  flavors: TransformedFlavor[];
}

export interface TransformedCategory {
  category: string;
  emoji: string;
  koreanName: string;
  subcategories: TransformedSubcategory[];
}

// Import FlavorPath from store
import type { FlavorPath } from '../stores/tastingStore';

// Props interfaces for extracted components
export interface FlavorChipProps {
  flavor: TransformedFlavor;
  isSelected: boolean;
  onPress: () => void;
}

export interface FlavorCategoryProps {
  category: TransformedCategory;
  isExpanded: boolean;
  selectedCount: number;
  onToggle: () => void;
  onSelectFlavor: (level1: string, level2: string, level3: string) => void;
  selectedPaths: FlavorPath[];
}

export interface SelectedFlavorsProps {
  selectedPaths: FlavorPath[];
  onRemove: (path: FlavorPath) => void;
}

// Re-export FlavorPath
export type { FlavorPath };
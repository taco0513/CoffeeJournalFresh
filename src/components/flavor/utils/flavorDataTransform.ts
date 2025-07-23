import { flavorWheelKorean } from '../../../data/flavorWheelKorean';
import { CATEGORY_EMOJIS } from '../constants';

export interface FlavorItem {
  name: string;
  koreanName: string;
}

export interface SubcategoryData {
  name: string;
  koreanName: string;
  flavors: FlavorItem[];
}

export interface CategoryData {
  category: string;
  emoji: string;
  koreanName: string;
  subcategories: SubcategoryData[];
}

// Transform flavorWheelKorean data into the expected format
export const transformFlavorData = (): CategoryData[] => {
  const result: CategoryData[] = [];
  const { level1, level2, level3, translations } = flavorWheelKorean;
  
  for (const [category, koreanName] of Object.entries(level1)) {
    const subcategories = level2[category as keyof typeof level2] || [];
    const subcategoryData = subcategories.map((subcat: string) => {
      const flavors = level3[subcat as keyof typeof level3] || [];
      return {
        name: subcat,
        koreanName: translations[subcat as keyof typeof translations] || subcat,
        flavors: flavors.map((flavor: string) => ({
          name: flavor,
          koreanName: flavor, // Korean flavors are already in Korean
        })),
      };
    });
    
    result.push({
      category,
      emoji: CATEGORY_EMOJIS[category] || '☕',
      koreanName: koreanName as string,
      subcategories: subcategoryData,
    });
  }
  
  return result;
};
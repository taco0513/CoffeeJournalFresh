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
    const subcategories = level2[category] || [];
    const subcategoryData = subcategories.map(subcat => {
      const flavors = level3[subcat] || [];
      return {
        name: subcat,
        koreanName: translations[subcat] || subcat,
        flavors: flavors.map(flavor => ({
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
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HIGColors, HIGConstants } from '../../styles/common';

interface FlavorNote {
  category: string;
  subcategory?: string;
  flavor: string;
  level: number; // 1-4 (level in hierarchy)
}

interface FlavorNotesVisualizationProps {
  flavorPaths: any[]; // FlavorPath array
  selectedExpressions?: any[]; // Korean sensory expressions
  title?: string;
  showHierarchy?: boolean;
}

export const FlavorNotesVisualization: React.FC<FlavorNotesVisualizationProps> = ({
  flavorPaths = [],
  selectedExpressions = [],
  title = '향미 노트',
  showHierarchy = true,
}) => {
  // Group flavor paths by category
  const groupedFlavors = flavorPaths.reduce((acc: any, path: any) => {
    const category = path.level1 || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(path);
    return acc;
  }, {});

  // Category colors mapping
  const categoryColors: { [key: string]: string } = {
    'Fruity': HIGColors.systemRed,
    'Floral': HIGColors.systemPurple,
    'Sweet': HIGColors.systemOrange,
    'Nutty/Cocoa': HIGColors.systemBrown,
    'Spices': HIGColors.systemYellow,
    'Roasted': HIGColors.systemGray,
    'Green/Vegetative': HIGColors.systemGreen,
    'Other': HIGColors.systemBlue,
    'Sour/Fermented': HIGColors.systemIndigo,
  };

  const getCategoryColor = (category: string): string => {
    return categoryColors[category] || HIGColors.systemBlue;
  };

  const formatFlavorPath = (path: any): string => {
    const parts = [];
    if (path.level1) parts.push(path.level1);
    if (path.level2) parts.push(path.level2);
    if (path.level3) parts.push(path.level3);
    if (path.level4) parts.push(path.level4);
    return parts.join(' › ');
  };

  // Group Korean sensory expressions by category
  const groupedExpressions = selectedExpressions.reduce((acc: any, expr: any) => {
    const category = expr.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expr);
    return acc;
  }, {});

  const expressionCategoryColors: { [key: string]: string } = {
    'acidity': HIGColors.systemGreen,
    'sweetness': HIGColors.systemOrange,
    'bitterness': HIGColors.systemBrown,
    'body': HIGColors.systemBlue,
    'aftertaste': HIGColors.systemPurple,
    'balance': HIGColors.systemIndigo,
  };

  const getExpressionCategoryColor = (category: string): string => {
    return expressionCategoryColors[category] || HIGColors.systemGray;
  };

  const getCategoryTitle = (category: string): string => {
    const titles: { [key: string]: string } = {
      'acidity': '산미',
      'sweetness': '단맛', 
      'bitterness': '쓴맛',
      'body': '바디감',
      'aftertaste': '여운',
      'balance': '균형감',
    };
    return titles[category] || category;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Flavor Notes Section */}
      {flavorPaths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍃 향미 프로필</Text>
          
          {showHierarchy ? (
            <View style={styles.hierarchyContainer}>
              {Object.entries(groupedFlavors).map(([category, flavors]: [string, any]) => (
                <View key={category} style={styles.categoryGroup}>
                  <View style={[styles.categoryHeader, { 
                    backgroundColor: getCategoryColor(category) + '20',
                    borderLeftColor: getCategoryColor(category),
                  }]}>
                    <Text style={[styles.categoryTitle, { color: getCategoryColor(category) }]}>
                      {category}
                    </Text>
                    <Text style={styles.categoryCount}>{flavors.length}</Text>
                  </View>
                  
                  <View style={styles.flavorList}>
                    {flavors.map((flavor: any, index: number) => (
                      <View key={index} style={styles.flavorItem}>
                        <View style={[styles.flavorDot, { 
                          backgroundColor: getCategoryColor(category) 
                        }]} />
                        <Text style={styles.flavorText}>
                          {formatFlavorPath(flavor)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {flavorPaths.map((path: any, index: number) => (
                  <View key={index} style={[styles.flavorChip, {
                    backgroundColor: getCategoryColor(path.level1 || 'Other') + '20',
                    borderColor: getCategoryColor(path.level1 || 'Other'),
                  }]}>
                    <Text style={[styles.chipText, {
                      color: getCategoryColor(path.level1 || 'Other'),
                    }]}>
                      {formatFlavorPath(path)}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Korean Sensory Expressions Section */}
      {selectedExpressions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ 감각 표현</Text>
          
          <View style={styles.expressionsContainer}>
            {Object.entries(groupedExpressions).map(([category, expressions]: [string, any]) => (
              <View key={category} style={styles.expressionGroup}>
                <View style={[styles.expressionHeader, {
                  backgroundColor: getExpressionCategoryColor(category) + '15',
                }]}>
                  <Text style={[styles.expressionCategoryTitle, {
                    color: getExpressionCategoryColor(category),
                  }]}>
                    {getCategoryTitle(category)}
                  </Text>
                </View>
                
                <View style={styles.expressionChips}>
                  {expressions.map((expr: any, index: number) => (
                    <View key={index} style={[styles.expressionChip, {
                      backgroundColor: getExpressionCategoryColor(category) + '20',
                      borderColor: getExpressionCategoryColor(category),
                    }]}>
                      <Text style={[styles.expressionText, {
                        color: getExpressionCategoryColor(category),
                      }]}>
                        {expr.korean}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty state */}
      {flavorPaths.length === 0 && selectedExpressions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🫗</Text>
          <Text style={styles.emptyText}>선택된 향미가 없습니다</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: HIGConstants.SPACING_MD,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_LG,
    textAlign: 'center',
  },
  section: {
    marginBottom: HIGConstants.SPACING_LG,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  hierarchyContainer: {
    gap: HIGConstants.SPACING_MD,
  },
  categoryGroup: {
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: HIGConstants.SPACING_SM,
    borderLeftWidth: 4,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '500',
    color: HIGColors.secondaryLabel,
  },
  flavorList: {
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingBottom: HIGConstants.SPACING_SM,
  },
  flavorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XS,
  },
  flavorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: HIGConstants.SPACING_SM,
  },
  flavorText: {
    fontSize: 13,
    color: HIGColors.label,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
    paddingHorizontal: HIGConstants.SPACING_SM,
  },
  flavorChip: {
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  expressionsContainer: {
    gap: HIGConstants.SPACING_MD,
  },
  expressionGroup: {
    backgroundColor: HIGColors.systemGray6,
    borderRadius: HIGConstants.BORDER_RADIUS_LG,
    padding: HIGConstants.SPACING_SM,
  },
  expressionHeader: {
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    marginBottom: HIGConstants.SPACING_SM,
  },
  expressionCategoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  expressionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HIGConstants.SPACING_XS,
  },
  expressionChip: {
    paddingHorizontal: HIGConstants.SPACING_SM,
    paddingVertical: HIGConstants.SPACING_XS,
    borderRadius: HIGConstants.BORDER_RADIUS_SM,
    borderWidth: 1,
  },
  expressionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: HIGConstants.SPACING_XL,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: HIGConstants.SPACING_MD,
  },
  emptyText: {
    fontSize: 16,
    color: HIGColors.secondaryLabel,
  },
});
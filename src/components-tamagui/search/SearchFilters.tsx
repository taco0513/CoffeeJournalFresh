import React, { useState, useEffect } from 'react';
import { Sheet } from 'tamagui';
import {
  FilterSheetOverlay,
  FilterSheetFrame,
  FilterHeader,
  FilterTitle,
  FilterCloseButton,
  FilterCloseIcon,
  FilterContent,
  FilterSection,
  FilterSectionTitle,
  FilterChipContainer,
  FilterChip,
  FilterChipText,
  ScoreRangeContainer,
  ScoreInput,
  ScoreSeparator,
  FilterActions,
  FilterResetButton,
  FilterResetText,
  FilterApplyButton,
  FilterApplyText,
} from './SearchScreenStyles';

interface FilterOptions {
  roastery?: string;
  cafeName?: string;
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
  flavorNotes?: string[];
}

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  availableRoasteries: string[];
  availableCafeNames: string[];
  availableFlavorNotes: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  availableRoasteries,
  availableCafeNames,
  availableFlavorNotes,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [minScoreText, setMinScoreText] = useState(
    filters.minScore?.toString() || ''
  );
  const [maxScoreText, setMaxScoreText] = useState(
    filters.maxScore?.toString() || ''
  );

  useEffect(() => {
    setLocalFilters(filters);
    setMinScoreText(filters.minScore?.toString() || '');
    setMaxScoreText(filters.maxScore?.toString() || '');
}, [filters, isOpen]);

  const updateFilter = (key: keyof FilterOptions, value: unknown) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
  }));
};

  const toggleFlavorNote = (flavorNote: string) => {
    const currentFlavors = localFilters.flavorNotes || [];
    const isSelected = currentFlavors.includes(flavorNote);
    
    if (isSelected) {
      updateFilter('flavorNotes', currentFlavors.filter(f => f !== flavorNote));
  } else {
      updateFilter('flavorNotes', [...currentFlavors, flavorNote]);
  }
};

  const handleMinScoreChange = (text: string) => {
    setMinScoreText(text);
    const score = parseFloat(text);
    updateFilter('minScore', isNaN(score) ? undefined : score);
};

  const handleMaxScoreChange = (text: string) => {
    setMaxScoreText(text);
    const score = parseFloat(text);
    updateFilter('maxScore', isNaN(score) ? undefined : score);
};

  const resetFilters = () => {
    const emptyFilters: FilterOptions = {};
    setLocalFilters(emptyFilters);
    setMinScoreText('');
    setMaxScoreText('');
};

  const applyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
};

  const renderRoasterySection = () => (
    <FilterSection>
      <FilterSectionTitle>로스터리</FilterSectionTitle>
      <FilterChipContainer>
        {availableRoasteries.map((roastery) => {
          const isSelected = localFilters.roastery === roastery;
          return (
            <FilterChip
              key={roastery}
              selected={isSelected}
              onPress={() => updateFilter('roastery', isSelected ? undefined : roastery)}
            >
              <FilterChipText selected={isSelected}>
                {roastery}
              </FilterChipText>
            </FilterChip>
          );
      })}
      </FilterChipContainer>
    </FilterSection>
  );

  const renderCafeSection = () => (
    <FilterSection>
      <FilterSectionTitle>카페</FilterSectionTitle>
      <FilterChipContainer>
        {availableCafeNames.map((cafeName) => {
          const isSelected = localFilters.cafeName === cafeName;
          return (
            <FilterChip
              key={cafeName}
              selected={isSelected}
              onPress={() => updateFilter('cafeName', isSelected ? undefined : cafeName)}
            >
              <FilterChipText selected={isSelected}>
                {cafeName}
              </FilterChipText>
            </FilterChip>
          );
      })}
      </FilterChipContainer>
    </FilterSection>
  );

  const renderScoreSection = () => (
    <FilterSection>
      <FilterSectionTitle>점수 범위</FilterSectionTitle>
      <ScoreRangeContainer>
        <ScoreInput
          placeholder="최소"
          value={minScoreText}
          onChangeText={handleMinScoreChange}
          keyboardType="decimal-pad"
        />
        <ScoreSeparator>~</ScoreSeparator>
        <ScoreInput
          placeholder="최대"
          value={maxScoreText}
          onChangeText={handleMaxScoreChange}
          keyboardType="decimal-pad"
        />
      </ScoreRangeContainer>
    </FilterSection>
  );

  const renderFlavorNotesSection = () => (
    <FilterSection>
      <FilterSectionTitle>향미 노트</FilterSectionTitle>
      <FilterChipContainer>
        {availableFlavorNotes.slice(0, 20).map((flavorNote) => {
          const isSelected = localFilters.flavorNotes?.includes(flavorNote) || false;
          return (
            <FilterChip
              key={flavorNote}
              selected={isSelected}
              onPress={() => toggleFlavorNote(flavorNote)}
            >
              <FilterChipText selected={isSelected}>
                {flavorNote}
              </FilterChipText>
            </FilterChip>
          );
      })}
      </FilterChipContainer>
    </FilterSection>
  );

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[80]}
      dismissOnSnapToBottom
    >
      <FilterSheetOverlay />
      
      <FilterSheetFrame>
        <FilterHeader>
          <FilterTitle>검색 필터</FilterTitle>
          <FilterCloseButton onPress={onClose}>
            <FilterCloseIcon>✕</FilterCloseIcon>
          </FilterCloseButton>
        </FilterHeader>

        <FilterContent showsVerticalScrollIndicator={false}>
          {availableRoasteries.length > 0 && renderRoasterySection()}
          {availableCafeNames.length > 0 && renderCafeSection()}
          {renderScoreSection()}
          {availableFlavorNotes.length > 0 && renderFlavorNotesSection()}
        </FilterContent>

        <FilterActions>
          <FilterResetButton onPress={resetFilters}>
            <FilterResetText>초기화</FilterResetText>
          </FilterResetButton>
          
          <FilterApplyButton onPress={applyFilters}>
            <FilterApplyText>적용</FilterApplyText>
          </FilterApplyButton>
        </FilterActions>
      </FilterSheetFrame>
    </Sheet>
  );
};
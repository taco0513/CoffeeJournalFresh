# SensoryScreen Implementation Guide

## Current Implementation Analysis

### Strengths
1. **Clean separation of concerns** - UI, state management, and business logic are well separated
2. **TypeScript integration** - Full type safety with proper interfaces
3. **Performance optimizations** - useMemo, useCallback usage
4. **Reusable components** - Extracted MouthfeelButton, SliderSection
5. **Custom hooks** - useSensoryState for state management

### Areas for Improvement
1. **Component size** - Even after refactoring, still ~300 lines
2. **Mode switching logic** - Could be extracted to custom hook
3. **Validation logic** - Currently minimal, needs enhancement
4. **Accessibility** - Basic implementation, needs enhancement

## Recommended Refactoring

### 1. Extract Mode Management Hook
```typescript
// hooks/useSensoryMode.ts
export const useSensoryMode = () => {
  const [showEnhanced, setShowEnhanced] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    if (showEnhanced) {
      checkShouldShowOnboarding().then(setShowOnboarding);
    }
  }, [showEnhanced]);
  
  return {
    mode: showEnhanced ? 'enhanced' : 'basic',
    showOnboarding,
    toggleMode: () => setShowEnhanced(!showEnhanced),
    dismissOnboarding: () => setShowOnboarding(false),
  };
};
```

### 2. Create Validation Service
```typescript
// services/sensoryValidation.ts
export class SensoryValidationService {
  static validateNumericValue(value: number): boolean {
    return value >= 1 && value <= 5;
  }
  
  static validateExpressions(expressions: SelectedExpression[]): ValidationResult {
    const categoryCounts = this.getCategoryCounts(expressions);
    const errors: ValidationError[] = [];
    
    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count > 3) {
        errors.push({
          category,
          message: `Maximum 3 selections allowed for ${category}`,
        });
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
```

### 3. Enhance Accessibility
```typescript
// components/sensory/AccessibleSlider.tsx
export const AccessibleSlider: React.FC<SliderProps> = ({
  title,
  value,
  onValueChange,
  ...props
}) => {
  return (
    <View accessible={true} accessibilityRole="adjustable">
      <Text accessibilityLabel={`${title} slider`}>
        {title}
      </Text>
      <Slider
        {...props}
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={`${title} value is ${value}`}
        accessibilityHint="Swipe up or down to adjust"
      />
    </View>
  );
};
```

## State Management Architecture

### Current State Flow
```
User Input → Local State → Global Store → Navigation
```

### Proposed Enhanced Flow
```
User Input → Validation → Local State → Optimistic Update → Global Store → API Sync → Navigation
```

### State Synchronization Strategy
1. **Optimistic Updates** - Update UI immediately
2. **Background Sync** - Save to API in background
3. **Conflict Resolution** - Handle offline/online sync
4. **Error Recovery** - Rollback on failure

## Testing Implementation

### Unit Test Example
```typescript
// __tests__/useSensoryState.test.ts
describe('useSensoryState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSensoryState());
    expect(result.current.sensoryData.body).toBe(3);
  });
  
  it('should update numeric values', () => {
    const { result } = renderHook(() => useSensoryState());
    act(() => {
      result.current.updateNumericValue('acidity')(4);
    });
    expect(result.current.sensoryData.acidity).toBe(4);
  });
});
```

### Integration Test Example
```typescript
// __tests__/SensoryScreen.integration.test.tsx
describe('SensoryScreen Integration', () => {
  it('should save data and navigate on completion', async () => {
    const { getByText } = render(<SensoryScreen />);
    
    // Select mode
    fireEvent.press(getByText('감각 평가'));
    
    // Select expressions
    fireEvent.press(getByText('싱그러운'));
    fireEvent.press(getByText('달콤한'));
    
    // Complete
    fireEvent.press(getByText('평가 완료'));
    
    // Verify navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('PersonalComment');
    });
  });
});
```

## Performance Optimization Plan

### Current Performance Metrics
- Initial render: ~50ms
- Re-render on mode switch: ~30ms
- Expression selection: ~10ms

### Optimization Targets
1. **Code Splitting**
   - Lazy load EnhancedSensoryEvaluation
   - Dynamic import for onboarding

2. **Memoization Strategy**
   ```typescript
   const MemoizedEnhancedEvaluation = React.memo(
     EnhancedSensoryEvaluation,
     (prev, next) => {
       return JSON.stringify(prev.selectedExpressions) === 
              JSON.stringify(next.selectedExpressions);
     }
   );
   ```

3. **Virtual List for Expressions**
   - Implement FlatList for large expression lists
   - Viewport-based rendering

## API Integration Design

### Endpoints
```typescript
// POST /api/tastings/{id}/sensory
{
  body: number,
  acidity: number,
  sweetness: number,
  finish: number,
  bitterness: number,
  balance: number,
  mouthfeel: string,
  expressions: Array<{
    categoryId: string,
    expressionId: string,
    intensity: number
  }>
}

// GET /api/sensory/recommendations
{
  coffeeType?: string,
  roastLevel?: string,
  userId?: string
}
```

### Error Handling
```typescript
const saveSensoryData = async (data: SensoryData) => {
  try {
    // Optimistic update
    updateLocalState(data);
    
    // API call
    const response = await api.saveSensory(data);
    
    // Confirm update
    confirmUpdate(response.id);
  } catch (error) {
    // Rollback
    rollbackUpdate();
    
    // User feedback
    showError('Failed to save. Data saved locally.');
    
    // Queue for retry
    queueForSync(data);
  }
};
```
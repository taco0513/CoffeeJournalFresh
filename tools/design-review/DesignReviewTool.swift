import SwiftUI
import Foundation

// MARK: - Design System Analysis Tool for CupNote

struct DesignReviewTool: View {
    @State private var analysisResults: [DesignIssue] = []
    @State private var isAnalyzing = false
    @State private var selectedCategory: IssueCategory = .all
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                HeaderView()
                
                // Category Filter
                CategoryFilter(selectedCategory: $selectedCategory)
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                
                // Analysis Results
                if isAnalyzing {
                    ProgressView("Analyzing CupNote Design System...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    AnalysisResultsView(
                        results: filteredResults,
                        selectedCategory: selectedCategory
                    )
                }
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            performAnalysis()
        }
    }
    
    private var filteredResults: [DesignIssue] {
        if selectedCategory == .all {
            return analysisResults
        }
        return analysisResults.filter { $0.category == selectedCategory }
    }
    
    private func performAnalysis() {
        isAnalyzing = true
        
        // Simulate async analysis
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.analysisResults = DesignAnalyzer.analyzeCupNoteDesign()
            self.isAnalyzing = false
        }
    }
}

// MARK: - Header View
struct HeaderView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("CupNote Design Review")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("React Native → SwiftUI Design Analysis")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(UIColor.systemBackground))
        .shadow(color: .black.opacity(0.05), radius: 2, y: 2)
    }
}

// MARK: - Category Filter
struct CategoryFilter: View {
    @Binding var selectedCategory: IssueCategory
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(IssueCategory.allCases, id: \.self) { category in
                    CategoryChip(
                        category: category,
                        isSelected: selectedCategory == category,
                        onTap: { selectedCategory = category }
                    )
                }
            }
        }
    }
}

struct CategoryChip: View {
    let category: IssueCategory
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 4) {
                Image(systemName: category.icon)
                    .font(.caption)
                Text(category.rawValue)
                    .font(.subheadline)
                    .fontWeight(isSelected ? .semibold : .regular)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(isSelected ? Color.blue : Color(UIColor.secondarySystemBackground))
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(20)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Analysis Results View
struct AnalysisResultsView: View {
    let results: [DesignIssue]
    let selectedCategory: IssueCategory
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                // Summary Card
                SummaryCard(totalIssues: results.count, category: selectedCategory)
                    .padding(.horizontal)
                
                // Issues List
                ForEach(results) { issue in
                    DesignIssueCard(issue: issue)
                        .padding(.horizontal)
                }
                
                // Design System Recommendations
                if !results.isEmpty {
                    RecommendationsCard()
                        .padding(.horizontal)
                        .padding(.top)
                }
            }
            .padding(.vertical)
        }
    }
}

// MARK: - Summary Card
struct SummaryCard: View {
    let totalIssues: Int
    let category: IssueCategory
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "chart.bar.doc.horizontal")
                    .font(.title2)
                    .foregroundColor(.blue)
                
                VStack(alignment: .leading) {
                    Text("Analysis Summary")
                        .font(.headline)
                    Text("\(totalIssues) issues found")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if totalIssues > 0 {
                    SeverityIndicator(count: totalIssues)
                }
            }
            
            if category != .all {
                Text("Filtered by: \(category.rawValue)")
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Design Issue Card
struct DesignIssueCard: View {
    let issue: DesignIssue
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                SeverityBadge(severity: issue.severity)
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(issue.title)
                        .font(.headline)
                    
                    HStack(spacing: 4) {
                        Image(systemName: issue.category.icon)
                            .font(.caption)
                        Text(issue.category.rawValue)
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button(action: { withAnimation { isExpanded.toggle() } }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(.secondary)
                }
            }
            
            // Description
            Text(issue.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(isExpanded ? nil : 2)
            
            if isExpanded {
                VStack(alignment: .leading, spacing: 12) {
                    // Current Implementation
                    if let current = issue.currentImplementation {
                        VStack(alignment: .leading, spacing: 4) {
                            Label("Current Implementation", systemImage: "xmark.circle")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.red)
                            
                            CodeBlock(code: current, language: "jsx")
                        }
                    }
                    
                    // Suggested Solution
                    VStack(alignment: .leading, spacing: 4) {
                        Label("Suggested Solution", systemImage: "checkmark.circle")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.green)
                        
                        CodeBlock(code: issue.suggestedSolution, language: "jsx")
                    }
                    
                    // Benefits
                    if !issue.benefits.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Benefits")
                                .font(.caption)
                                .fontWeight(.semibold)
                            
                            ForEach(issue.benefits, id: \.self) { benefit in
                                HStack(alignment: .top, spacing: 8) {
                                    Text("•")
                                        .foregroundColor(.green)
                                    Text(benefit)
                                        .font(.caption)
                                }
                            }
                        }
                    }
                }
                .padding(.top, 8)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Code Block
struct CodeBlock: View {
    let code: String
    let language: String
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            Text(code)
                .font(.system(.caption, design: .monospaced))
                .padding(8)
                .background(Color(UIColor.tertiarySystemBackground))
                .cornerRadius(8)
        }
    }
}

// MARK: - Recommendations Card
struct RecommendationsCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(.yellow)
                Text("Design System Recommendations")
                    .font(.headline)
            }
            
            VStack(alignment: .leading, spacing: 12) {
                RecommendationRow(
                    title: "Implement Token System",
                    description: "Create centralized design tokens for colors, spacing, and typography"
                )
                
                RecommendationRow(
                    title: "Component Library",
                    description: "Build reusable components following atomic design principles"
                )
                
                RecommendationRow(
                    title: "Style Guide Documentation",
                    description: "Document design patterns and usage guidelines"
                )
                
                RecommendationRow(
                    title: "Performance Optimization",
                    description: "Use React.memo and useCallback to prevent unnecessary re-renders"
                )
            }
        }
        .padding()
        .background(
            LinearGradient(
                colors: [Color.blue.opacity(0.05), Color.purple.opacity(0.05)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.blue.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(12)
    }
}

struct RecommendationRow: View {
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "arrow.right.circle.fill")
                .foregroundColor(.blue)
                .font(.caption)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Supporting Views
struct SeverityBadge: View {
    let severity: IssueSeverity
    
    var body: some View {
        Text(severity.rawValue)
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(severity.color)
            .foregroundColor(.white)
            .cornerRadius(4)
    }
}

struct SeverityIndicator: View {
    let count: Int
    
    var severity: IssueSeverity {
        if count > 10 { return .high }
        if count > 5 { return .medium }
        return .low
    }
    
    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(severity.color)
                .frame(width: 8, height: 8)
            Text(severity.rawValue)
                .font(.caption)
                .foregroundColor(severity.color)
        }
    }
}

// MARK: - Data Models
struct DesignIssue: Identifiable {
    let id = UUID()
    let category: IssueCategory
    let severity: IssueSeverity
    let title: String
    let description: String
    let currentImplementation: String?
    let suggestedSolution: String
    let benefits: [String]
}

enum IssueCategory: String, CaseIterable {
    case all = "All"
    case consistency = "Consistency"
    case performance = "Performance"
    case structure = "Structure"
    case accessibility = "Accessibility"
    case patterns = "Patterns"
    
    var icon: String {
        switch self {
        case .all: return "square.grid.2x2"
        case .consistency: return "paintbrush"
        case .performance: return "speedometer"
        case .structure: return "square.stack.3d.up"
        case .accessibility: return "person.circle"
        case .patterns: return "rectangle.3.group"
        }
    }
}

enum IssueSeverity: String {
    case high = "High"
    case medium = "Medium"
    case low = "Low"
    
    var color: Color {
        switch self {
        case .high: return .red
        case .medium: return .orange
        case .low: return .yellow
        }
    }
}

// MARK: - Design Analyzer
struct DesignAnalyzer {
    static func analyzeCupNoteDesign() -> [DesignIssue] {
        return [
            // Consistency Issues
            DesignIssue(
                category: .consistency,
                severity: .high,
                title: "Inconsistent Spacing Values",
                description: "Multiple spacing values used across components without a consistent system",
                currentImplementation: """
padding: 16
margin: 20
gap: 12
paddingHorizontal: 24
""",
                suggestedSolution: """
// Design System Tokens
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
}
""",
                benefits: [
                    "Consistent visual rhythm",
                    "Easier maintenance",
                    "Better developer experience"
                ]
            ),
            
            DesignIssue(
                category: .consistency,
                severity: .medium,
                title: "Mixed Color Definitions",
                description: "Colors defined inline instead of using design tokens",
                currentImplementation: """
backgroundColor: '#2196F3'
color: 'rgb(33, 150, 243)'
borderColor: '#E0E0E0'
""",
                suggestedSolution: """
colors: {
  primary: { 500: '#2196F3' },
  border: { light: '#E0E0E0' },
  // Semantic naming
}
""",
                benefits: [
                    "Centralized color management",
                    "Easy theme switching",
                    "Better accessibility"
                ]
            ),
            
            // Performance Issues
            DesignIssue(
                category: .performance,
                severity: .high,
                title: "Unnecessary Re-renders",
                description: "Components re-rendering due to inline style objects and functions",
                currentImplementation: """
<TouchableOpacity
  style={{ padding: 16 }}
  onPress={() => handlePress()}
>
""",
                suggestedSolution: """
const styles = StyleSheet.create({
  button: { padding: 16 }
});

const handlePress = useCallback(() => {
  // handler logic
}, [dependencies]);
""",
                benefits: [
                    "Reduced re-renders",
                    "Better performance",
                    "Smoother animations"
                ]
            ),
            
            // Structure Issues
            DesignIssue(
                category: .structure,
                severity: .high,
                title: "Large Component Files",
                description: "HomeCafeSimpleForm.tsx has 700+ lines, making it hard to maintain",
                currentImplementation: """
// Single file with:
// - State management
// - UI components
// - Business logic
// - Styles
""",
                suggestedSolution: """
// Split into:
HomeCafeSimpleForm/
  ├── index.tsx
  ├── hooks/useRecipe.ts
  ├── components/RecipeCard.tsx
  ├── components/TimerSection.tsx
  └── styles.ts
""",
                benefits: [
                    "Better code organization",
                    "Easier testing",
                    "Improved reusability"
                ]
            ),
            
            // Accessibility Issues
            DesignIssue(
                category: .accessibility,
                severity: .medium,
                title: "Missing Accessibility Labels",
                description: "Interactive elements without proper accessibility support",
                currentImplementation: """
<TouchableOpacity onPress={handleSave}>
  <Text>💾</Text>
</TouchableOpacity>
""",
                suggestedSolution: """
<TouchableOpacity 
  onPress={handleSave}
  accessibilityLabel="Save recipe"
  accessibilityRole="button"
>
  <Text>💾</Text>
</TouchableOpacity>
""",
                benefits: [
                    "Screen reader support",
                    "Better UX for all users",
                    "Compliance with standards"
                ]
            ),
            
            // Pattern Issues
            DesignIssue(
                category: .patterns,
                severity: .medium,
                title: "Prop Drilling",
                description: "Passing props through multiple component levels",
                currentImplementation: """
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
  </Child>
</Parent>
""",
                suggestedSolution: """
// Use Context or Zustand
const DataContext = createContext();

<DataProvider value={data}>
  <Parent />
</DataProvider>
""",
                benefits: [
                    "Cleaner component APIs",
                    "Easier refactoring",
                    "Better performance"
                ]
            )
        ]
    }
}

// MARK: - Preview
struct DesignReviewTool_Previews: PreviewProvider {
    static var previews: some View {
        DesignReviewTool()
    }
}
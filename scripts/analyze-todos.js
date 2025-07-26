const fs = require('fs');
const path = require('path');
const glob = require('glob');

// TODO categories
const todoCategories = {
  SENTRY: 'Sentry Integration',
  SUPABASE: 'Supabase Integration',
  NAVIGATION: 'Navigation Implementation',
  UI: 'UI Implementation',
  FEATURE: 'Feature Implementation'
};

// Analyze TODOs
function analyzeTodos() {
  const todos = [];
  
  // Find all TypeScript files
  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
  });
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.includes('TODO') || line.includes('FIXME')) {
        const category = categorizeTask(line, file);
        todos.push({
          file: path.relative(process.cwd(), file),
          line: index + 1,
          content: line.trim(),
          category,
          priority: determinePriority(line, file)
        });
      }
    });
  });
  
  return todos;
}

// Categorize TODO based on content and file location
function categorizeTask(line, file) {
  if (file.includes('SentryService')) return todoCategories.SENTRY;
  if (file.includes('supabase') || line.includes('Supabase')) return todoCategories.SUPABASE;
  if (line.includes('screen') || line.includes('navigate')) return todoCategories.NAVIGATION;
  if (line.includes('UI') || file.includes('components')) return todoCategories.UI;
  return todoCategories.FEATURE;
}

// Determine priority based on content
function determinePriority(line, file) {
  // High priority for production readiness items
  if (line.includes('DSN') || line.includes('implement')) return 'HIGH';
  // Medium priority for feature completions
  if (line.includes('screen') || line.includes('save')) return 'MEDIUM';
  // Low priority for cleanup and minor enhancements
  if (line.includes('나중에') || line.includes('highlighting')) return 'LOW';
  return 'MEDIUM';
}

// Generate implementation plan
function generateImplementationPlan(todos) {
  const plan = {
    immediate: [],
    nextSprint: [],
    backlog: []
  };
  
  todos.forEach(todo => {
    if (todo.priority === 'HIGH') {
      plan.immediate.push(todo);
    } else if (todo.priority === 'MEDIUM') {
      plan.nextSprint.push(todo);
    } else {
      plan.backlog.push(todo);
    }
  });
  
  return plan;
}

// Generate report
function generateReport(todos, plan) {
  console.log('\n📋 TODO Analysis Report\n');
  console.log(`Total TODOs found: ${todos.length}\n`);
  
  // By category
  console.log('By Category:');
  const byCategory = {};
  todos.forEach(todo => {
    byCategory[todo.category] = (byCategory[todo.category] || 0) + 1;
  });
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
  
  // Priority breakdown
  console.log('\nBy Priority:');
  console.log(`  HIGH: ${plan.immediate.length}`);
  console.log(`  MEDIUM: ${plan.nextSprint.length}`);
  console.log(`  LOW: ${plan.backlog.length}`);
  
  // Immediate action items
  console.log('\n🚨 Immediate Action Items:');
  plan.immediate.forEach(todo => {
    console.log(`\n  File: ${todo.file}:${todo.line}`);
    console.log(`  Task: ${todo.content}`);
    console.log(`  Category: ${todo.category}`);
  });
  
  // Next sprint items
  console.log('\n📅 Next Sprint Items:');
  plan.nextSprint.forEach(todo => {
    console.log(`\n  File: ${todo.file}:${todo.line}`);
    console.log(`  Task: ${todo.content}`);
    console.log(`  Category: ${todo.category}`);
  });
  
  // Save detailed report
  const report = {
    summary: {
      total: todos.length,
      byCategory,
      byPriority: {
        HIGH: plan.immediate.length,
        MEDIUM: plan.nextSprint.length,
        LOW: plan.backlog.length
      }
    },
    todos,
    plan,
    generated: new Date().toISOString()
  };
  
  fs.writeFileSync('todo-analysis-report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Detailed report saved to todo-analysis-report.json');
}

// Main execution
const todos = analyzeTodos();
const plan = generateImplementationPlan(todos);
generateReport(todos, plan);
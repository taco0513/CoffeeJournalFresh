#!/usr/bin/env ruby

require 'xcodeproj'

# Path to the project
project_path = 'CoffeeJournalFresh.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
target = project.targets.find { |t| t.name == 'CoffeeJournalFresh' }

if target.nil?
  puts "❌ Target 'CoffeeJournalFresh' not found!"
  exit 1
end

# Check if the build phase already exists
existing_phase = target.build_phases.find { |phase| 
  phase.is_a?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase) && 
  phase.name == 'Fix RCTThirdPartyComponentsProvider'
}

if existing_phase
  puts "⚠️  Build phase 'Fix RCTThirdPartyComponentsProvider' already exists. Updating..."
  target.build_phases.delete(existing_phase)
end

# Create the new build phase
build_phase = target.new_shell_script_build_phase('Fix RCTThirdPartyComponentsProvider')

# Set the script
build_phase.shell_script = <<-SCRIPT
# Fix React Native crash due to nil NSClassFromString returns
echo "🔧 Fixing RCTThirdPartyComponentsProvider.mm..."

# Navigate to the iOS directory
cd "${SRCROOT}"

# Run the Ruby fix script
if [ -f "fix_rct_provider.rb" ]; then
    ruby fix_rct_provider.rb
    echo "✅ Fix applied successfully!"
else
    echo "⚠️  fix_rct_provider.rb not found - skipping fix"
fi
SCRIPT

# Move the build phase after the "Bundle React Native code and images" phase
bundle_phase = target.build_phases.find { |phase| 
  phase.is_a?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase) && 
  phase.name == 'Bundle React Native code and images'
}

if bundle_phase
  bundle_index = target.build_phases.index(bundle_phase)
  target.build_phases.move(build_phase, bundle_index + 1)
end

# Save the project
project.save

puts "✅ Build phase 'Fix RCTThirdPartyComponentsProvider' added successfully!"
puts "   The fix will now run automatically after each build."
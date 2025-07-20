#!/bin/bash

# Get today's date
DATE=$(date +%Y%m%d)

# Create the clone command
echo "📁 Creating dated clone of CoffeeJournalFresh..."
echo "Repository: https://github.com/taco0513/CoffeeJournalFresh.git"
echo "Branch: dev-danang-250719"
echo "Target folder: CoffeeJournalFresh-${DATE}-oauth-admin"
echo ""

# Show the commands that will be run
echo "Commands to run:"
echo "1. git clone -b dev-danang-250719 https://github.com/taco0513/CoffeeJournalFresh.git CoffeeJournalFresh-${DATE}-oauth-admin"
echo "2. cd CoffeeJournalFresh-${DATE}-oauth-admin"
echo "3. npm install"
echo "4. cd ios && pod install && cd .."
echo "5. cd web-admin && npm install && cd .."
echo ""

# Ask for confirmation
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Clone the repository
    echo "🚀 Cloning repository..."
    git clone -b dev-danang-250719 https://github.com/taco0513/CoffeeJournalFresh.git CoffeeJournalFresh-${DATE}-oauth-admin
    
    # Navigate to the folder
    cd CoffeeJournalFresh-${DATE}-oauth-admin
    
    # Install dependencies
    echo "📦 Installing npm dependencies..."
    npm install
    
    # Install iOS dependencies
    echo "🍎 Installing iOS dependencies..."
    cd ios && pod install && cd ..
    
    # Install web-admin dependencies
    echo "🌐 Installing web-admin dependencies..."
    cd web-admin && npm install && cd ..
    
    echo "✅ Done! Your dated clone is ready at: CoffeeJournalFresh-${DATE}-oauth-admin"
    echo ""
    echo "To start working:"
    echo "  cd CoffeeJournalFresh-${DATE}-oauth-admin"
    echo "  npm start"
else
    echo "❌ Cancelled"
fi
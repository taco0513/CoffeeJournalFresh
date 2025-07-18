const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Icon sizes needed for iOS
const iosSizes = [
  { size: 20, scale: 2, filename: 'Icon-20@2x.png' },
  { size: 20, scale: 3, filename: 'Icon-20@3x.png' },
  { size: 29, scale: 2, filename: 'Icon-29@2x.png' },
  { size: 29, scale: 3, filename: 'Icon-29@3x.png' },
  { size: 40, scale: 2, filename: 'Icon-40@2x.png' },
  { size: 40, scale: 3, filename: 'Icon-40@3x.png' },
  { size: 60, scale: 2, filename: 'Icon-60@2x.png' },
  { size: 60, scale: 3, filename: 'Icon-60@3x.png' },
  { size: 1024, scale: 1, filename: 'Icon-1024.png' }
];

// Create a simple coffee cup icon
function drawCoffeeIcon(ctx, size) {
  // Background
  ctx.fillStyle = '#8B4513'; // Coffee brown
  ctx.fillRect(0, 0, size, size);
  
  // Draw coffee cup
  const cupWidth = size * 0.5;
  const cupHeight = size * 0.6;
  const cupX = (size - cupWidth) / 2;
  const cupY = size * 0.25;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  // Cup body (trapezoid)
  ctx.moveTo(cupX, cupY);
  ctx.lineTo(cupX + cupWidth, cupY);
  ctx.lineTo(cupX + cupWidth * 0.85, cupY + cupHeight);
  ctx.lineTo(cupX + cupWidth * 0.15, cupY + cupHeight);
  ctx.closePath();
  ctx.fill();
  
  // Handle
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.arc(cupX + cupWidth, cupY + cupHeight * 0.4, cupWidth * 0.2, -Math.PI * 0.3, Math.PI * 0.3);
  ctx.stroke();
  
  // Steam
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = size * 0.03;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const steamX = cupX + cupWidth * (0.3 + i * 0.2);
    const steamY = cupY - size * 0.05;
    ctx.moveTo(steamX, steamY);
    ctx.quadraticCurveTo(
      steamX - size * 0.02, steamY - size * 0.08,
      steamX, steamY - size * 0.15
    );
    ctx.stroke();
  }
  
  // Add text "CJ" at bottom
  if (size >= 60) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.15}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('CJ', size / 2, size * 0.95);
  }
}

// Generate icons
async function generateIcons() {
  const outputDir = path.join(__dirname, '../ios/CoffeeJournalFresh/Images.xcassets/AppIcon.appiconset');
  
  for (const iconSpec of iosSizes) {
    const size = iconSpec.size * iconSpec.scale;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    drawCoffeeIcon(ctx, size);
    
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(outputDir, iconSpec.filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated ${iconSpec.filename} (${size}x${size})`);
  }
  
  // Update Contents.json with filenames
  const contentsPath = path.join(outputDir, 'Contents.json');
  const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
  
  contents.images = contents.images.map((image, index) => {
    if (index < iosSizes.length - 1) {
      image.filename = iosSizes[index].filename;
    } else if (image.idiom === 'ios-marketing') {
      image.filename = iosSizes[iosSizes.length - 1].filename;
    }
    return image;
  });
  
  fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2));
  console.log('Updated Contents.json');
}

generateIcons().catch(console.error);
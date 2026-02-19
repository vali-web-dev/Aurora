const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'brand', 'ArcPanelLogoLab.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const trimmedLines = lines.slice(0, 1770);
fs.writeFileSync(filePath, trimmedLines.join('\n'), 'utf8');
console.log('File trimmed to 1770 lines');

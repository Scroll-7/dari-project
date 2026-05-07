const fs = require('fs');
const path = require('path');
const srcDir = path.join(process.cwd(), 'src');

function walkDir(dir, cb) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walkDir(fp, cb);
    else cb(fp);
  }
}

// Find all function bodies that reference colors. or styles. but don't have useTheme
// Strategy: split on "function " or "const X = (" declarations
walkDir(srcDir, filePath => {
  if (!filePath.endsWith('.js')) return;
  const text = fs.readFileSync(filePath, 'utf8');
  if (!text.includes('colors.') && !text.includes('styles.')) return;

  // Find all named function blocks (rough split)
  // Look for pattern: function NAME or const NAME = function or const NAME = (
  const funcRegex = /(?:^|\n)((?:function\s+\w+|const\s+\w+\s*=\s*(?:React\.memo\()?(?:function|\())[^\n]*)/g;
  let match;
  const positions = [];
  
  while ((match = funcRegex.exec(text)) !== null) {
    positions.push({ name: match[1].trim().substring(0, 60), pos: match.index });
  }
  
  // For each function, extract its body and check if it uses colors/styles without useTheme
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].pos;
    const end = positions[i + 1] ? positions[i + 1].pos : text.length;
    const body = text.slice(start, end);
    
    const usesColors = body.includes('colors.') || body.includes('styles.');
    const hasTheme = body.includes('useTheme') || body.includes('= colors)') || body.includes('(colors)');
    const isGetStyles = positions[i].name.includes('getStyles') || positions[i].name.includes('getMenu');
    
    if (usesColors && !hasTheme && !isGetStyles) {
      console.log('\n=== ' + filePath + ' ===');
      console.log('Function: ' + positions[i].name);
      // Print lines that use colors.
      body.split('\n').forEach((line, li) => {
        if (line.includes('colors.') || (line.includes('styles.') && !line.includes('getStyles'))) {
          console.log('  L' + li + ': ' + line.trim().substring(0, 100));
        }
      });
    }
  }
});

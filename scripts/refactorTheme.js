const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) walkDir(dirPath, callback);
        else callback(dirPath);
    });
}

let modifiedFiles = 0;

walkDir(srcDir, function(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.tsx')) return;
    if (filePath.includes('context') || filePath.includes('constants')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file uses COLORS and isn't already fully refactored
    if (!content.includes('COLORS') && !content.includes('StyleSheet.create')) return;

    let modified = false;

    // Remove COLORS from imports if it exists
    if (content.match(/import\s+\{([^}]*)\}\s+from\s+['"](.*)theme['"]/)) {
        content = content.replace(/(import\s+\{[^}]*?)(\s*,\s*COLORS|\s*COLORS\s*,|\s*COLORS\s*)([^}]*\}\s+from\s+['"].*theme['"])/g, (match, p1, p2, p3) => {
            let inner = p1.replace(/import\s+\{\s*/, '');
            let combined = inner + p3.replace(/\}\s+from/, '');
            if (combined.trim() === '') {
                return ''; // Removed entirely if it was the only export
            }
            // Clean up dangling commas
            let cleaned = p1 + p3;
            cleaned = cleaned.replace(/\{\s*,/, '{').replace(/,\s*\}/, '}').replace(/,\s*,/g, ',');
            modified = true;
            return cleaned;
        });
        
        // Sometimes it's the only import: `import { COLORS } from '../constants/theme';`
        content = content.replace(/import\s*\{\s*COLORS\s*\}\s*from\s*['"].*theme['"];?\n?/g, '');
        modified = true;
    }

    // Add useTheme import if not exists
    if (!content.includes('useTheme')) {
        let depth = filePath.replace(srcDir, '').split(path.sep).length - 2;
        let relativePath = depth > 0 ? '../'.repeat(depth) + 'context/ThemeContext' : './context/ThemeContext';
        
        // Find last import
        const importMatches = [...content.matchAll(/^import .*;?/gm)];
        if (importMatches.length > 0) {
            const lastImport = importMatches[importMatches.length - 1];
            const insertIndex = lastImport.index + lastImport[0].length;
            content = content.slice(0, insertIndex) + `\nimport { useTheme } from '${relativePath}';` + content.slice(insertIndex);
            modified = true;
        } else {
             // prepend
             content = `import { useTheme } from '${relativePath}';\n` + content;
             modified = true;
        }
    }

    // Replace StyleSheet.create with getStyles
    if (content.includes('const styles = StyleSheet.create({')) {
        content = content.replace('const styles = StyleSheet.create({', 'const getStyles = (colors) => StyleSheet.create({');
        modified = true;
    }

    // Inject hooks into components
    // We look for export default function Name(props) {
    const compRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/;
    const compMatch = content.match(compRegex);
    if (compMatch && !content.includes('const { colors } = useTheme();')) {
        const insertIndex = compMatch.index + compMatch[0].length;
        content = content.slice(0, insertIndex) + `\n  const { colors } = useTheme();\n  const styles = getStyles(colors);` + content.slice(insertIndex);
        modified = true;
    }

    // Or arrow functions: const Name = (props) => {
    const arrowRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/;
    const arrowMatch = content.match(arrowRegex);
    if (arrowMatch && !content.includes('const { colors } = useTheme();') && !compMatch) {
        const insertIndex = arrowMatch.index + arrowMatch[0].length;
        content = content.slice(0, insertIndex) + `\n  const { colors } = useTheme();\n  const styles = getStyles(colors);` + content.slice(insertIndex);
        modified = true;
    }

    // Replace COLORS. with colors.
    if (content.includes('COLORS.')) {
        content = content.replace(/COLORS\./g, 'colors.');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedFiles++;
    }
});

console.log(`Successfully refactored ${modifiedFiles} files.`);

const fs = require('fs');
let text = fs.readFileSync('src/screens/RoommateProfileScreen.js', 'utf8');

// Find the duplicated Stars component and replace it with a clean version
text = text.replace(/function Stars\(\{\s*count\s*\}\) \{[\s\S]*?function SectionTitle/m, `import { useTheme } from '../context/ThemeContext';

// ─── Star row ────────────────────────────────────────────────────────────────
function Stars({ count }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= count ? 'star' : 'star-outline'}
          size={13}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionTitle`);

fs.writeFileSync('src/screens/RoommateProfileScreen.js', text);

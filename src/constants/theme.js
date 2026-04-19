// ─────────────────────────────────────────────────────────────
//  DARI  —  Design System  (modern · clean · simple)
// ─────────────────────────────────────────────────────────────

// Palette
const P = {
  indigo:    '#4F46E5',   // primary action color
  indigoDim: '#EEF2FF',  // very soft indigo tint
  coral:     '#F72585',  // accent / badge
  green:     '#22C55E',
  amber:     '#F59E0B',
  red:       '#EF4444',
  whatsapp:  '#25D366',

  // Neutrals
  ink:       '#111827',  // headings
  body:      '#374151',  // body text
  muted:     '#9CA3AF',  // secondary text / placeholders
  line:      '#F3F4F6',  // dividers
  surface:   '#FFFFFF',  // cards / inputs
  canvas:    '#F9FAFB',  // screen backgrounds
};

export const COLORS = {
  // Semantic
  primary:        P.indigo,
  primaryOpacity: P.indigoDim,
  secondary:      '#6366F1',   // lighter indigo
  accent:         P.coral,

  // Text
  text:       P.ink,
  textBody:   P.body,
  textLight:  P.muted,

  // Surfaces
  background: P.canvas,
  card:       P.surface,
  white:      P.surface,

  // Glass (kept for compat)
  glass:       'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(255,255,255,0.4)',

  // Status
  success: P.green,
  warning: P.amber,
  error:   P.red,
  whatsapp: P.whatsapp,

  // Borders / lines
  border: '#E5E7EB',
  line:   P.line,
};

// Spacing
export const SIZES = {
  xs:     4,
  small:  8,
  medium: 16,
  large:  24,
  xl:     32,
  xxl:    48,
  radius: {
    sm:  8,
    md:  14,
    lg:  20,
    xl:  28,
    pill: 999,
  },
};

// Typography — tighter letter-spacing, heavier weight for headings
export const FONTS = {
  h1:     { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, lineHeight: 34 },
  h2:     { fontSize: 22, fontWeight: '700', letterSpacing: -0.3, lineHeight: 28 },
  h3:     { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, lineHeight: 22 },
  body1:  { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  body2:  { fontSize: 13, fontWeight: '400', lineHeight: 19 },
  label:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  caption:{ fontSize: 12, fontWeight: '400', lineHeight: 17 },
};

// Shadows — very subtle, consistent
export const SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

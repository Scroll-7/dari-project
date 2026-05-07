// ─────────────────────────────────────────────────────────────
//  DARI  —  Design System  (modern · clean · simple)
// ─────────────────────────────────────────────────────────────

// Palette
const P = {
  indigo:    '#4F46E5',
  indigoDim: '#EEF2FF',
  coral:     '#F72585',
  green:     '#22C55E',
  amber:     '#F59E0B',
  red:       '#EF4444',
  whatsapp:  '#25D366',

  ink:       '#111827',
  body:      '#374151',
  muted:     '#9CA3AF',
  line:      '#F3F4F6',
  surface:   '#FFFFFF',
  canvas:    '#F9FAFB',
};

export const COLORS = {
  primary:        P.indigo,
  primaryOpacity: P.indigoDim,
  secondary:      '#6366F1',
  accent:         P.coral,

  // New accent palette
  gold:   '#F59E0B',
  teal:   '#14B8A6',
  rose:   '#FB7185',
  violet: '#8B5CF6',

  text:       P.ink,
  textBody:   P.body,
  textLight:  P.muted,

  background: P.canvas,
  card:       P.surface,
  cardAlt:    '#F3F4F6',
  white:      P.surface,
  inputBg:    '#F3F4F6',

  glass:       'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(255,255,255,0.4)',

  success: P.green,
  warning: P.amber,
  error:   P.red,
  whatsapp: P.whatsapp,

  border: '#E5E7EB',
  line:   P.line,
};

// ── Gradient token arrays ──────────────────────────────────────
export const GRADIENTS = {
  primary:  ['#4F46E5', '#7C3AED'],
  accent:   ['#F72585', '#7209B7'],
  gold:     ['#F59E0B', '#EF4444'],
  teal:     ['#14B8A6', '#0EA5E9'],
  night:    ['#0F0F1A', '#1A1A2E'],
  sunrise:  ['#FF6B6B', '#FFE66D'],
  card:     ['#667eea', '#764ba2'],
  success:  ['#22C55E', '#16A34A'],
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

// Typography
export const FONTS = {
  h1:     { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, lineHeight: 34 },
  h2:     { fontSize: 22, fontWeight: '700', letterSpacing: -0.3, lineHeight: 28 },
  h3:     { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, lineHeight: 22 },
  body1:  { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  body2:  { fontSize: 13, fontWeight: '400', lineHeight: 19 },
  label:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  caption:{ fontSize: 12, fontWeight: '400', lineHeight: 17 },
};

// Shadows
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
  glow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  glowGold: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 8,
  },
};

// Animation constants
export const ANIMATION = {
  fast:    150,
  normal:  250,
  slow:    400,
  spring:  { tension: 120, friction: 8 },
  bounce:  { tension: 200, friction: 6 },
};


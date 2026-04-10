export const COLORS = {
  background: '#F0F4F8',
  primary: '#4361EE',
  primaryOpacity: 'rgba(67, 97, 238, 0.1)',
  secondary: '#3F37C9',
  accent: '#F72585',
  card: '#FFFFFF',
  text: '#2B2D42',
  textLight: '#8D99AE',
  white: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  success: '#4CAF50',
  error: '#EF233C',
};

export const SIZES = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 40,
};

export const FONTS = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body1: { fontSize: 16, fontWeight: '400' },
  body2: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
};

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * FilterPill — animated filter chip button
 */
export function FilterPill({ label, active, onPress, count, style }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        active && styles.pillActive,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, active && styles.textActive]}>
        {label}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors) => StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...SHADOWS.xs,
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryOpacity,
  },
  text: {
    ...FONTS.caption,
    color: colors.textLight,
    fontWeight: '600',
  },
  textActive: {
    color: colors.primary,
  },
});

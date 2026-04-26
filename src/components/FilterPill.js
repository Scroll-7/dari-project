import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

/**
 * FilterPill — animated filter chip button
 *
 * Props:
 *  label    — chip label
 *  active   — boolean active state
 *  onPress  — press handler
 *  count    — optional badge count
 *  style    — outer style override
 */
export function FilterPill({ label, active, onPress, count, style }) {
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

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius.pill,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...SHADOWS.xs,
  },
  pillActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity,
  },
  text: {
    ...FONTS.caption,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  textActive: {
    color: COLORS.primary,
  },
});

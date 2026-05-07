import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FONTS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * SectionHeader — shared section title + optional "See All" link
 */
export function SectionHeader({ title, onSeeAll, seeAllLabel = 'Voir tout', style }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.link}>{seeAllLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  title: { ...FONTS.h3, color: colors.text },
  link: { ...FONTS.body2, color: colors.primary, fontWeight: '600' },
});

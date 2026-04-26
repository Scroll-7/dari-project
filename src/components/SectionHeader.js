import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';

/**
 * SectionHeader — shared section title + optional "See All" link
 *
 * Props:
 *  title    — section title text
 *  onSeeAll — optional callback; if provided, renders "Voir tout" / seeAllLabel
 *  seeAllLabel — defaults to "Voir tout"
 *  style    — outer style override
 */
export function SectionHeader({ title, onSeeAll, seeAllLabel = 'Voir tout', style }) {
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  title: { ...FONTS.h3, color: COLORS.text },
  link: { ...FONTS.body2, color: COLORS.primary, fontWeight: '600' },
});

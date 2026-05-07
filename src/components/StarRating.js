import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * StarRating — 5-star row with numeric label
 */
export function StarRating({ rating, size = 13, showNum = true, reviews }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((s) => {
        const name =
          s <= full ? 'star' :
          s === full + 1 && half ? 'star-half' :
          'star-outline';
        return (
          <Ionicons key={s} name={name} size={size} color="#FFC107" style={{ marginRight: 1 }} />
        );
      })}
      {showNum && (
        <Text style={[styles.num, { fontSize: size }]}>
          {rating.toFixed(1)}
          {reviews !== undefined ? ` (${reviews})` : ''}
        </Text>
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  num: { fontWeight: '700', color: colors.textBody, marginLeft: 4 },
});

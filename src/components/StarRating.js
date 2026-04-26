import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * StarRating — 5-star row with numeric label
 *
 * Props:
 *  rating  — float 0–5
 *  size    — icon size (default 13)
 *  showNum — show numeric rating text (default true)
 *  reviews — optional review count suffix
 */
export function StarRating({ rating, size = 13, showNum = true, reviews }) {
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  num: { fontWeight: '700', color: '#374151', marginLeft: 4 },
});

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Avatar — shows a photo or colored initials circle
 *
 * Props:
 *  uri         — image URI (optional; shows initials if absent)
 *  initials    — 1-2 letter initials string
 *  color       — initials text color
 *  bgColor     — background color (used both for bg and subtly for border)
 *  size        — diameter in pixels (default 46)
 *  onlineDot   — show green online indicator dot
 *  style       — outer container style override
 */
export function Avatar({
  uri,
  initials,
  color,
  bgColor,
  size = 46,
  onlineDot = false,
  style,
}) {
  const radius = size / 2;
  const fontSize = size * 0.34;

  return (
    <View style={[styles.wrap, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.img,
            { width: size, height: size, borderRadius: radius },
          ]}
        />
      ) : (
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: bgColor ?? COLORS.primaryOpacity,
            },
          ]}
        >
          <Text style={[styles.initials, { color: color ?? COLORS.primary, fontSize }]}>
            {initials}
          </Text>
        </View>
      )}
      {onlineDot && (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.26,
              height: size * 0.26,
              borderRadius: size * 0.13,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:     { position: 'relative' },
  img:      { resizeMode: 'cover' },
  circle:   { justifyContent: 'center', alignItems: 'center' },
  initials: { fontWeight: '700' },
  dot: {
    position: 'absolute',
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

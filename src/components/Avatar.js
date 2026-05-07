import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Avatar — shows a photo or colored initials circle
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
  const { colors } = useTheme();
  const styles = getStyles(colors);
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
              backgroundColor: bgColor ?? colors.primaryOpacity,
            },
          ]}
        >
          <Text style={[styles.initials, { color: color ?? colors.primary, fontSize }]}>
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

const getStyles = (colors) => StyleSheet.create({
  wrap:     { position: 'relative' },
  img:      { resizeMode: 'cover' },
  circle:   { justifyContent: 'center', alignItems: 'center' },
  initials: { fontWeight: '700' },
  dot: {
    position: 'absolute',
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
});

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // ── Animation values ─────────────────────────────────────────
  const logoScale    = useRef(new Animated.Value(0.5)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(24)).current;

  // Smooth scanning line: translates from left → right, loops
  const lineX = useRef(new Animated.Value(-width * 0.55)).current;

  useEffect(() => {
    // 1. Logo springs in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 70,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Title fades + slides in after 450 ms
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    // 3. Scanning line loops continuously
    const runLine = () => {
      lineX.setValue(-width * 0.55);
      Animated.timing(lineX, {
        toValue: width * 0.55,
        duration: 1400,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) runLine();
      });
    };
    setTimeout(runLine, 300);

    // 4. Navigate after 2.8 s
    const timer = setTimeout(() => {
      onFinish && onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>

      {/* ── Logo ───────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ── App name ───────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.titleWrap,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        <Text style={styles.titleAr}>داري</Text>
        <Text style={styles.titleEn}>DARI</Text>
      </Animated.View>

      {/* ── Smooth moving line (bottom area) ───────────────────── */}
      <View style={styles.lineTrack}>
        <Animated.View
          style={[
            styles.movingLine,
            { transform: [{ translateX: lineX }] },
          ]}
        />
      </View>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
    // Subtle dark shadow on white bg
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },

  // Title
  titleWrap: {
    alignItems: 'center',
    gap: 4,
  },
  titleAr: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 1,
  },
  titleEn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },

  // Moving line track
  lineTrack: {
    position: 'absolute',
    bottom: height * 0.13,
    width: width * 0.5,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',   // subtle grey track
    overflow: 'hidden',
    alignSelf: 'center',
  },
  movingLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '45%',
    height: '100%',
    borderRadius: 1,
    backgroundColor: '#111111',            // solid black line
  },
});

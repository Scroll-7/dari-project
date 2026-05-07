import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const FAQS = [
  { q: 'How do I post a property?', a: 'Go to My Listings and tap "Post a Property". Fill in the details and submit.' },
  { q: 'How do I contact a property owner?', a: 'Open the property detail page and tap "Contact Owner" to call or message them.' },
  { q: 'Is DARI free to use?', a: 'Yes, browsing and searching properties is completely free.' },
  { q: 'How do I save a property?', a: 'Tap the heart icon on any property card to save it to your Saved Properties.' },
  { q: 'How do I change my profile info?', a: 'Go to Profile → Settings to update your name, email, phone, and photo.' },
];

export default function HelpScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [open, setOpen] = useState(null);

  const toggle = (i) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === i ? null : i);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contactCard}>
          <Ionicons name="headset-outline" size={32} color="#4461F2" />
          <Text style={styles.contactTitle}>Need help?</Text>
          <Text style={styles.contactSub}>Our support team is available Sat–Thu, 9am–6pm</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactBtn}>
              <Ionicons name="call-outline" size={16} color="#4461F2" />
              <Text style={styles.contactBtnText}>Call Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactBtn, styles.contactBtnFill]}>
              <Ionicons name="mail-outline" size={16} color={colors.white} />
              <Text style={[styles.contactBtnText, { color: colors.white }]}>Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        {FAQS.map((item, i) => (
          <TouchableOpacity key={i} style={styles.faqItem} onPress={() => toggle(i)}>
            <View style={styles.faqRow}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} />
            </View>
            {open === i && <Text style={styles.faqA}>{item.a}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  scroll: { padding: 16 },
  contactCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  contactTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 10 },
  contactSub: { fontSize: 12, color: colors.textLight, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#4461F2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  contactBtnFill: { backgroundColor: '#4461F2', borderColor: '#4461F2' },
  contactBtnText: { fontSize: 13, fontWeight: '600', color: '#4461F2', marginLeft: 6 },
  faqTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 12 },
  faqItem: { backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  faqA: { fontSize: 13, color: colors.textLight, marginTop: 10, lineHeight: 20 },
});





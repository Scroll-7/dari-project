import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FAQS = [
  { q: 'How do I post a property?', a: 'Go to My Listings and tap "Post a Property". Fill in the details and submit.' },
  { q: 'How do I contact a property owner?', a: 'Open the property detail page and tap "Contact Owner" to call or message them.' },
  { q: 'Is DARI free to use?', a: 'Yes, browsing and searching properties is completely free.' },
  { q: 'How do I save a property?', a: 'Tap the heart icon on any property card to save it to your Saved Properties.' },
  { q: 'How do I change my profile info?', a: 'Go to Profile → Settings to update your name, email, phone, and photo.' },
];

export default function HelpScreen({ navigation }) {
  const [open, setOpen] = useState(null);

  const toggle = (i) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === i ? null : i);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
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
              <Ionicons name="mail-outline" size={16} color="#fff" />
              <Text style={[styles.contactBtnText, { color: '#fff' }]}>Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        {FAQS.map((item, i) => (
          <TouchableOpacity key={i} style={styles.faqItem} onPress={() => toggle(i)}>
            <View style={styles.faqRow}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Ionicons name={open === i ? 'chevron-up' : 'chevron-down'} size={16} color="#888" />
            </View>
            {open === i && <Text style={styles.faqA}>{item.a}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#222' },
  scroll: { padding: 16 },
  contactCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  contactTitle: { fontSize: 16, fontWeight: '700', color: '#222', marginTop: 10 },
  contactSub: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  contactRow: { flexDirection: 'row', gap: 12 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#4461F2', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  contactBtnFill: { backgroundColor: '#4461F2', borderColor: '#4461F2' },
  contactBtnText: { fontSize: 13, fontWeight: '600', color: '#4461F2', marginLeft: 6 },
  faqTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },
  faqItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 13, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  faqA: { fontSize: 13, color: '#666', marginTop: 10, lineHeight: 20 },
});

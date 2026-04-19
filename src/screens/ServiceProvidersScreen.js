import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useConversations } from '../context/ConversationContext';

// ──────────────────────────────────────────────
// Mock provider data per service category
// ──────────────────────────────────────────────
const PROVIDERS_DATA = {
  Plumbing: [
    {
      id: '1', name: 'Karim Benali', initials: 'KB', avatarColor: '#4461F2',
      rating: 4.8, reviews: 124, price: '500 – 1 500 DT/h',
      phone: '+213 555 123 456', experience: '8 ans', available: true,
      specialty: 'Réparations urgentes, tuyauterie',
    },
    {
      id: '2', name: 'Youcef Aïdouni', initials: 'YA', avatarColor: '#E83E8C',
      rating: 4.6, reviews: 89, price: '600 – 1 800 DT/h',
      phone: '+213 661 234 567', experience: '12 ans', available: true,
      specialty: 'Installations sanitaires',
    },
    {
      id: '3', name: 'Abdelkader Mansouri', initials: 'AM', avatarColor: '#20C997',
      rating: 4.5, reviews: 67, price: '450 – 1 200 DT/h',
      phone: '+213 770 345 678', experience: '5 ans', available: false,
      specialty: 'Chauffe-eau, robinetterie',
    },
    {
      id: '4', name: 'Sofiane Khelil', initials: 'SK', avatarColor: '#FD7E14',
      rating: 4.9, reviews: 203, price: '800 – 2 000 DT/h',
      phone: '+213 699 456 789', experience: '15 ans', available: true,
      specialty: 'Plomberie générale & urgences',
    },
    {
      id: '5', name: 'Nassim Ouali', initials: 'NO', avatarColor: '#6F42C1',
      rating: 4.3, reviews: 45, price: '400 – 1 000 DT/h',
      phone: '+213 556 567 890', experience: '3 ans', available: true,
      specialty: 'Réparations fuites & joints',
    },
  ],
  Electrician: [
    {
      id: '1', name: 'Rachid Touati', initials: 'RT', avatarColor: '#FFC107',
      rating: 4.9, reviews: 187, price: '700 – 2 000 DT/h',
      phone: '+213 661 111 222', experience: '10 ans', available: true,
      specialty: 'Tableaux électriques, câblage',
    },
    {
      id: '2', name: 'Bilal Hamdani', initials: 'BH', avatarColor: '#4461F2',
      rating: 4.7, reviews: 134, price: '600 – 1 800 DT/h',
      phone: '+213 770 222 333', experience: '7 ans', available: true,
      specialty: 'Domotique, éclairage LED',
    },
    {
      id: '3', name: 'Omar Zerrouki', initials: 'OZ', avatarColor: '#E83E8C',
      rating: 4.5, reviews: 78, price: '500 – 1 500 DT/h',
      phone: '+213 555 333 444', experience: '6 ans', available: false,
      specialty: 'Prises, interrupteurs',
    },
    {
      id: '4', name: 'Hamza Bouzid', initials: 'HB', avatarColor: '#20C997',
      rating: 4.8, reviews: 156, price: '650 – 1 900 DT/h',
      phone: '+213 699 444 555', experience: '9 ans', available: true,
      specialty: 'Climatisation, courant fort/faible',
    },
  ],
  Cleaning: [
    {
      id: '1', name: 'Amira Sahraoui', initials: 'AS', avatarColor: '#20C997',
      rating: 4.9, reviews: 312, price: '1 500 – 4 000 DT/séance',
      phone: '+213 555 777 888', experience: '6 ans', available: true,
      specialty: 'Nettoyage appartements & bureaux',
    },
    {
      id: '2', name: 'Nadia Chérif', initials: 'NC', avatarColor: '#E83E8C',
      rating: 4.8, reviews: 201, price: '2 000 – 5 000 DT/séance',
      phone: '+213 661 888 999', experience: '8 ans', available: true,
      specialty: 'Nettoyage en profondeur',
    },
    {
      id: '3', name: 'Lynda Brahim', initials: 'LB', avatarColor: '#4461F2',
      rating: 4.7, reviews: 148, price: '1 200 – 3 500 DT/séance',
      phone: '+213 770 999 000', experience: '4 ans', available: true,
      specialty: 'Entretien régulier & vitreries',
    },
    {
      id: '4', name: 'Farida Meziani', initials: 'FM', avatarColor: '#FD7E14',
      rating: 4.5, reviews: 95, price: '1 000 – 3 000 DT/séance',
      phone: '+213 699 000 111', experience: '3 ans', available: false,
      specialty: 'Tapis, rideaux, désinfection',
    },
    {
      id: '5', name: 'Sonia Bensalem', initials: 'SB', avatarColor: '#6F42C1',
      rating: 4.6, reviews: 120, price: '1 300 – 3 800 DT/séance',
      phone: '+213 556 111 222', experience: '5 ans', available: true,
      specialty: 'Post-travaux, locaux commerciaux',
    },
  ],
  Moving: [
    {
      id: '1', name: 'Amine Kebir', initials: 'AK', avatarColor: '#FD7E14',
      rating: 4.7, reviews: 89, price: '5 000 – 15 000 DT/déménag.',
      phone: '+213 555 444 333', experience: '10 ans', available: true,
      specialty: 'Déménagement local & longue distance',
    },
    {
      id: '2', name: 'Walid Ferroukhi', initials: 'WF', avatarColor: '#4461F2',
      rating: 4.5, reviews: 64, price: '4 000 – 12 000 DT/déménag.',
      phone: '+213 661 555 444', experience: '7 ans', available: true,
      specialty: 'Emballage professionnel, montage meubles',
    },
    {
      id: '3', name: 'Samir Boudali', initials: 'SB', avatarColor: '#20C997',
      rating: 4.6, reviews: 77, price: '6 000 – 18 000 DT/déménag.',
      phone: '+213 770 666 555', experience: '12 ans', available: false,
      specialty: 'Camion 20m³, équipe de 4',
    },
    {
      id: '4', name: 'Djamel Latrèche', initials: 'DL', avatarColor: '#E83E8C',
      rating: 4.4, reviews: 43, price: '3 500 – 10 000 DT/déménag.',
      phone: '+213 699 777 666', experience: '5 ans', available: true,
      specialty: 'Mini-déménagements & livraisons',
    },
  ],
  Painting: [
    {
      id: '1', name: 'Mourad Attar', initials: 'MA', avatarColor: '#6F42C1',
      rating: 4.9, reviews: 156, price: '800 – 2 500 DT/m²',
      phone: '+213 555 888 777', experience: '14 ans', available: true,
      specialty: 'Peinture décorative, enduit',
    },
    {
      id: '2', name: 'Farid Azzoug', initials: 'FA', avatarColor: '#FD7E14',
      rating: 4.7, reviews: 98, price: '700 – 2 000 DT/m²',
      phone: '+213 661 999 888', experience: '9 ans', available: true,
      specialty: 'Façades, intérieur & extérieur',
    },
    {
      id: '3', name: 'Hichem Maamri', initials: 'HM', avatarColor: '#4461F2',
      rating: 4.6, reviews: 72, price: '600 – 1 800 DT/m²',
      phone: '+213 770 000 999', experience: '6 ans', available: false,
      specialty: 'Peinture appartement, ragréage',
    },
  ],
  Carpentry: [
    {
      id: '1', name: 'Tahar Bensaid', initials: 'TB', avatarColor: '#FD7E14',
      rating: 4.9, reviews: 88, price: '1 000 – 3 500 DT/h',
      phone: '+213 555 222 111', experience: '18 ans', available: true,
      specialty: 'Menuiserie bois, portes sur mesure',
    },
    {
      id: '2', name: 'Lyes Dahlab', initials: 'LD', avatarColor: '#20C997',
      rating: 4.7, reviews: 61, price: '900 – 3 000 DT/h',
      phone: '+213 661 333 222', experience: '11 ans', available: true,
      specialty: 'Placards, cuisines équipées',
    },
    {
      id: '3', name: 'Nacer Guechi', initials: 'NG', avatarColor: '#E83E8C',
      rating: 4.5, reviews: 39, price: '800 – 2 500 DT/h',
      phone: '+213 770 444 333', experience: '7 ans', available: false,
      specialty: 'Parquet, lambris, plafonds',
    },
  ],
};

// ──────────────────────────────────────────────
// Icon map reused from ServicesScreen
// ──────────────────────────────────────────────
const SERVICE_ICONS = {
  Plumbing: 'water-outline',
  Electrician: 'flash-outline',
  Cleaning: 'sparkles-outline',
  Moving: 'cube-outline',
  Painting: 'color-palette-outline',
  Carpentry: 'hammer-outline',
};

// ──────────────────────────────────────────────
// Star rating component
// ──────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color="#FFC107"
          style={{ marginRight: 1 }}
        />
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ──────────────────────────────────────────────
// Provider card
// ──────────────────────────────────────────────
function ProviderCard({ provider, navigation }) {
  const { openOrCreateConversation } = useConversations();

  const handleChat = () => {
    openOrCreateConversation({
      id: `service_${provider.id}_${provider.name}`,
      name: provider.name,
      avatarColor: provider.avatarColor,
      tag: 'service',
    });
    navigation.navigate('Chat', {
      personId: `service_${provider.id}_${provider.name}`,
    });
  };

  const handleCall = () => {
    const phoneUrl = `tel:${provider.phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) Linking.openURL(phoneUrl);
        else Alert.alert('Erreur', 'Impossible de passer un appel sur cet appareil.');
      })
      .catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir le numéro.'));
  };

  const handleWhatsApp = () => {
    const number = provider.phone.replace(/[\s+]/g, '');
    const url = `whatsapp://send?phone=${number}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Alert.alert('WhatsApp', 'WhatsApp n\'est pas installé sur cet appareil.');
      })
      .catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp.'));
  };

  return (
    <View style={styles.card}>
      {/* Top row: avatar + info */}
      <View style={styles.cardTop}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: provider.avatarColor + '22' }]}>
          <Text style={[styles.avatarText, { color: provider.avatarColor }]}>
            {provider.initials}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
            <View style={[styles.badge, provider.available ? styles.badgeAvail : styles.badgeBusy]}>
              <Text style={[styles.badgeText, { color: provider.available ? COLORS.success : '#EF233C' }]}>
                {provider.available ? 'Disponible' : 'Occupé'}
              </Text>
            </View>
          </View>

          <StarRating rating={provider.rating} />
          <Text style={styles.reviewsText}>{provider.reviews} avis</Text>

          <View style={styles.tagRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.textLight} />
            <Text style={styles.tagText}>{provider.experience} d'exp.</Text>
          </View>

          <Text style={styles.specialty} numberOfLines={2}>{provider.specialty}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row: price + contact buttons */}
      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.priceLabel}>Tarif</Text>
          <Text style={styles.price}>{provider.price}</Text>
        </View>

        <View style={styles.btnRow}>
          {/* Chat */}
          <TouchableOpacity style={styles.btnChat} onPress={handleChat} activeOpacity={0.8}>
            <Ionicons name="chatbubble-ellipses" size={17} color={COLORS.primary} />
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity style={styles.btnWA} onPress={handleWhatsApp} activeOpacity={0.8}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Call */}
          <TouchableOpacity style={styles.btnCall} onPress={handleCall} activeOpacity={0.8}>
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.btnCallText}>Appeler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Main screen
// ──────────────────────────────────────────────
export default function ServiceProvidersScreen({ route, navigation }) {
  const { service } = route.params; // e.g. { title: 'Plumbing', icon: 'water-outline' }
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'price'

  const providers = PROVIDERS_DATA[service.title] ?? [];

  const sorted = [...providers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    // Sort by minimum price (extract first number)
    const getMin = (p) => parseInt(p.price.replace(/\s/g, '').split('–')[0], 10) || 0;
    return getMin(a) - getMin(b);
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: COLORS.accent + '18' }]}>
            <Ionicons name={service.icon} size={22} color={COLORS.accent} />
          </View>
          <View>
            <Text style={styles.headerTitle}>{service.title}</Text>
            <Text style={styles.headerSub}>{providers.length} prestataires</Text>
          </View>
        </View>
      </View>

      {/* ── Sort pills ── */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Trier par :</Text>
        {['rating', 'price'].map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.pill, sortBy === opt && styles.pillActive]}
            onPress={() => setSortBy(opt)}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, sortBy === opt && styles.pillTextActive]}>
              {opt === 'rating' ? '⭐ Note' : '💰 Prix'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Provider list ── */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {sorted.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} navigation={navigation} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.small,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
    marginRight: SIZES.medium,
    ...SHADOWS.light,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginRight: SIZES.small,
  },
  headerTitle: { ...FONTS.h2, color: COLORS.text },
  headerSub: { ...FONTS.caption, color: COLORS.textLight, marginTop: 2 },

  // Sort
  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.medium, paddingVertical: SIZES.small,
    gap: 8,
  },
  sortLabel: { ...FONTS.caption, color: COLORS.textLight, marginRight: 4 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: SIZES.radius.pill, backgroundColor: COLORS.card,
    borderWidth: 1.5, borderColor: 'transparent',
    ...SHADOWS.xs,
  },
  pillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryOpacity },
  pillText: { ...FONTS.caption, color: COLORS.textLight, fontWeight: '600' },
  pillTextActive: { color: COLORS.primary },

  // List
  listContent: { padding: SIZES.medium, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.xl,
    marginBottom: SIZES.medium,
    padding: SIZES.medium,
    ...SHADOWS.light,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },

  // Avatar
  avatar: {
    width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
    marginRight: SIZES.medium,
  },
  avatarText: { fontSize: 20, fontWeight: '700' },

  // Info block
  infoBlock: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  providerName: { ...FONTS.h3, color: COLORS.text, flex: 1, marginRight: 8 },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeAvail: { backgroundColor: '#4CAF5020' },
  badgeBusy: { backgroundColor: '#EF233C20' },
  badgeText: { fontSize: 10, fontWeight: '700' },

  starRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  ratingText: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginLeft: 4 },
  reviewsText: { ...FONTS.caption, color: COLORS.textLight, marginBottom: 4 },

  tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tagText: { ...FONTS.caption, color: COLORS.textLight, marginLeft: 4 },

  specialty: { ...FONTS.caption, color: COLORS.textLight, lineHeight: 16 },

  // Divider
  divider: { height: 1, backgroundColor: COLORS.line, marginVertical: SIZES.small },

  // Card bottom
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { ...FONTS.body2, fontWeight: '700', color: COLORS.primary, marginTop: 2 },

  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnChat: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primaryOpacity,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },
  btnWA: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },
  btnCall: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, gap: 6,
    ...SHADOWS.light,
  },
  btnCallText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

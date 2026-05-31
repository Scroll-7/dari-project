import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Image, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useUser } from '../context/UserContext';
import { FONTS, SIZES, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function PostPropertyScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user } = useUser();
  const editProperty = route?.params?.editProperty;

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [area, setArea] = useState('');
  const [images, setImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [propertyType, setPropertyType] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [tour360, setTour360] = useState('');

  const PROPERTY_TYPES = [
    { key: 'Apartments', label: 'Apartments', icon: 'business-outline' },
    { key: 'Houses',     label: 'Houses',     icon: 'home-outline' },
    { key: 'Rooms',      label: 'Rooms',      icon: 'bed-outline' },
    { key: 'Commercial', label: 'Commercial', icon: 'briefcase-outline' },
  ];

  const AMENITIES = [
    { key: 'wifi',    icon: 'wifi-outline',           label: 'WiFi' },
    { key: 'parking', icon: 'car-outline',            label: 'Parking' },
    { key: 'ac',      icon: 'snow-outline',           label: 'A/C' },
    { key: 'secured', icon: 'shield-checkmark-outline', label: 'Secured' },
    { key: 'tv',      icon: 'tv-outline',             label: 'TV' },
    { key: 'gym',     icon: 'fitness-outline',        label: 'Gym' },
  ];

  const toggleAmenity = (key) => {
    setSelectedAmenities(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    if (editProperty) {
      setDescription(editProperty.description || '');
      setLocation(editProperty.city || '');
      setBudget(editProperty.price?.toString() || '');
      setBedrooms(editProperty.bedrooms?.toString() || '');
      setArea(editProperty.area?.toString() || '');
      setImages(editProperty.images || (editProperty.image ? [editProperty.image] : []));
      setImages(editProperty.images || (editProperty.image ? [editProperty.image] : []));
      setSelectedAmenities(editProperty.amenities || []);
      setTour360(editProperty.tour360 || '');
      setPropertyType(editProperty.type || '');
    }
  }, [editProperty]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...newUris]);
    }
  };

  const handlePost = async () => {
    if (!description.trim() || !propertyType) return;
    setIsPosting(true);
    try {
      const db = getFirestore();
      
      const payload = {
        title: description.split('\n')[0] || 'Nouvelle annonce',
        description,
        price: Number(budget) || 0,
        period: 'mo',
        city: location || 'Tunis',
        neighborhood: location || 'Tunis',
        area: Number(area) || 0,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: 0,
        type: propertyType,
        image: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        images: images,
        amenities: selectedAmenities,
        tour360: tour360.trim() || null,
        uid: getAuth().currentUser?.uid,
        agent: {
          name: user?.name || user?.username || 'Propriétaire',
          image: user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        }
      };

      if (editProperty) {
        await updateDoc(doc(db, 'properties', editProperty.id), payload);
      } else {
        await addDoc(collection(db, 'properties'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      navigation.goBack();
    } catch (e) {
      console.warn("Error posting property", e);
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{editProperty ? 'Modifier Annonce' : 'Create Listing'}</Text>
          <TouchableOpacity 
            style={[styles.postBtn, (!description.trim() || !propertyType || isPosting) && { opacity: 0.5 }]}
            disabled={!description.trim() || !propertyType || isPosting}
            onPress={handlePost}
          >
            <Text style={styles.postBtnText}>{isPosting ? 'Sauvegarde...' : (editProperty ? 'Sauvegarder' : 'Post')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.userInfo}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{(user?.name || 'P').charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={styles.userName}>{user?.name || 'Propriétaire'}</Text>
              <View style={styles.privacyPill}>
                <Ionicons name="globe-outline" size={12} color={colors.textLight} />
                <Text style={styles.privacyText}>Public</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Que proposez-vous ? (ex: Appartement S+3 à louer...)"
            placeholderTextColor={colors.textLight}
            multiline
            autoFocus={!editProperty}
            value={description}
            onChangeText={setDescription}
          />

          {/* Catégorie (Obligatoire) */}
          <Text style={styles.sectionLabel}>Catégorie <Text style={styles.reqLabel}>*</Text></Text>
          <View style={styles.amenitiesGrid}>
            {PROPERTY_TYPES.map(pt => {
              const active = propertyType === pt.key;
              return (
                <TouchableOpacity
                  key={pt.key}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  onPress={() => setPropertyType(pt.key)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={pt.icon} size={16} color={active ? colors.white : colors.textLight} />
                  <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{pt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.fieldsContainer}>
            <View style={styles.fieldWrap}>
              <Ionicons name="location-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Lieu (ex: Tunis, Menzah...)"
                placeholderTextColor={colors.textLight}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Ionicons name="cash-outline" size={20} color={colors.textLight} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Prix mensuel (TND)"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
              />
            </View>
            <View style={styles.fieldWrapRow}>
              <View style={[styles.fieldWrap, { flex: 1, marginRight: 8 }]}>
                <Ionicons name="bed-outline" size={20} color={colors.textLight} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Chambres (opt)"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                />
              </View>
              <View style={[styles.fieldWrap, { flex: 1, marginLeft: 8 }]}>
                <Ionicons name="resize-outline" size={20} color={colors.textLight} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Surface m² (opt)"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  value={area}
                  onChangeText={setArea}
                />
              </View>
            </View>
          </View>

          {/* Équipements */}
          <Text style={styles.sectionLabel}>Équipements <Text style={styles.optLabel}>(optionnel)</Text></Text>
          <View style={styles.amenitiesGrid}>
            {AMENITIES.map(a => {
              const active = selectedAmenities.includes(a.key);
              return (
                <TouchableOpacity
                  key={a.key}
                  style={[styles.amenityChip, active && styles.amenityChipActive]}
                  onPress={() => toggleAmenity(a.key)}
                  activeOpacity={0.75}
                >
                  <Ionicons name={a.icon} size={16} color={active ? colors.primary : colors.textLight} />
                  <Text style={[styles.amenityLabel, active && styles.amenityLabelActive]}>{a.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Visite 360° (optionnel) */}
          <Text style={styles.sectionLabel}>Visite 360° <Text style={styles.optLabel}>(optionnel)</Text></Text>
          <View style={styles.fieldWrap}>
            <Ionicons name="videocam-outline" size={20} color={colors.textLight} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Lien URL de votre visite 360°..."
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              keyboardType="url"
              value={tour360}
              onChangeText={setTour360}
            />
          </View>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.previewImg} />
                  <TouchableOpacity 
                    style={styles.removeImgBtn} 
                    onPress={() => setImages(images.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage} disabled={isPosting}>
            <Ionicons name="images" size={24} color="#45BD62" />
            <Text style={styles.actionText}>Photos/Video</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { ...FONTS.h3, color: colors.text, fontWeight: '700' },
  postBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: { color: colors.white, fontWeight: 'bold' },
  content: { padding: SIZES.medium },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.large },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24, marginRight: 12,
    backgroundColor: colors.primaryOpacity, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  userName: { ...FONTS.h3, color: colors.text, marginBottom: 2 },
  privacyPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12, alignSelf: 'flex-start',
  },
  privacyText: { fontSize: 10, color: colors.textLight, fontWeight: '600' },
  input: {
    ...FONTS.body1,
    fontSize: 20,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  fieldsContainer: {
    marginTop: 10,
    gap: 12,
  },
  fieldWrapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  fieldInput: {
    flex: 1,
    marginLeft: 10,
    ...FONTS.body1,
    color: colors.text,
  },
  imageScroll: { marginTop: 16, maxHeight: 200 },
  imageWrap: { marginRight: 10, position: 'relative' },
  previewImg: { width: 150, height: 200, borderRadius: 12 },
  removeImgBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingVertical: 12,
    paddingHorizontal: SIZES.medium,
    backgroundColor: colors.card,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    flex: 1, justifyContent: 'center',
  },
  actionText: { ...FONTS.body2, color: colors.text, fontWeight: '500' },

  // Équipements
  sectionLabel: {
    ...FONTS.h3,
    color: colors.text,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  optLabel: {
    ...FONTS.caption,
    color: colors.textLight,
    fontWeight: '400',
  },
  reqLabel: {
    color: colors.error,
    fontWeight: '700',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  amenityChipActive: {
    backgroundColor: colors.primaryOpacity,
    borderColor: colors.primary,
  },
  amenityLabel: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  amenityLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Catégorie Chips
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.line,
    width: '47%', // 2 per row
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  typeLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },
});


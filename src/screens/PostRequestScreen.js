import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Image, ScrollView, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import {
  getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc
} from 'firebase/firestore';
import { useUser } from '../context/UserContext';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

const db = getFirestore();

export default function PostRequestScreen({ route, navigation }) {
  const { user } = useUser();
  const editPost = route.params?.editPost;
  const isEditing = !!editPost;

  const [description, setDescription] = useState(editPost?.description || '');
  const [budget, setBudget] = useState(editPost?.budget || '');
  const [city, setCity] = useState(editPost?.city || user?.city || '');
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages([...images, ...newUris]);
    }
  };

  const handlePost = async () => {
    if (!description.trim()) return;
    setPosting(true);
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');

      if (isEditing) {
        await updateDoc(doc(db, 'roommatePosts', editPost.firestoreId), {
          city: city.trim(),
          description: description.trim(),
          budget: budget.trim(),
        });
        Alert.alert('Succès', 'Votre annonce a été mise à jour.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addDoc(collection(db, 'roommatePosts'), {
          uid,
          name: user?.name || user?.username || 'Utilisateur',
          username: user?.username || '',
          city: city.trim() || user?.city || '',
          description: description.trim(),
          budget: budget.trim(),
          createdAt: serverTimestamp(),
          interests: [],
          habits: [],
        });
        Alert.alert('Publié !', 'Votre annonce est maintenant visible dans Colocataires.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'enregistrer l'annonce.");
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  const initials = (user?.name || user?.username || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{isEditing ? 'Modifier annonce' : 'Recherche colocation'}</Text>
          <TouchableOpacity
            style={[styles.postBtn, (!description.trim() || posting) && { opacity: 0.5 }]}
            disabled={!description.trim() || posting}
            onPress={handlePost}
          >
            {posting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.postBtnText}>{isEditing ? 'Enregistrer' : 'Publier'}</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* User info row */}
          <View style={styles.userInfo}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{initials}</Text>
              </View>
            )}
            <View>
              <Text style={styles.userName}>{user?.name || user?.username || 'Chercheur'}</Text>
              <View style={styles.privacyPill}>
                <Ionicons name="globe-outline" size={12} color={COLORS.textLight} />
                <Text style={styles.privacyText}>Visible par tous</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <TextInput
            style={styles.input}
            placeholder="Décrivez ce que vous cherchez : type de logement, coloc idéal, quartier préféré…"
            placeholderTextColor={COLORS.textLight}
            multiline
            autoFocus
            value={description}
            onChangeText={setDescription}
          />

          {/* Budget & City fields */}
          <View style={styles.fieldsRow}>
            <View style={styles.fieldWrap}>
              <Ionicons name="cash-outline" size={16} color={COLORS.primary} style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Budget (ex: 400–600 DT)"
                placeholderTextColor={COLORS.textLight}
                value={budget}
                onChangeText={setBudget}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Ionicons name="location-outline" size={16} color={COLORS.primary} style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Ville (ex: Tunis)"
                placeholderTextColor={COLORS.textLight}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          {/* Image previews */}
          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrap}>
                  <Image source={{ uri }} style={styles.previewImg} />
                  <TouchableOpacity
                    style={styles.removeImgBtn}
                    onPress={() => setImages(images.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#45BD62" />
            <Text style={styles.actionText}>Photos</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.line,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { ...FONTS.h3, color: COLORS.text, fontWeight: '700' },
  postBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20, minWidth: 72, alignItems: 'center',
  },
  postBtnText: { color: '#fff', fontWeight: 'bold' },

  content: { padding: SIZES.medium },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.large },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24, marginRight: 12,
    backgroundColor: COLORS.primaryOpacity, justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  userName: { ...FONTS.h3, color: COLORS.text, marginBottom: 2 },
  privacyPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.card, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12, alignSelf: 'flex-start',
  },
  privacyText: { fontSize: 10, color: COLORS.textLight, fontWeight: '600' },

  input: {
    ...FONTS.body1, fontSize: 18, color: COLORS.text,
    minHeight: 120, textAlignVertical: 'top', marginBottom: SIZES.medium,
  },

  fieldsRow: { gap: 10, marginBottom: SIZES.medium },
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: SIZES.radius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.line,
  },
  fieldIcon: { marginRight: 8 },
  fieldInput: { flex: 1, ...FONTS.body2, color: COLORS.text },

  imageScroll: { marginTop: 8, maxHeight: 200 },
  imageWrap: { marginRight: 10, position: 'relative' },
  previewImg: { width: 150, height: 200, borderRadius: 12 },
  removeImgBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 12,
  },

  footer: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.line,
    paddingVertical: 12, paddingHorizontal: SIZES.medium, backgroundColor: COLORS.white,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  actionText: { ...FONTS.body2, color: COLORS.text, fontWeight: '500' },
});

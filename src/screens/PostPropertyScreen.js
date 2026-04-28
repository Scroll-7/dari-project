import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Image, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

export default function PostPropertyScreen({ navigation }) {
  const { user } = useUser();
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);

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

  const handlePost = () => {
    // Logic to actually upload the post to Firestore would go here
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Listing</Text>
          <TouchableOpacity 
            style={[styles.postBtn, !description.trim() && { opacity: 0.5 }]}
            disabled={!description.trim()}
            onPress={handlePost}
          >
            <Text style={styles.postBtnText}>Post</Text>
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
                <Ionicons name="globe-outline" size={12} color={COLORS.textLight} />
                <Text style={styles.privacyText}>Public</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Describe your property (price, rooms, location)..."
            placeholderTextColor={COLORS.textLight}
            multiline
            autoFocus
            value={description}
            onChangeText={setDescription}
          />

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

        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
            <Ionicons name="images" size={24} color="#45BD62" />
            <Text style={styles.actionText}>Photos/Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="location" size={24} color="#F5533D" />
            <Text style={styles.actionText}>Location</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.medium,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { ...FONTS.h3, color: COLORS.text, fontWeight: '700' },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    ...FONTS.body1,
    fontSize: 20,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
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
    borderTopColor: COLORS.line,
    paddingVertical: 12,
    paddingHorizontal: SIZES.medium,
    backgroundColor: COLORS.white,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    flex: 1, justifyContent: 'center',
  },
  actionText: { ...FONTS.body2, color: COLORS.text, fontWeight: '500' },
});

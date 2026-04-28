// screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';

export default function SettingsScreen({ navigation }) {
  const { user, updateUser } = useUser();

  const [name, setName]   = useState(user.name);
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity]   = useState(user.city);
  const [photo, setPhoto] = useState(user.photo);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSave = async () => {
    await updateUser({ name, username, email, phone, city, photo });
    Alert.alert('Saved', 'Your profile has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhoto}>Tap to change photo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal Information</Text>
          <Field label="Full Name" value={name}  onChange={setName}  icon="person-outline" />
          <Field label="Username"  value={username} onChange={setUsername} icon="at-outline" />
          <Field label="Email"     value={email} onChange={setEmail} icon="mail-outline"   keyboardType="email-address" />
          <Field label="Phone"     value={phone} onChange={setPhone} icon="call-outline"   keyboardType="phone-pad" />
          <Field label="City"      value={city}  onChange={setCity}  icon="location-outline" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, icon, keyboardType }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={16} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#222' },
  scroll: { padding: 20 },
  photoSection: { alignItems: 'center', marginBottom: 28 },
  photoWrap: { position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 45 },
  photoPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#4461F2', alignItems: 'center', justifyContent: 'center' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4461F2', borderRadius: 12, padding: 5, borderWidth: 2, borderColor: '#F5F7FA' },
  changePhoto: { marginTop: 8, fontSize: 12, color: '#888' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 1 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#4461F2', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FAFAFA' },
  input: { flex: 1, fontSize: 14, color: '#333' },
  saveBtn: { backgroundColor: '#4461F2', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

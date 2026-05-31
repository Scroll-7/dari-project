import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export default function MyListingsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const auth = getAuth();
    const myUid = auth.currentUser?.uid;
    if (!myUid) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const collectionName = user?.role === 'landlord' ? 'properties' : 'roommatePosts';
    const q = query(
      collection(db, collectionName), 
      where('uid', '==', myUid)
    );

    const unsub = onSnapshot(q, (snap) => {
      let myPosts = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      // Firestore `where` doesn't strictly sort by createdAt unless there is a composite index.
      // So we'll sort locally to be safe.
      myPosts.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPosts(myPosts);
      setLoading(false);
    });

    return unsub;
  }, [user?.role]);

  const handleDelete = (id) => {
    Alert.alert('Confirmer', 'Voulez-vous vraiment supprimer cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', 
        style: 'destructive',
        onPress: async () => {
          try {
            const db = getFirestore();
            const collectionName = user?.role === 'landlord' ? 'properties' : 'roommatePosts';
            await deleteDoc(doc(db, collectionName, id));
          } catch (e) {
            Alert.alert('Erreur', 'Impossible de supprimer cette annonce.');
            console.error(e);
          }
        }
      }
    ]);
  };

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.roleText}>{item.title || item.description?.slice(0, 50) || 'Annonce'}</Text>
        <Text style={styles.price}>{item.price || item.budget ? `${item.price || item.budget} DT` : ''}</Text>
      </View>
      <View style={styles.locationWrap}>
        <Ionicons name="location-outline" size={14} color={colors.textLight} />
        <Text style={styles.locationText}>{item.city || 'Non spécifié'}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => {
            if (user?.role === 'landlord') {
              // Optionally handle property edit here
            } else {
              navigation.navigate('PostRequest', { editPost: item });
            }
          }}
        >
          <Ionicons name="pencil" size={16} color={colors.white} />
          <Text style={styles.btnText}>Modifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => handleDelete(item.firestoreId)}
        >
          <Ionicons name="trash" size={16} color={colors.white} />
          <Text style={styles.btnText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Annonces</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4461F2" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={56} color="#ccc" />
          <Text style={styles.emptyTitle}>Aucune annonce</Text>
          <Text style={styles.emptyText}>Vos annonces apparaîtront ici.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate(user?.role === 'landlord' ? 'PostProperty' : 'PostRequest')}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.addBtnText}>Publier une annonce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.firestoreId}
          renderItem={renderPost}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderColor: colors.line 
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 8 },
  addBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, 
    borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 24 
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 14, marginLeft: 6 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 16,
    ...colors.shadows?.medium,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roleText: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary },
  locationWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { fontSize: 13, color: colors.textLight, marginLeft: 4 },
  actions: { flexDirection: 'row', marginTop: 16, gap: 8 },
  editBtn: { 
    flex: 1, flexDirection: 'row', backgroundColor: colors.primary, 
    borderRadius: 10, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' 
  },
  deleteBtn: { 
    flex: 1, flexDirection: 'row', backgroundColor: colors.error, 
    borderRadius: 10, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' 
  },
  btnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

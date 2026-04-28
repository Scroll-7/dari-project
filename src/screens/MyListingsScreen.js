import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';

export default function MyListingsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const myUid = auth.currentUser?.uid;
    if (!myUid) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const q = query(
      collection(db, 'roommatePosts'), 
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
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Confirmer', 'Voulez-vous vraiment supprimer cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Supprimer', 
        style: 'destructive',
        onPress: async () => {
          try {
            const db = getFirestore();
            await deleteDoc(doc(db, 'roommatePosts', id));
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
        <Text style={styles.roleText}>{item.description?.slice(0, 50) || 'Cherche colocation'}</Text>
        <Text style={styles.price}>{item.budget ? `${item.budget} DT` : ''}</Text>
      </View>
      <View style={styles.locationWrap}>
        <Ionicons name="location-outline" size={14} color="#888" />
        <Text style={styles.locationText}>{item.city || 'Non spécifié'}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('PostRequest', { editPost: item })}
        >
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.btnText}>Modifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => handleDelete(item.firestoreId)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.btnText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
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
          <Text style={styles.emptyText}>Vos annonces de colocation apparaîtront ici.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('PostRequest')}>
            <Ionicons name="add" size={18} color="#fff" />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' 
  },
  title: { fontSize: 18, fontWeight: '700', color: '#222' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8 },
  addBtn: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#4461F2', 
    borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, marginTop: 24 
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roleText: { fontSize: 15, fontWeight: '600', color: '#222', flex: 1, marginRight: 8 },
  price: { fontSize: 15, fontWeight: '700', color: '#4461F2' },
  locationWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { fontSize: 13, color: '#666', marginLeft: 4 },
  actions: { flexDirection: 'row', marginTop: 16, gap: 8 },
  editBtn: { 
    flex: 1, flexDirection: 'row', backgroundColor: '#4461F2', 
    borderRadius: 10, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' 
  },
  deleteBtn: { 
    flex: 1, flexDirection: 'row', backgroundColor: '#FF4B4B', 
    borderRadius: 10, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' 
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getAllUsers, searchUsersByUsername, getOrCreateConversation } from '../firebase/chat';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#4461F2';

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

const AVATAR_COLORS = ['#4461F2','#E83E8C','#20C997','#FD7E14','#6F42C1','#FFC107','#D85A30'];
function pickColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function NewChatScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const myUid = getAuth().currentUser?.uid;
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    getAllUsers(myUid)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [myUid]);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.username || '').toLowerCase().includes(q) ||
      (u.fullName || '').toLowerCase().includes(q)
    );
  });

  const handleStartChat = async (otherUser) => {
    if (starting) return;
    setStarting(otherUser.uid);
    await getOrCreateConversation(myUid, otherUser.uid);
    setStarting(null);
    navigation.replace('Chat', {
      otherUid: otherUser.uid,
      otherName: otherUser.fullName || otherUser.username || 'Utilisateur',
      otherUsername: otherUser.username || '',
    });
  };

  const renderUser = ({ item }) => {
    const name = item.fullName || item.username || 'Utilisateur';
    const color = pickColor(name);
    const isStarting = starting === item.uid;
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handleStartChat(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
          <Text style={[styles.avatarText, { color }]}>{getInitials(name)}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{name}</Text>
          {!!item.username && (
            <Text style={styles.userHandle}>@{item.username}</Text>
          )}
          {!!item.city && (
            <Text style={styles.userCity}>
              <Ionicons name="location-outline" size={11} color="#aaa" /> {item.city}
            </Text>
          )}
        </View>
        {isStarting ? (
          <ActivityIndicator color={ACCENT} size="small" />
        ) : (
          <View style={styles.msgBtn}>
            <Ionicons name="chatbubble-outline" size={16} color={ACCENT} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau message</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={ACCENT} size="large" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={52} color="#ddd" />
          <Text style={styles.emptyTitle}>Aucun utilisateur trouvé</Text>
          <Text style={styles.emptyHint}>Essayez un autre nom ou username</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.uid}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 14, color: '#aaa', marginTop: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 8 },
  emptyHint: { fontSize: 13, color: '#aaa' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 8,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },

  list: { paddingBottom: 20 },
  sep: { height: 1, backgroundColor: '#f5f5f5', marginLeft: 76 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 17, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: colors.text },
  userHandle: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  userCity: { fontSize: 11, color: '#aaa', marginTop: 2 },
  msgBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ACCENT + '15',
    justifyContent: 'center', alignItems: 'center',
  },
});





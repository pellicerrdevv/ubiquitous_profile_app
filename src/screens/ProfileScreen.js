import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function ProfileScreen({ navigation }) {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigation.navigate('Login');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.profileBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userEmail}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Visited Places</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Map will be displayed here</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <Text style={styles.statText}>Total visits: 0</Text>
        <Text style={styles.statText}>Unique places: 0</Text>
        <Text style={styles.statText}>Last location: Not captured</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  profileBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  placeholder: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#ddd'
  },
  placeholderText: {
    fontSize: 14,
    color: '#999'
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

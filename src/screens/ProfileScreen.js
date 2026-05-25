import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, Animated, Platform
} from 'react-native';
import * as Location from 'expo-location';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Importamos el mapa de móvil de forma segura utilizando lazy loading dinámico
const MobileMap = Platform.OS !== 'web' ? require('./MobileMap').default : null;

export default function ProfileScreen({ navigation }) {
  const [userEmail, setUserEmail] = useState('');
  const [visits, setVisits] = useState([]);
  const [lastLocation, setLastLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        loadVisits(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  const loadVisits = async (uid) => {
    try {
      setLoadingStats(true);
      const q = query(collection(db, 'visits'), where('uid', '==', uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      
      const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setVisits(sortedData);
      
      if (sortedData.length > 0) {
        setLastLocation(sortedData[sortedData.length - 1]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las visitas: ' + error.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const captureLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para registrar el lugar.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const newVisit = {
        uid: auth.currentUser.uid,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, 'visits'), newVisit);
      const updated = [...visits, newVisit];
      setVisits(updated);
      setLastLocation(newVisit);
      Alert.alert('¡Lugar registrado!', `Lat: ${newVisit.lat.toFixed(5)}\nLng: ${newVisit.lng.toFixed(5)}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCapturePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    captureLocation();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const uniquePlaces = new Set(
    visits.map(v => `${v.lat.toFixed(3)},${v.lng.toFixed(3)}`)
  ).size;

  const mapRegion = lastLocation ? {
    latitude: lastLocation.lat,
    longitude: lastLocation.lng,
    latitudeDelta: 0.04, 
    longitudeDelta: 0.04,
  } : {
    latitude: 40.416775,
    longitude: -3.703790,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Caja del perfil animada */}
      <Animated.View style={[styles.profileBox, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userEmail}</Text>
      </Animated.View>

      {/* MAPA INTERACTIVO CON FILTRO SEGURO PARA WEB */}
      <Animated.View style={[styles.mapContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapFallback}>
            <Text style={styles.webMapText}>🗺️ El mapa interactivo solo está disponible en el móvil.</Text>
          </View>
        ) : (
          MobileMap && <MobileMap mapRegion={mapRegion} visits={visits} />
        )}
      </Animated.View>

      {/* Botón de registrar con animación de escala */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.captureButton, loadingLocation && styles.buttonDisabled]}
          onPress={handleCapturePress}
          disabled={loadingLocation}
        >
          {loadingLocation
            ? <ActivityIndicator color="white" />
            : <Text style={styles.captureButtonText}>📍 Registrar ubicación actual</Text>
          }
        </TouchableOpacity>
      </Animated.View>

      {/* Estadísticas animadas */}
      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        {loadingStats ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total visitas</Text>
              <Text style={styles.statValue}>{visits.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Lugares únicos</Text>
              <Text style={styles.statValue}>{uniquePlaces}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Última ubicación</Text>
              <Text style={styles.statValue}>
                {lastLocation ? `${lastLocation.lat.toFixed(4)}, ${lastLocation.lng.toFixed(4)}` : 'No capturada'}
              </Text>
            </View>
          </>
        )}
      </Animated.View>

      {/* HISTORIAL DE VISITAS DETALLADO */}
      <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>Historial de Rutas</Text>
        {visits.length === 0 && !loadingStats ? (
          <Text style={styles.noVisitsText}>Aún no has registrado ningún lugar.</Text>
        ) : (
          [...visits].reverse().map((visit, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyBadge}>📌 Visita #{visits.length - index}</Text>
                <Text style={styles.historyDate}>
                  {new Date(visit.timestamp).toLocaleDateString()} {new Date(visit.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
              <Text style={styles.historyCoords}>
                Lat: {visit.lat.toFixed(6)} | Lng: {visit.lng.toFixed(6)}
              </Text>
            </View>
          ))
        )}
      </Animated.View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  profileBox: {
    backgroundColor: 'white', padding: 15, borderRadius: 8,
    marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#007AFF',
  },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600', color: '#333' },

  mapContainer: {
    height: 220, width: '100%', borderRadius: 12, 
    overflow: 'hidden', marginBottom: 20, backgroundColor: '#e0e0e0',
    borderWidth: 1, borderColor: '#ddd'
  },
  webMapFallback: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 20, backgroundColor: '#eaeaea'
  },
  webMapText: { color: '#666', textAlign: 'center', fontSize: 14, fontWeight: '500' },

  captureButton: {
    backgroundColor: '#007AFF', padding: 14,
    borderRadius: 8, alignItems: 'center', marginBottom: 20,
  },
  buttonDisabled: { backgroundColor: '#aaa' },
  captureButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  statRow: {
    backgroundColor: 'white', padding: 12, borderRadius: 8,
    marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between',
  },
  statLabel: { fontSize: 14, color: '#666' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  
  noVisitsText: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginVertical: 10 },
  historyCard: {
    backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8,
    borderWidth: 1, borderColor: '#e0e0e0'
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyBadge: { fontSize: 13, fontWeight: 'bold', color: '#007AFF' },
  historyDate: { fontSize: 12, color: '#888' },
  historyCoords: { fontSize: 12, color: '#555', fontFamily: 'monospace' },

  logoutButton: {
    backgroundColor: '#ff3b30', padding: 12, borderRadius: 8,
    alignItems: 'center', marginTop: 10, marginBottom: 40,
  },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
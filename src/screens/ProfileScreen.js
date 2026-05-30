import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Animated, Platform, Pressable,
  useWindowDimensions, Image
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useSettings } from '../context/SettingsContext';

// 🔔 IMPORTANTE: Librería nativa para empujar notificaciones locales
import * as Notifications from 'expo-notifications';

// 🚀 OPCIÓN 1: Importación limpia directa. 
// Metro resolverá automáticamente hacia MobileMap.web.js o MobileMap.native.js
import MobileMap from './MobileMap';

// Configuración obligatoria para que los banners se muestren con la app en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen({ navigation }) {
  // 🎨 Consumimos 't' y 'theme' directamente del contexto unificado de configuración
  const { theme, t, isDarkMode, setIsDarkMode, lang, setLang } = useSettings();
  
  // 📐 DETECCION EN TIEMPO REAL DE DIMENSIONES (Responsive Design)
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width > 768;

  // --- ESTADOS DE UI ---
  const [menuVisible, setMenuVisible] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [visits, setVisits] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // 📸 ESTADO PARA LA URI DE LA FOTO DE PERFIL
  const [profileImage, setProfileImage] = useState(null);

  // 🗺️ ESTADO DINÁMICO DE LA REGIÓN DEL MAPA
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 40.416775,
    longitude: -3.703790,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  // 📂 ESTADO PARA CONTROLAR EL ACORDEÓN DEL HISTORIAL
  const [expandedIndex, setExpandedIndex] = useState(null);

  // --- ANIMACIONES ---
  const menuAnim = useRef(new Animated.Value(0)).current;
  const toastY = useRef(new Animated.Value(-100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleMenu}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.headerAvatar} />
          ) : (
            <Text style={styles.headerIcon}>👤</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, menuVisible, profileImage]);

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }
  };

  const showCustomToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    Animated.parallel([
      Animated.timing(toastY, { toValue: 20, duration: 400, useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 400, useNativeDriver: true })
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastY, { toValue: -100, duration: 400, useNativeDriver: true }),
          Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true })
        ]).start(() => setToastVisible(false));
      }, 3500);
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        loadVisits(user.uid);
        loadProfileImage(user.uid); 
      }
    });
    return unsubscribe;
  }, []);

  const loadProfileImage = async (uid) => {
    try {
      const savedImage = await AsyncStorage.getItem(`profile_img_${uid}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.log("Error cargando la foto local", error);
    }
  };

  // 🌐 FUNCIÓN UNIFICADA PARA LANZAR NOTIFICACIONES LOCALES SIN ERRORES DE TRIGGER (EXPO GO COMPATIBLE)
  const triggerSettingsNotification = async (type, value) => {
    try {
      // Ignorar ejecución en Web ya que expo-notifications es para entornos nativos
      if (Platform.OS === 'web') return;

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: askStatus } = await Notifications.requestPermissionsAsync();
        if (askStatus !== 'granted') return;
      }

      let title = '';
      let body = '';

      if (type === 'lang') {
        title = value === 'en' ? '🌐 Language Changed' : '🌐 Idioma Cambiado';
        body = value === 'en' 
          ? 'Your application preferences have been updated to English.' 
          : 'Las preferencias de tu aplicación se han actualizado a Español.';
      } else if (type === 'theme') {
        title = lang === 'en' ? '🎨 Theme Updated' : '🎨 Tema Actualizado';
        body = value 
          ? (lang === 'en' ? 'Dark Mode has been activated.' : 'El Modo Oscuro ha sido activado.')
          : (lang === 'en' ? 'Light Mode has been activated.' : 'El Modo Claro ha sido activado.');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: true, 
        },
        trigger: null, // 🚀 Evita el TypeError de parámetros inválidos de tiempo
      });
    } catch (error) {
      console.log("Error al lanzar notificación local:", error);
    }
  };

  const pickImage = async () => {
    try {
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        if (!canAskAgain) {
          showCustomToast(lang === 'en' 
            ? '⚠️ Please enable gallery permissions in your device settings.' 
            : '⚠️ Por favor, activa el permiso de galería en los ajustes del dispositivo.'
          );
        } else {
          showCustomToast(t.galleryPermissionError || 'Permission denied');
        }
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true, 
        aspect: [1, 1],
        quality: 0.5, 
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const selectedUri = result.assets[0].uri;
        setProfileImage(selectedUri);
        
        if (auth.currentUser) {
          await AsyncStorage.setItem(`profile_img_${auth.currentUser.uid}`, selectedUri);
        }
        showCustomToast(t.photoUpdatedSuccess || '📸 Done!');
      }
    } catch (e) {
      showCustomToast(t.photoLoadError || '❌ Error');
    }
  };

  const loadVisits = async (uid) => {
    try {
      setLoadingStats(true);
      const q = query(collection(db, 'visits'), where('uid', '==', uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setVisits(sortedData);
      
      if (sortedData.length > 0) {
        const last = sortedData[sortedData.length - 1];
        setCurrentRegion({
          latitude: last.lat,
          longitude: last.lng,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
        setExpandedIndex(0);
      }
    } catch (error) {
      showCustomToast('❌ Error: ' + error.message);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'MyVisitedPlacesApp/1.0' } });
      const json = await response.json();
      return json?.display_name || null;
    } catch (e) { return null; }
  };

  const captureLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showCustomToast('⚠️ Permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const textAddress = await fetchAddressFromCoords(loc.coords.latitude, loc.coords.longitude);

      const newVisit = {
        uid: auth.currentUser.uid,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        timestamp: new Date().toISOString(),
        address: textAddress || t.unknownAddress
      };

      await addDoc(collection(db, 'visits'), newVisit);
      const updatedVisits = [...visits, newVisit];
      setVisits(updatedVisits);
      
      setCurrentRegion({
        latitude: newVisit.lat,
        longitude: newVisit.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });

      setExpandedIndex(0);
      showCustomToast(`📌 ${t.successTitle}`);
    } catch (error) {
      showCustomToast('❌ Error: ' + error.message);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCapturePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.04, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();
    captureLocation();
  };

  const handleTripPress = (visit, index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    setCurrentRegion({
      latitude: visit.lat,
      longitude: visit.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  const handleLogout = async () => {
    try { 
      setProfileImage(null); 
      await signOut(auth); 
    } catch (error) { showCustomToast('❌ Error'); }
  };

  const uniquePlaces = new Set(visits.map(v => `${v.lat.toFixed(3)},${v.lng.toFixed(3)}`)).size;
  const lastLocation = visits.length > 0 ? visits[visits.length - 1] : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      
      {/* TOAST ANIMADO */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastY }], opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* MENÚ DESPLEGABLE */}
      {menuVisible && (
        <Pressable style={styles.menuOverlay} onPress={toggleMenu}>
          <Animated.View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.cardBorder, opacity: menuAnim, transform: [{ scale: menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) }] }]}>
            
            <View style={styles.userInfoBox}>
              <View style={styles.menuAvatarContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.menuLargeAvatar} />
                ) : (
                  <View style={[styles.menuLargeAvatarFallback, { backgroundColor: theme.border }]}>
                    <Text style={{ fontSize: 24 }}>👤</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.userLabel, { color: theme.subtitle }]}>{t.email}</Text>
              <Text style={[styles.userEmail, { color: theme.text }]} numberOfLines={1}>{userEmail}</Text>
            </View>
            
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            
            {/* 📸 BOTÓN DE FOTO DE PERFIL */}
            <TouchableOpacity style={styles.menuOption} onPress={pickImage}>
              <Text style={[styles.menuOptionText, { color: theme.text }]}>
                {t.changeProfilePicture || '📸 Profile Picture'}
              </Text>
            </TouchableOpacity>

            {/* ☀️/🌙 BOTÓN DE MODO OSCURO */}
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => {
                const nextDarkMode = !isDarkMode;
                setIsDarkMode(nextDarkMode);
                triggerSettingsNotification('theme', nextDarkMode);
              }}
            >
              <Text style={[styles.menuOptionText, { color: theme.text }]}>
                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </Text>
            </TouchableOpacity>
            
            {/* 🌐 BOTÓN DE CAMBIO DE IDIOMA */}
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => {
                const nextLang = lang === 'en' ? 'es' : 'en';
                setLang(nextLang);
                triggerSettingsNotification('lang', nextLang);
              }}
            >
              <Text style={[styles.menuOptionText, { color: theme.text }]}>🌐 {lang === 'en' ? 'Español' : 'English'}</Text>
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            
            <TouchableOpacity style={styles.menuOptionLogout} onPress={handleLogout}>
              <Text style={styles.logoutText}>{t.logout}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      )}

      {/* CONTENEDOR RESPONSIVO DINÁMICO */}
      <View style={[
        styles.mainLayout, 
        { flexDirection: (isLandscape || isTablet) ? 'row' : 'column' }
      ]}>
        
        {/* COLUMNA IZQUIERDA / SUPERIOR */}
        <View style={[
          styles.leftColumn, 
          { width: (isLandscape || isTablet) ? '45%' : '100%', marginRight: (isLandscape || isTablet) ? 20 : 0 }
        ]}>
          <View style={[styles.mapContainer, { borderColor: theme.border, height: isLandscape ? height * 0.55 : 230 }]}>
            {Platform.OS === 'web' ? (
              <View style={[styles.webMapFallback, { backgroundColor: theme.card }]}>
                <Text style={[styles.webMapText, { color: theme.subtitle }]}>{t.webMap}</Text>
              </View>
            ) : (
              <MobileMap mapRegion={currentRegion} visits={visits} />
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.captureButton, { backgroundColor: theme.primary }, loadingLocation && styles.buttonDisabled]}
              onPress={handleCapturePress}
              disabled={loadingLocation}
            >
              {loadingLocation ? <ActivityIndicator color="white" /> : <Text style={styles.captureButtonText}>{t.registerLoc}</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* COLUMNA DERECHA / INFERIOR */}
        <ScrollView 
          style={styles.rightColumn} 
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Estadísticas */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.stats}</Text>
            {loadingStats ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <View style={[styles.statsWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.subtitle }]}>{t.totalVisits}</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{visits.length}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={[styles.statLabel, { color: theme.subtitle }]}>{t.uniqueLocs}</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{uniquePlaces}</Text>
                </View>
                <View style={styles.statRowLast}>
                  <Text style={[styles.statLabel, { color: theme.subtitle }]}>{t.lastLoc}</Text>
                  <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
                    {lastLocation ? `${lastLocation.lat.toFixed(4)}, ${lastLocation.lng.toFixed(4)}` : t.notCaptured}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Historial */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.history}</Text>
            {visits.length === 0 && !loadingStats ? (
              <Text style={[styles.noVisitsText, { color: theme.subtitle }]}>{t.noVisits}</Text>
            ) : (
              [...visits].reverse().map((visit, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.historyCard, 
                      { backgroundColor: theme.card, borderColor: isExpanded ? theme.primary : theme.cardBorder }
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.historyHeader}
                      onPress={() => handleTripPress(visit, index)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.headerLeft}>
                        <Text style={[styles.historyBadge, { color: theme.primary }]}>
                          {t.visitBadge} #{visits.length - index}
                        </Text>
                        {isExpanded && (
                          <Text style={styles.focusedText}>
                            {t.focusedText || ' • Focused'}
                          </Text>
                        )}
                      </View>
                      <View style={styles.headerRightSide}>
                        <Text style={styles.historyDate}>
                          {new Date(visit.timestamp).toLocaleDateString()}
                        </Text>
                        <Text style={[styles.arrowIcon, { color: theme.subtitle }]}>
                          {isExpanded ? ' ▲' : ' ▼'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <Text style={[styles.historyCoords, { color: theme.text }]}>
                          Lat: {visit.lat.toFixed(6)} | Lng: {visit.lng.toFixed(6)}
                        </Text>
                        {visit.address && (
                          <Text style={[styles.addressText, { color: theme.subtitle }]}>
                            📍 {visit.address}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainLayout: { flex: 1, padding: 16 },
  leftColumn: { justifyContent: 'flex-start' },
  rightColumn: { flex: 1 },

  headerButton: { marginRight: 5, padding: 4, borderRadius: 25, overflow: 'hidden' },
  headerIcon: { fontSize: 20, color: 'white', padding: 2 },
  headerAvatar: { width: 28, height: 28, borderRadius: 14 }, 
  
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  dropdownMenu: {
    position: 'absolute', top: 10, right: 15, width: 230, borderRadius: 12, padding: 8, borderWidth: 1, zIndex: 1001,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 12 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }
    })
  },
  userInfoBox: { padding: 8, alignItems: 'center' },
  menuAvatarContainer: { marginBottom: 8 },
  menuLargeAvatar: { width: 60, height: 60, borderRadius: 30 },
  menuLargeAvatarFallback: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  userLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  userEmail: { fontSize: 13, fontWeight: '600', width: '100%', textAlign: 'center' },
  menuDivider: { height: 1, marginVertical: 6, opacity: 0.6 },
  menuOption: { paddingVertical: 10, paddingHorizontal: 8 },
  menuOptionText: { fontSize: 13, fontWeight: '500' },
  menuOptionLogout: { paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  logoutText: { color: '#ff3b30', fontSize: 13, fontWeight: '700' },
  toastContainer: { position: 'absolute', top: 20, left: 20, right: 20, backgroundColor: '#2e2e32', padding: 14, borderRadius: 10, zIndex: 9999, elevation: 10, alignItems: 'center' },
  toastText: { color: 'white', fontWeight: '600', fontSize: 13 },
  
  mapContainer: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 15, borderWidth: 1 },
  webMapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  webMapText: { textAlign: 'center', fontSize: 14, fontWeight: '500' },
  captureButton: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonDisabled: { backgroundColor: '#aaa' },
  captureButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  statsWrapper: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  statRow: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  statRowLast: { padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 13, fontWeight: '600' },
  noVisitsText: { textAlign: 'center', fontStyle: 'italic', marginVertical: 10 },

  historyCard: { padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  focusedText: { fontSize: 11, color: '#4cd964', fontWeight: '600' },
  headerRightSide: { flexDirection: 'row', alignItems: 'center' },
  historyBadge: { fontSize: 12, fontWeight: 'bold' },
  historyDate: { fontSize: 11, color: '#888' },
  arrowIcon: { fontSize: 10, fontWeight: 'bold' },
  expandedContent: { marginTop: 4 },
  divider: { height: 1, marginVertical: 8, opacity: 0.2 },
  historyCoords: { fontSize: 12, fontFamily: 'monospace', marginBottom: 4 },
  addressText: { fontSize: 12, lineHeight: 16 },
});
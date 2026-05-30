import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

export default function MobileMap({ mapRegion, visits }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && mapRegion) {
      mapRef.current.animateToRegion(mapRegion, 1000);
    }
  }, [mapRegion]);

  return (
    <MapView 
      ref={mapRef}
      style={{ width: '100%', height: '100%' }} 
      initialRegion={mapRegion}
      showsUserLocation={true}
      showsMyLocationButton={true}
      loadingEnabled={true}
    >
      {visits.map((visit, index) => {
        const isLast = index === visits.length - 1;
        const visitDate = new Date(visit.timestamp);

        return (
          <Marker
            key={index}
            coordinate={{ latitude: visit.lat, longitude: visit.lng }}
            pinColor={isLast ? '#007AFF' : '#ff3b30'}
          >
            {/* BURBUJA DE INFORMACIÓN TOTALMENTE PERSONALIZADA */}
            <Callout tooltip={true} style={styles.calloutContainer}>
              <View style={styles.bubble}>
                <Text style={styles.title}>
                  {isLast ? '📍 Last visit' : `📌 Visit #${index + 1}`}
                </Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.dateTime}>
                  📅 {visitDate.toLocaleDateString()}
                </Text>
                <Text style={styles.dateTime}>
                  ⏰ {visitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

                <Text style={styles.coords}>
                  {visit.lat.toFixed(4)}, {visit.lng.toFixed(4)}
                </Text>
              </View>
              {/* Pequeña flecha inferior que conecta la burbuja con la chincheta */}
              <View style={styles.arrowBorder} />
              <View style={styles.arrow} />
            </Callout>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    width: 160,
    alignItems: 'center',
  },
  bubble: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    width: '100%',
    // Sombras premium para iOS y Android
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#efeff4',
    marginBottom: 6,
    width: '100%',
  },
  dateTime: {
    fontSize: 11,
    color: '#3a3a3c',
    marginBottom: 2,
    fontWeight: '500',
  },
  coords: {
    fontSize: 10,
    color: '#8e8e93',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
    textAlign: 'right',
  },
  // Diseño de la flecha triangular inferior
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 8,
    alignSelf: 'center',
    marginTop: -0.5,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: 'transparent',
    borderWidth: 8,
    alignSelf: 'center',
    marginTop: -0.5,
  },
});
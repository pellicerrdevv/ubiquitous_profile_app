import React, { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function MobileMap({ mapRegion, visits }) {
  const mapRef = useRef(null);

  // Cada vez que cambie la región (porque registras un sitio nuevo), el mapa viajará suavemente
  useEffect(() => {
    if (mapRef.current && mapRegion) {
      mapRef.current.animateToRegion(mapRegion, 1000); // 1000 milisegundos = 1 segundo de animación
    }
  }, [mapRegion]);

  return (
    <MapView 
      ref={mapRef}
      style={{ width: '100%', height: '100%' }} 
      initialRegion={mapRegion}
      showsUserLocation={true}       // Pinta el círculo azul del usuario en tiempo real
      showsMyLocationButton={true}   // Añade el botón nativo para centrar la cámara sobre ti
      loadingEnabled={true}          // Muestra un indicador de carga si el mapa tarda en bajar de internet
    >
      {visits.map((visit, index) => (
        <Marker
          key={index}
          coordinate={{ latitude: visit.lat, longitude: visit.lng }}
          title={`📌 Visita #${index + 1}`}
          description={new Date(visit.timestamp).toLocaleString()} // Muestra fecha y hora completa al pulsar
          pinColor={index === visits.length - 1 ? '#007AFF' : '#ff3b30'} // La última visita será azul, las viejas rojas
        />
      ))}
    </MapView>
  );
}
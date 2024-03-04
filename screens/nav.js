import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LocationContext } from '../LocationContext';
import { Magnetometer } from 'expo-sensors';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import customMapStyle from '../mapStyles.json';
const MapComponent = () => {
  const [heading, setHeading] = useState(0);
  const locationContext = useContext(LocationContext);
  const { location } = locationContext;

  useEffect(() => {
    Magnetometer.setUpdateInterval(1000);
    const subscription = Magnetometer.addListener(data => {
      const angle = Math.atan2(data.y, data.x);
      const heading = angle > 0 ? Math.round(angle * (180 / Math.PI)) : Math.round((angle + 2 * Math.PI) * (180 / Math.PI));
      setHeading(heading);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 50.0647,
          longitude: 19.9450,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={customMapStyle}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
      >
      
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapComponent;

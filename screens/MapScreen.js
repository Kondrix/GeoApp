import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Button, StyleSheet, Image, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { LikedPlacesContext } from '../LikedPlacesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { LocationContext } from '../LocationContext'; 

const GOOGLE_API_KEY = ''; 

const MapScreen = ({ navigation }) => {
  const [likedPlaces, setLikedPlaces] = useContext(LikedPlacesContext);
  const { location, errorMsg } = useContext(LocationContext);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hasCenteredMap, setHasCenteredMap] = useState(false);
  const [isUpdatingLocationH, setIsUpdatingLocationH] = useState(false);


  const fetchAndCenterOnUser = async () => {
    try {
      setIsUpdatingLocation(true);
      setHasCenteredMap(false);

      if (location) {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          coords: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        });
  
        if (mapRef.current && !hasCenteredMap) {
          await mapRef.current.animateToRegion(
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            1000
          );
          setHasCenteredMap(true);
        } else {
        }
      } else {
        console.warn('Location not available');
      }
  
      setIsUpdatingLocation(false);
    } catch (error) {
      console.error('Error fetching and centering on user:', error);
      setIsUpdatingLocation(false);
    }
  };
  
  const requestLocationPermission = async () => {
    try {
      if (location && !hasCenteredMap) {
        setIsUpdatingLocation(true);

        const newUserLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          coords: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };

        setUserLocation(newUserLocation);
        setIsMapReady(true);

        if (mapRef.current) {
          await mapRef.current.animateToRegion(
            {
              latitude: newUserLocation.latitude,
              longitude: newUserLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.421,
            },
            1000
          );
          setHasCenteredMap(true);
        } else {
         // console.warn('mapRef is null');
        }

        setIsUpdatingLocation(false);
      } else {
      //  console.warn('Location not available or map already centered');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setIsUpdatingLocation(false);
    }
  };

  useEffect(() => {
    if (location) {
      updateDistances();
      requestLocationPermission();
    }
  }, [location, hasCenteredMap]);
  const updateDistances = async () => {
    if (userLocation && likedPlaces.length > 0) {
      const destinations = likedPlaces.map((place) => ({
        latitude: place.latitude,
        longitude: place.longitude,
      }));

      try {
        const distances = await getBatchedDistanceMatrix(userLocation, destinations);

        
        const updatedPlaces = likedPlaces.map((place, index) => ({
          ...place,
          distance: distances[index],
        }));
        setLikedPlaces(updatedPlaces);
      } catch (error) {
      //  console.error('Error fetching distances:', error);
      }
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('likedPlaces')
      .then((storedLikedPlaces) => {
        if (storedLikedPlaces) {
          setLikedPlaces(JSON.parse(storedLikedPlaces));
        } else {
          setLikedPlaces([]);
        }
      });

    
    updateDistances();
  }, []);

 
 async function getBatchedDistanceMatrix  (origin, destinations) {
  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = destinations.map((destination) => `${destination.latitude},${destination.longitude}`).join('|');

  return fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&key=${GOOGLE_API_KEY}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.rows && data.rows.length > 0) {
        return data.rows[0].elements.map((element) => {
          if (element.status === 'OK') {
            return element.distance.text;
          } else {
            throw new Error('Problem z pobraniem danych o odległości');
          }
        });
      } else {
        throw new Error('Invalid response from the distance matrix API');
      }
    })
    .catch((error) => {
   
      throw error; 
    });
};
  useEffect(() => {
    if (userLocation && likedPlaces.length > 0) {
      const destinations = likedPlaces.map((place) => ({
        latitude: place.latitude,
        longitude: place.longitude,
      }));

      
      const distancesAlreadyFetched = likedPlaces.every((place) => place.distance !== undefined);

      if (!distancesAlreadyFetched) {
        getBatchedDistanceMatrix(userLocation, destinations)
          .then((distances) => {
            const updatedPlaces = likedPlaces.map((place, index) => ({
              ...place,
              distance: distances[index],
            }));
            setLikedPlaces(updatedPlaces);
          })
          .catch((error) => {
       
          });
      }
    }

  }, [userLocation, likedPlaces]);

  
  

  const fetchAndCenterOnNearestPlace = async () => {
    try {
      if (!userLocation || likedPlaces.length === 0) {
        console.warn('User location or liked places not available');
        return;
      }

      const nearestPlace = likedPlaces.reduce((nearest, place) => {
        if (!nearest || place.distance < nearest.distance) {
          return place;
        }
        return nearest;
      }, null);

      if (nearestPlace) {
        await mapRef.current.animateToRegion(
          {
            latitude: nearestPlace.latitude,
            longitude: nearestPlace.longitude,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
          },
          1000
        );
      } else {
        console.warn('No nearest place found');
      }
    } catch (error) {
      console.error('Error fetching and centering on nearest place:', error);
    }
  };





  const handlePress = (place) => {
   
    navigation.navigate('PlaceDescriptionScreen', { placeId: place.id })

    

    

  };

  return (
    <View style={styles.container}>
      <TouchableOpacity           onPress={fetchAndCenterOnNearestPlace}
      style={styles.myLocationButtonH}
      disabled={isUpdatingLocationH} 

        >
         {isUpdatingLocationH ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Ionicons name="heart" size={24} color="red" />
        )}

      </TouchableOpacity>
           <TouchableOpacity
        style={styles.myLocationButton}
        onPress={fetchAndCenterOnUser}
        disabled={isUpdatingLocation} 
      >
        {isUpdatingLocation ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Ionicons name="md-locate" size={24} color="black" />
        )}
      </TouchableOpacity>
  {!isMapReady ? (
    <View style={styles.loadingContainer}>
      <Text>Wczytywanie mapy</Text>
      <ActivityIndicator size="large" />
    </View>
  ) : (
    
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      }}
      onMapLoaded={() => setIsMapReady(true)}
    >
      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="Twoja lokalizacja"
          pinColor="blue"
        />
      )}
      {likedPlaces.map((place) => (
        <Marker
          key={place.id}
          coordinate={{
            latitude: place.latitude,
            longitude: place.longitude,
          }}
        >
      
          <Ionicons name="heart" size={50} color={'red'} />
          <Callout tooltip onPress={() => handlePress(place)}>
            <View style={styles.calloutView}>
              <View style={styles.imbq}> 
                <Image source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoReference}&key=${GOOGLE_API_KEY}` }} style={styles.image} />
              </View>
              <Text style={styles.bsquareText}>{place.name.split(' ').slice(0, 2).join(' ')}</Text>
              <View style={styles.bsquareText3}> 
                <Ionicons name="location" size={16} color={'#65bdd8'} />
              </View>
              <Text style={styles.bsquareText2}>{place.city}, {place.country}</Text>
              <View style={styles.bsquareText4}> 
                <Text style={styles.timetext}>{place.distance}</Text>
                <FontAwesome name="road" size={12} color={'white'} />
              </View>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  )}
</View>

  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myLocationButton: {
    position: 'absolute', 
    bottom: 100, 
    right: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    padding: 10, 
    borderRadius: 30, 
    zIndex:1,
  },
  myLocationButtonH:{
    position: 'absolute', 
    bottom: 100, 
    left: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    padding: 10, 
    borderRadius: 30, 
    zIndex:1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutView: {
    width: 160,
    height: 100,
    padding: 3,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems:'center',
    
  },
  calloutImage: {
    width: '80%',
    height: 50,
    alignSelf:'center',
  },
  calloutText: {
    fontSize: 10,
  },
  bsquareText: {
    color: 'black',
    fontSize: 10,
    position: 'absolute',
    bottom: 15,
    padding: 5,
    zIndex:1,
    left:0,
    fontWeight: 'bold',

  },
  bsquareText2: {
    color: 'black',
    fontSize: 9,
    position: 'absolute',
    bottom: 0,
    padding: 5,
    zIndex:1,
    left:15,

  },
  bsquareText3: {
    color: 'black',
    fontSize: 13,
    position: 'absolute',
    bottom: 0,
    padding: 5,
    zIndex:1,
    left:0,

  },
  bsquareText4: {
    color: 'white',
    backgroundColor: '#65bdd8',
    fontSize: 7,
    position: 'absolute',
    bottom: 0,
    zIndex:1,
    right:2,
    height:30,
    width:60,
    borderRadius:25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth:2,
    borderColor:'white',
    shadowOffset: { 
      width:2,
      height: 2,
    },
    shadowOpacity: 0.30, 

  },
  bsquareText5: {

    
  },
  timetext:{
    color:'white',
    fontSize: 9,
    fontWeight: 'bold',
    alignSelf:'center',
    

  },
  timeicon:{
    fontWeight: 'bold',
    zIndex:1,
    position:'absolute',
    left:2,
  },

  image: {
    width: '100%',
    height: '100%',
    top: 0,
    borderRadius:20,

  },
  imbq:{
    top:2,
    width: '100%',
    height: '70%',
    borderRadius:20,
    position:'absolute',
   
  },
});

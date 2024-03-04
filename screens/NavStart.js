import React, { useRef , useEffect,useState,useContext} from 'react';
import { View, Dimensions, StyleSheet, Text, TouchableOpacity, Image,Modal } from 'react-native';
import Animated, {useDerivedValue , runOnJS, useAnimatedGestureHandler, useSharedValue, useAnimatedStyle, withSpring,withTiming,interpolateColor} from 'react-native-reanimated';
import { PanGestureHandler, ScrollView as PanScrollView } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import customMapStyle from '../mapStyles.json';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBatchedDistanceMatrix } from 'react-native-maps';
import Axios from 'axios';
import { LocationContext } from '../LocationContext'; 
import haversine from 'haversine';
import MapViewDirections from 'react-native-maps-directions';
import { Alert } from 'react-native';

const BottomSheet = () => {
  const mapRef = useRef(null); 
  const [prevUserLocation, setPrevUserLocation] = useState(null);
  const [prevSelectedPlaces, setPrevSelectedPlaces] = useState([]);
  const height = useSharedValue(200);
  const screenHeight = Dimensions.get('window').height;
  const bottomSheetMinHeight = 200;
  const bottomSheetMaxHeight = Platform.select({
    ios: screenHeight * 0.85, 
    android: screenHeight * 0.92, 
    default: screenHeight * 0.14, 
  });
  const scrollRef = useRef();
  const [places, setPlaces] = useState([]);
  const [origin, setOrigin] = useState({ latitude: 0, longitude: 0 });
  const [destination, setDestination] = useState({ latitude: 0, longitude: 0 });

  const [isAllActive, setIsAllActive] = useState(true);
  const [isFavoriteActive, setIsFavoriteActive] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [likedPlaces, setLikedPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [distances, setDistances] = useState([]);
const [distanceText, setDistanceText] = useState(''); 
const [isLoading, setIsLoading] = useState(false);

const { location, errorMsg } = useContext(LocationContext);
const [userDistance, setUserDistance] = useState(null);
const [routeCoordinates, setRouteCoordinates] = useState([]);
const [showCancelButton, setShowCancelButton] = useState(false);
const [showPrbar, setshowPrbar] = useState(true);
const [isModalVisible, setIsModalVisible] = useState(false);
const [currentPlaceName, setCurrentPlaceName] = useState('');

const closeModal = () => {
  setIsModalVisible(false);
  
};
const handleStartPress = () => {

  height.value = withTiming(0, { duration: 500 });
  setShowCancelButton(true);
  setshowPrbar(false);
  centerOnUser();
};

const handleCancelPress = () => {
 
  height.value = withSpring(200);
  setShowCancelButton(false); 
  setshowPrbar(true);
  mapRef.current.animateToRegion({
    latitude: 50.0647, 
    longitude: 19.9450, 
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
};
  const handleAllPress = () => {
    setIsAllActive(true);
    setIsFavoriteActive(false);

   
  };

  const handleFavoritePress = () => {
    setIsAllActive(false);
    setIsFavoriteActive(true);


    
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startHeight = height.value;
    },
    onActive: (event, context) => {
      let newHeight = context.startHeight - event.translationY;
      if (newHeight > bottomSheetMaxHeight) {
        newHeight = bottomSheetMaxHeight;
      } else if (newHeight < bottomSheetMinHeight) {
        newHeight = bottomSheetMinHeight;
      }
      height.value = newHeight;
    },
    onEnd: (event) => {
      if (event.velocityY > 2) {
        height.value = withSpring(bottomSheetMinHeight);

      } else {
        height.value = withSpring(bottomSheetMaxHeight);

      }

    },
  });
  const animatedStyle = useAnimatedStyle(() => {
    
    return {
      height: height.value,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      
    };
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const isHeaderVisible = height.value > bottomSheetMinHeight * 1.9;
    return {
      borderBottomRightRadius: withTiming(height.value > bottomSheetMinHeight * 2.8 ? 0 : 40, { duration: 1000 }),
      borderBottomLeftRadius: withTiming(height.value > bottomSheetMinHeight * 2.8 ? 0 : 40, { duration: 1000 }),
      paddingBottom: withTiming(height.value > bottomSheetMinHeight * 2.8 ? 20 : 30, { duration: 1000 }),

      height: withTiming(isHeaderVisible ? screenHeight * 0.15 : screenHeight * 0.2,{duration:700} ),
      transform: [
        { 
          translateY: withTiming(isHeaderVisible ? 0 : -30,{duration:800}),
        },
        
      ],
    };
  });
  const categoryTextStyle = (isActive) => ({
    alignSelf: 'center',
    fontSize:17,
    fontWeight: 'bold',
    shadowColor:'black',
    color: isActive ? 'white' : 'black', 
  });
 
  const animatedBorderRadius = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      height.value,
      [bottomSheetMinHeight * 2.2, bottomSheetMinHeight * 2.8],
      ['rgba(215, 236, 241, 0.1)','rgba(215, 236, 241, 0.95)' ]
    );
  
    return {
      borderTopRightRadius: withTiming(height.value > bottomSheetMinHeight * 2.8 ? 0 : 40, { duration: 1000 }),
      borderTopLeftRadius: withTiming(height.value > bottomSheetMinHeight * 2.8 ? 0 : 40, { duration: 1000 }),
      backgroundColor,
    };
  });
  const stepText = (index) => {
    switch (index) {
      case 0:
        return "Cel";
      case 1:
        return "Trasa";
      case 2:
        return "crok 3";
      default:
        return "";
        
    }
    
  };
  
  const stepTextStyle = (index) => ({
   
    color: activeStep === index + 1 ? 'white' : 'transparent',
    fontSize: 22,
    alignSelf:'center',
    fontWeight: 'bold',

  });
  const animatedStepStyle = (index) => ({
    width: activeStep === index + 1 ? 110 : 40,
  
    height: 40,
    borderRadius: 20,
    backgroundColor: activeStep > index   ? '#65bdd8' : '#bababa',
    justifyContent:'center',
    borderColor:'white',

    
  });
  const lineStyle = (index) => ({
    flex: 1,
    height: 5,
    backgroundColor: index === 0 ? 'transparent' : index < activeStep ? '#65bdd8' : '#bababa',
    
    width: index === 0 ? '20%' : index < activeStep ? '30%' : '50%',
    borderColor:'white',
   
  });
  const animatedholdbarStyle = useAnimatedStyle(() => {
    
    const backgroundColor = interpolateColor(
      height.value,
      [bottomSheetMinHeight * 2.2, bottomSheetMinHeight],
      ['white', '#bababa']
    );
  
    return {
      backgroundColor,
      width: withTiming(height.value > bottomSheetMinHeight * 2.8 ? '95%' : '20%', { duration: 120 }),

    };
  });
  
  useEffect(() => {
    
    fetch('http://10.0.2.2:5000/api/places')
      .then(response => response.json())
      .then(data => setPlaces(data));
      setActiveStep(1); 

  
    AsyncStorage.getItem('likedPlaces').then(storedLikedPlaces => {
      if (storedLikedPlaces) {
        setLikedPlaces(JSON.parse(storedLikedPlaces));
      } else {
        setLikedPlaces([]);
      }
    });
  }, []);
  const handlePlacePress = async (placeId) => {

    const isSelected = selectedPlaces.includes(placeId);
    const place = places.find((p) => p.id === placeId);
    const userLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  
    const placeLocation = {
      latitude: place.latitude,
      longitude: place.longitude,
    };
  
    const distanceToPlace = haversine(userLocation, placeLocation, { unit: 'kilometer' });
    if (distanceToPlace <= 0.5) {
      
      setIsModalVisible(true);

      setCurrentPlaceName(place.name);

  
      return;
  }
  
    if (isSelected) {
     
      const updatedSelectedPlaces = selectedPlaces.filter((id) => id !== placeId);
      setActiveStep(updatedSelectedPlaces.length > 0 ? 2 : 1);
      setSelectedPlaces(updatedSelectedPlaces);
      return;
      
    } else {
      
      const updatedSelectedPlaces = [...selectedPlaces, placeId];
      setActiveStep(updatedSelectedPlaces.length > 0 ? 2 : 1);
  
     
      if (updatedSelectedPlaces.length > 1) {
        const lastSelectedPlaceId = updatedSelectedPlaces[updatedSelectedPlaces.length - 2];
        
        const lastSelectedPlace = places.find((p) => p.id === lastSelectedPlaceId);
        const origins = [{
          latitude: lastSelectedPlace.latitude,
          longitude: lastSelectedPlace.longitude,
        }];
  
        const destination = {
          latitude: place.latitude,
          longitude: place.longitude,
        };
  
        try {
        
          setIsLoading(true);
          const response =  await Axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
              units: 'metric',
              origins: `${origins[0].latitude},${origins[0].longitude}`,
              destinations: `${destination.latitude},${destination.longitude}`,
              mode: 'walking', 
              key: '', 
            },
          });
  
          const distanceText = response.data.rows[0].elements[0].distance.text;
          setIsLoading(false);
          if (distanceText) {
           
            place.distance = distanceText;
            console.log(`Dystans do ${place.name}: ${distanceText}`);
          } else {
            console.error('Błąd obliczania dystansu: Nieprawidłowy format odpowiedzi');
          }
        } catch (error) {
          console.error('Błąd obliczania dystansu:', error);
        }
      }
      if (updatedSelectedPlaces.length > 1) {
        const lastSelectedPlaceId = updatedSelectedPlaces[updatedSelectedPlaces.length - 2];
        const lastSelectedPlace = places.find((p) => p.id === lastSelectedPlaceId);
  
        setOrigin({
          latitude: lastSelectedPlace.latitude,
          longitude: lastSelectedPlace.longitude,
        });
  
        setDestination({
          latitude: place.latitude,
          longitude: place.longitude,
        });
        console.log('Origin:', origin);
         console.log('Destination:', destination);
      }
      setSelectedPlaces(updatedSelectedPlaces);
      
    }
    
  };
  
  useEffect(() => {
   
    if (
      location &&
      location.coords &&
      location.coords.latitude &&
      location.coords.longitude &&
      selectedPlaces.length > 0
    ) {
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
  
      const firstSelectedPlace = places.find((p) => p.id === selectedPlaces[0]);
  
      if (firstSelectedPlace && firstSelectedPlace.latitude && firstSelectedPlace.longitude) {
        const distance = haversine(userLocation, {
          latitude: firstSelectedPlace.latitude,
          longitude: firstSelectedPlace.longitude,
        }, { unit: 'kilometre' });
  
        setUserDistance(distance);
        const lastSelectedPlace = places.find((p) => p.id === selectedPlaces[selectedPlaces.length - 1]);
        const distanceToLastPlace = haversine(userLocation, {
          latitude: lastSelectedPlace.latitude,
          longitude: lastSelectedPlace.longitude,
        }, { unit: 'kilometre' });
        
        
        if (distanceToLastPlace <= 0.1) {
        }
      } else {
        console.log('Invalid coordinates for the first selected place');
      }
    } else {
  
    }
  
    
  }, [location, selectedPlaces, places]);


  useEffect(() => {
    const calculateRoute = async () => {
      if (selectedPlaces.length >= 1) {
        const coordinates = selectedPlaces.map((placeId) => {
          const place = places.find((p) => p.id === placeId);
          return place ? { latitude: place.latitude, longitude: place.longitude } : null;
        });

        
        const filteredCoordinates = coordinates.filter((coord) => coord !== null);

        setRouteCoordinates(filteredCoordinates);
        console.log(filteredCoordinates);
      } else {
        setRouteCoordinates([]);

      }
    };
      
    calculateRoute();
  }, [selectedPlaces, places]);

  
  const renderSimpleMarkers = () => {
    return selectedPlaces.map((selectedPlaceId, index) => {
      const place = places.find((p) => p.id === selectedPlaceId);

      
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      const placeLocation = {
        latitude: place.latitude,
        longitude: place.longitude,
      };
      const distance = haversine(userLocation, placeLocation, { unit: 'meter' });

      if (distance >= 50) {
        return (
          <Marker
            key={`selectedMarker_${selectedPlaceId}`}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={place.city}
            pinColor="#65bdd8" 
          />
        );
      } else {
        const updatedSelectedPlaces = [...selectedPlaces];
      const removedPlace = updatedSelectedPlaces.splice(index, 1)[0];
      setSelectedPlaces(updatedSelectedPlaces);
      Alert.alert('Brawo', `Dotarłeś do: ${places.find(p => p.id === removedPlace)?.name || 'Nieznane miejsce'}`);
      return null;
       
        
      }
    });
    
  };
  
  const areEqual = (prevProps, nextProps) => {
    return JSON.stringify(prevProps.routeCoordinates) === JSON.stringify(nextProps.routeCoordinates);
  }
  const TrackR = ({ routeCoordinates, location }) => {
    const [distanceToNextPoint, setDistanceToNextPoint] = useState(null);
    const [prevRouteCoordinates, setPrevRouteCoordinates] = useState(null);
    const { location: userLocation } = useContext(LocationContext);
  
    useEffect(() => {
      if (JSON.stringify(prevRouteCoordinates) !== JSON.stringify(routeCoordinates)) {
        setPrevRouteCoordinates(routeCoordinates);
      }
    }, [routeCoordinates]);
  
    useEffect(() => {
      if (userLocation && routeCoordinates.length > 0) {
        let nextPoint = routeCoordinates[0];
        const userCoordinates = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        };
  
        let distance = haversine(userCoordinates, nextPoint, { unit: 'kilometer' });
  
        if (distance <= 0.05 && nextPoint === routeCoordinates[0]) {
         
        }
  
        if (distance <= 0.05) {
          routeCoordinates.shift();
          if (routeCoordinates.length > 0) {
            nextPoint = routeCoordinates[0];
            distance = haversine(userCoordinates, nextPoint, { unit: 'kilometer' });
          }
        }
        setDistanceToNextPoint(distance.toFixed(2));
  
        if (routeCoordinates.length === 0) {
          Alert.alert('Brawo', 'Przeszedłeś przez wysztkie punkty');
          setShowCancelButton(false); 
          setshowPrbar(true);
          height.value = withTiming(200, { duration: 500 });
          setActiveStep(1);
        }
      }
    }, [userLocation, routeCoordinates]);
    
    return (
      <View>
        <Text style={styles.trackRText}>{distanceToNextPoint}</Text>
        
      </View>
    );
    
    
  };
  
  const GOOGLE_MAPS_APIKEY = '';


  const centerOnUser = () => {
    if (location && location.coords) {
      const { latitude, longitude } = location.coords;
      const region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000); 
    }
  };

  let destinationPlaceName;
if (selectedPlaces.length > 0) {
  const firstPlace = places.find(p => p.id === selectedPlaces[0]);
  destinationPlaceName = firstPlace.name;
}

 
  const filteredPlaces = isAllActive ? places.filter(place => !selectedPlaces.includes(place.id)) : likedPlaces;

  const uniquePlaces = Array.from(new Set(places.map(place => place.type)))
  .map(type => {
    return places.find(place => place.type === type);
  });
  return (
    
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.mapContainer}>
      <MapView
                ref={mapRef} 

  provider={PROVIDER_GOOGLE}
  style={styles.map}
  initialRegion={{
    latitude: 50.0647,
    longitude: 19.9450,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
  customMapStyle={customMapStyle}
  followsUserLocation={true}
  showsUserLocation={true}
>
  {renderSimpleMarkers()}
  {location && selectedPlaces.length > 0 && (
    <>
    
      <MapViewDirections
        origin={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
        destination={{
          latitude: places.find(p => p.id === selectedPlaces[0]).latitude,
          longitude: places.find(p => p.id === selectedPlaces[0]).longitude,
        }}
        apikey={GOOGLE_MAPS_APIKEY}
        strokeWidth={3}
        strokeColor="#65bdd8"
        mode="WALKING"
        resetOnChange={false}
      />
     
      {selectedPlaces.slice(1).map((placeId, index) => (
        <MapViewDirections
          key={index}
          origin={{
            latitude: places.find(p => p.id === selectedPlaces[index]).latitude,
            longitude: places.find(p => p.id === selectedPlaces[index]).longitude,
          }}
          destination={{
            latitude: places.find(p => p.id === placeId).latitude,
            longitude: places.find(p => p.id === placeId).longitude,
          }}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={3}
          strokeColor="#65bdd8"
          mode="WALKING"
          resetOnChange={false}

        />
      ))}
    </>
  )}
</MapView>
<Modal
  visible={isModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={closeModal}
  style={styles.modalContainer}

>
  <View style={styles.modalContainer}>
   <View style={styles.titleModal}>
   <Text>{`Jesteś przy miejscu: ${currentPlaceName}!`}</Text>

    </View>
    <TouchableOpacity onPress={closeModal} style={styles.closeModal}>
          <Text>Super</Text>
    </TouchableOpacity>
  </View>
</Modal>
{showCancelButton && (
              <View style={styles.buttonCont}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
                <Ionicons name="close" size={30} color={'#922724'} fontWeight={'bold'}/>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ulocButton} onPress={centerOnUser}>
                <Ionicons name="locate" size={30} color={'#65bdd4'} fontWeight={'bold'}/>
              </TouchableOpacity>
              </View>
            )}


      </View>
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
      {showPrbar ? (
      <View style={[styles.prbar]}>
          <View style={styles.progressView}>
            {[...Array(3)].map((_, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={lineStyle(index)} />}
                <TouchableOpacity
                  style={animatedStepStyle(index)}
                  onPress={() => setActiveStep(index)}

                >
                  <Text style={[styles.tstyle,stepTextStyle( index)]}>
                    {stepText(index)}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>
                  ) : (
                    
                    <View >
                        <View style={styles.trackR}>
                       <View><Text style={styles.destPN}>{destinationPlaceName}</Text></View>
                        </View>
                        <View style={styles.trackR1}>
                          
                          <Text>Za</Text>
                          <TrackR routeCoordinates={routeCoordinates} />
                          <Text>Km</Text>
                          
                          </View>


                    </View>
                    
                  )}

      </Animated.View>
      <PanGestureHandler onGestureEvent={gestureHandler} simultaneousHandlers={scrollRef}>
        <Animated.View style={[styles.bottomSheet, animatedStyle]}>
          <Animated.View style={[styles.top, animatedBorderRadius]}>
            <Animated.View style={[styles.holdbar, animatedholdbarStyle]}></Animated.View>
          </Animated.View>
          <LinearGradient
            colors={['rgba(215, 236, 241, 0.95)', 'rgba(246, 237, 237, 0.8)']}
            style={[styles.container ]} 
            >
           
            <View style={styles.hbar}>
              <View style={styles.categroy}>
                <TouchableOpacity
                  onPress={handleAllPress}
                  style={[
                    styles.categroy1,
                    isAllActive && { backgroundColor: '#65bdd8'  },
                  ]}
                >
        <Text style={categoryTextStyle(isAllActive)}>Wszystkie</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFavoritePress}
                  style={[
                    styles.categroy1,
                    isFavoriteActive && { backgroundColor: '#65bdd8',  },
                  ]}
                >
        <Text style={categoryTextStyle(isFavoriteActive)}>Ulubione</Text>
                </TouchableOpacity>
              </View>
              {filteredPlaces.length > 0 ? (
              <PanScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled={false}
              nestedScrollEnabled={true}
              style={styles.scrollView}
            >
      {filteredPlaces.map((place, i) => (
              <TouchableOpacity key={i} style={styles.bsquare}                      onPress={() => handlePlacePress(place.id)} 
              >
                                
                <View style={styles.imbq}> 
                <Image source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoReference}&key=` }} style={styles.image} />

                </View>
                <Text style={styles.bsquareText}>{place.name.split(' ').slice(0, 2).join(' ')}</Text>
                <View style={styles.bsquareText3}> 
                <Ionicons name="location" size={16} color={'#65bdd8'} fontWeight={'bold'}/>
                </View>
                <Text style={styles.bsquareText2}>{place.city}, {place.country}</Text>
                
                 
                  <View style={styles.bsquareText4}> 
                  <Text style={styles.timetext}>{place.time}</Text>
                
                  <Ionicons  style={styles.timeicon} name="time-outline" size={15} color={'white'} />

                </View>
              </TouchableOpacity>
            ))}
            </PanScrollView>
            ) : (
              <View style={{ height: 20 }} />)}
            </View>
            <PanScrollView styles={styles.vscroll}>
                  <View style={styles.trace}>
                  <View style={styles.myloc}>
                    <Text style={styles.tloc}>Twoja lokalizacja</Text>
                    <View style={styles.licon}>
                  <Ionicons name="home" size={23} color={'#65bdd8'} fontWeight={'bold'}/>
                          </View>
                </View>
            
               {selectedPlaces.map((placeId, index) => {
  const place = places.find((p) => p.id === placeId);
  const isLast = index === selectedPlaces.length - 1;
  const isFirstPlace = index === 0;

  return (
    <View key={`place_view_${placeId}`} style={styles.placeView}>
    
      {isLast && (
        <View style={styles.iconContainer}>
          <View style={styles.iconl}> 
                            <Ionicons name="location" size={24} color="#65bdd8" />
                          </View>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </View>
      )}
      
      {!isLast && (
        <View style={styles.iconContainer}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </View>
      )}
      <Text style={styles.placeText}>{place.name.split(' ').slice(0, 2).join(' ')}</Text>
      {userDistance !== null && index ===0  && (

        
        <Text style={styles.mylcal}>
         {userDistance.toFixed(1)} km
        </Text>



      )}
      <TouchableOpacity style={styles.delbut} onPress={() => handlePlacePress(place.id)}>
        
      <Ionicons name="trash" size={24} color="red"  alignSelf={'center'}/>

      </TouchableOpacity>
      
      {index > 0 && place.distance && (
        <Text style={styles.distanceText}>{place.distance}</Text>
      )}
    </View>
  );
})}

            
  

            </View>
            </PanScrollView>
            <TouchableOpacity style={styles.startT} onPress={handleStartPress} disabled={selectedPlaces.length === 0}>
              <Text style={styles.Stext}>Start</Text>
            </TouchableOpacity>


          </LinearGradient>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonCont:{
    height:50,
    width:'100%',
    
    position:'absolute',
    bottom:80,
    justifyContent: 'center',

  },
  trackRText:{
    fontSize:25,
    fontWeight:'bold',
    color:'white'
  },
  destPN:{
    color:'white',
    fontSize:20,
    fontWeight:'600',
  },
  ulocButton:{
    position: 'absolute',
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    justifyContent: 'center',
    right:20,
    
    alignContent:'center',
    alignItems:'center',
  },
  cancelButton: {
    position: 'absolute',
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    justifyContent: 'center',
    left:20,
    
    alignContent:'center',
    alignItems:'center',
  },
  trackR1:{
    height:80,
    width:80,
    position:'absolute',
    backgroundColor:'#65bdd8',
    marginTop:7,
    marginLeft:20,
    borderRadius:40,
    borderWidth:2,
    borderColor:'white',
    justifyContent:'center',
    alignItems:'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    
    elevation: 7,

  },
  closeModal:{
  width:'80%',
  height:50,
  backgroundColor:'white',
  justifyContent:'center',
  alignItems:'center',
  borderRadius:30,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.29,
  shadowRadius: 4.65,
  
  elevation: 7,
  top:'60%',
  borderWidth:2,
  borderColor:'#65bdd8',
  },
  titleModal:{
    marginTop:10,
    width:'80%',
    height:50,
    backgroundColor:'#65bdd8',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    
    elevation: 7,
  },
  modalContainer:
  {
    position:'absolute',
    backgroundColor:'#F5F5F5',
    alignSelf:'center',
    width:"70%",
    height:'40%',
    top:'12%',
    borderRadius:50,
    alignItems:'center',
    borderWidth:2,
    borderColor:'#65bdd8',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    
    elevation: 7,
  },
  trackR:{
    width:'70%',
    height:50,
    backgroundColor:'#65bdd8',
    right:10,
    borderRadius:30,
    position:'absolute',
    marginTop:20,
    borderWidth:2,
    borderColor:'white',
    justifyContent:'center',
    alignItems:'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    
    elevation: 7,
  },
  Stext:{
    alignSelf:'center',
    color:'white',
    fontSize:28,
    fontWeight:'400',
  },
  mylcal:{
    position:'absolute',
    top:-24,
    right:100,
  },
  startT:{
    height:50,
    width:160,
    backgroundColor:'#65bdd8',
    marginBottom:80,
    borderRadius:20,
    alignSelf:'center',
    justifyContent:'center',
    borderWidth:3,
    borderColor:'white',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    
    elevation: 7,
    
  },
  delbut:{
    height:30,
    width:30,
    backgroundColor:'rgba(255, 255, 255, 0.4)',
    position:'absolute',
    right:10,
    justifyContent:'center',
    alignContent:'center',
    borderRadius:30,
  },
  distanceText:{
    color:'black',
    position:'absolute',
    zIndex:1,
    top:-24,
    right:105,
  },
  iconl:{
    position:'absolute',
    left:-138,
    top:35,
  },
  vscroll:{
    flexGrow: 1,
    height:100,
    
  },
  tloc:{
   
  },
  iconContainer:{
   top:-25,

  },
  placeText:{
    bottom:15,
  },
  licon:{
    position:'absolute',
    left:10,
  },
  trace:{
    marginTop:10,
  },
  placeView:{
    backgroundColor:'white',
    alignSelf:'center',
    width:'80%',
    marginBottom:10,
    height: 40,
    borderRadius:30,
    justifyContent:'center',
    alignItems:'center',
    marginTop:20,
    shadowColor: "#000",
shadowOffset: {
	width: 0,
	height: 1,
},
shadowOpacity: 0.22,
shadowRadius: 2.22,

elevation: 3,
  },
  myloc:{
    backgroundColor:'white',
    alignSelf:'center',
    width:'80%',
    marginBottom:10,
    height: 40,
    borderRadius:30,
    justifyContent:'center',
    alignItems:'center',
    shadowColor: "#000",
    sshadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    
    elevation: 3,
  },
  tstyle:{
    fontWeight:500,
  },
  holdbar:{
    height:5,
    
    width:80,
    backgroundColor:'#bababa',
    alignSelf:'center',
    borderRadius:30,
    marginTop:10,
  },
  top:{
    height:40,
    width:'100%',
    top:0,
    position:'absolute',
    zIndex:1,
    backgroundColor:'red',
    marginBottom:10,
    
    
  },
  prbar:{
    height:'100%',
    width:'80%',
    alignSelf:'center',
    position:'absolute',
    top:'60%',

  },
  
  header:{
   
    position:'absolute',
    width:'100%',
    backgroundColor:'rgba(215, 236, 241, 1)',
    alignSelf:'center',
    justifyContent:'center',
    borderRadius:40,
    alignContent:'center',  
    justifyContent:'center',
    zIndex:2,
   

  },
  theader:{
    alignSelf:'center',
    fontSize:30,
  },
  container: {
   
    position: 'absolute',
    overflow: 'hidden',
    borderTopRightRadius:40,
    borderTopLeftRadius:40,
    width:'100%',
    height:'100%',
  },
  categroy:{
    flexDirection: 'row',
  alignSelf:'center',    
    zIndex:1,
    marginLeft:20,
    marginBottom:10,
    marginTop:32,
     

  },
  categroy1:{
    
    height:40,
    width: 150,
    backgroundColor:'white',
    borderRadius:30,
    alignContent:'center',
    marginRight:20,
    justifyContent:'center',
    borderWidth:2,
   borderColor:'#65bdd8',
    shadowColor: "black", 
    shadowOffset: { 
        width: 4,
        height: 4,
    },
    shadowOpacity: 0.40,
    shadowRadius: 2.84, 
    elevation: 7, 
    marginTop:10,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent:'center',
    borderRadius:0,
    zIndex:1,
  },
  scrollView: {
    flexGrow: 1,
    height: 220,
    paddingLeft:10,
    paddingRight:10,
  
  },
  verticalScrollView: {
    flexGrow: 1,
    height: 300,
    width: 200,
  },
  scrollViewContent: {
    flexDirection: 'row',
  },
  scrollViewContent2: {
    flexDirection: 'column',
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    margin: 10,
   
  },
  progressView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    alignSelf:'center',
    
  },

  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#bababa',
    marginHorizontal: 5,
    
  },

  activeStep: {
    backgroundColor: '#65bdd8',
  },
  bsquare: {
    width: 170,
    height: 210,
    
    alignItems: 'center',
    backgroundColor:'#f4f9fc',
    borderRadius:20,
    marginLeft:0,
    marginRight:15,
    marginTop:10,
   borderWidth:3,
   borderColor:'white',
   shadowColor: "#f4f9fc",
    shadowOffset: { 
        width: 4,
        height: 4,
    },
    shadowOpacity: 0.70,
    shadowRadius: 3.84, 
    elevation: 7, 
  },
  bsquareText: {
    color: 'black',
    fontSize: 16,
    position: 'absolute',
    bottom: 30,
    padding: 5,
    zIndex:1,
    left:0,
    fontWeight: 'bold',

  },
  bsquareText2: {
    color: 'black',
    fontSize: 13,
    position: 'absolute',
    bottom: 15,
    padding: 5,
    zIndex:1,
    left:15,

  },
  bsquareText3: {
    color: 'black',
    fontSize: 13,
    position: 'absolute',
    bottom: 15,
    padding: 5,
    zIndex:1,
    left:0,

  },
  bsquareText4: {
    color: 'white',
    backgroundColor: '#65bdd8',
    fontSize: 13,
    position: 'absolute',
    bottom: 9,
    zIndex:1,
    right:0,
    height:30,
    width:55,
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
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft:10,
    

  },
  timeicon:{
    fontWeight: 'bold',
    zIndex:1,
    position:'absolute',
    left:5,
  },

  
  image: {
    width: '100%',
    height: '100%',
    top: 0,
    borderRadius:20,

  },
  imbq:{
    top:2,
    width: '98%',
    height: '70%',
    borderRadius:20,
    position:'absolute',
   
  },
});

export default BottomSheet;

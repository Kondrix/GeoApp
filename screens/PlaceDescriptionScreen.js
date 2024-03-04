import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


const PlaceDescriptionScreen = ({ route }) => {
  const navigation = useNavigation();
  const { placeId } = route.params;
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loremIpsum, setLoremIpsum] = useState('');
  const animatedHeight = useRef(new Animated.Value(300)).current;
  const imageHeight = animatedHeight.interpolate({
    inputRange: [300, 600],
    outputRange: ['70%', '40%'], 
  });

  const dragBarRef = useRef(); 

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => {
      
        return event.target === dragBarRef.current;
      },
      onPanResponderMove: (event, gestureState) => {
     
        if (gestureState.dy > 0) {
          Animated.timing(animatedHeight, {
            toValue: 300,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy < 0) {
          Animated.timing(animatedHeight, {
            toValue: 600,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderRelease: () => {
        
      },
    })
  ).current;

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/places`);
        const data = await response.json();
        const placeDetails = data.find(p => p.id === placeId);
        setPlace(placeDetails);
        setLoading(false);
      } catch (error) {
        console.error('Błąd podczas pobierania danych o miejscu:', error);
      }
    };

    fetchPlaceDetails();

    fetch('https://api.api-ninjas.com/v1/loremipsum?paragraphs=5', {
      method: 'GET',
      headers: {
        'X-Api-Key': 'WxBjeyiSYqXwP568T00bRw==ftIysg4Eky3jtPQz'
      }
    })
      .then(response => response.json())
      .then(data => {
        setLoremIpsum(data.text);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [placeId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.return} onPress={() => navigation.navigate('Home')} >
      <Ionicons name="chevron-back-outline" size={30} color={'black'} />

      </TouchableOpacity>
      <Animated.Image
        source={{
          uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoReference}&key=`,
        }}
        style={[styles.image, { height: imageHeight }]}
        
      />
        <LinearGradient
    colors={['transparent', 'rgba(0,0,0,1)']}
    style={styles.gradient}
  />    
  
        <View style={styles.locont}>
              <Text style={styles.placeName}>{place.name.split(' ').slice(0, 2).join(' ')}</Text>
              <Text style={styles.location}>{place.city}, {place.country}</Text>
              <Ionicons name="location" size={16} color={'white'} fontWeight={'bold'} top={17} left={22}/>
          </View>
      <Animated.View
        style={[styles.descriptionContainer, { height: animatedHeight }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.draggableBar} ref={dragBarRef}>
          <View style={styles.drag}></View>
        </View>
        <View style={styles.info}>
        <View style={styles.row}>
        <View style={styles.square}>
        <Ionicons name="cash" size={30} color={'#5ebad3'} fontWeight={'bold'} />
        </View>
        <View style={styles.column}>
    <Text style={styles.description}>Cena</Text>
    <Text style={styles.additionalText}> 0 PLN</Text> 
  </View>
      </View>
      <View style={styles.row}>
        <View style={styles.square}>
        <Ionicons name="time-sharp" size={30} color={'#5ebad3'} fontWeight={'bold'} />
        </View>
        <View style={styles.column}>
    <Text style={styles.description}>Czas</Text>
    <Text style={styles.additionalText}>{place.time} H</Text> 
  </View>
        
      </View>
      <View style={styles.row}>
        <View style={styles.square}>
        <Ionicons name="star" size={30} color={'gold'} fontWeight={'bold'} />
        </View>
        <View style={styles.column}>
    <Text style={styles.description}>Ocena</Text>
    <Text style={styles.additionalText}>{place.rating}</Text> 
  </View>
  
      </View>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          vertical
          showsVerticalScrollIndicator={true}
        > 
        <Text style={{fontWeight:'bold', fontSize:18,} } >Opis</Text>
          <Text>{loremIpsum}</Text>
          
        </ScrollView>
        <View style={styles.bottom}>
  <TouchableOpacity style={styles.touchableButton}>
    <Text style={styles.touchableButtonText}>Kliknij</Text>
  </TouchableOpacity>
</View>

      </Animated.View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    position: 'absolute',
  },
  info:{
    width:'100%',
    height:70,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent:'center',
  },
  descriptionContainer: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#f4fafc',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 0,
    paddingBottom:100,
    shadowColor: '#000',
    paddingLeft:20,
    paddingRight:20,
    zIndex:1,
  },
  draggableBar: {
    height: 40, 
    width: '100%',
    backgroundColor: 'transparent', 
    alignSelf:'center', 
   
    paddingVertical: 14, 
  },
  drag:{
    width:'20%',
    height:'23%',
    backgroundColor:'gray',
    top:0,
    alignSelf:'center', 
    borderRadius:30,
  },
  locont:{
    top:'52%',
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    top:'55%',
    marginLeft:20,
    color:'white',
   
  },
  location: {
    fontSize: 18,
    
    top:'55%',
    marginLeft:40,
    color:'white',
   
  },
  placeType: {
    fontSize: 20,
    margin: 10,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  square: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius:15,
    alignItems: 'center',
    justifyContent:'center',
    borderWidth:1,
    borderColor:'white',
    shadowColor: "black", 
    shadowOffset: { 
        width: 4,
        height: 4,
    },
    shadowOpacity: 0.20, 
    shadowRadius: 3.44,
    elevation: 7, 
  
  },
  description: {
    marginLeft: 10,
    
    color:'grey',
    fontSize:10,
  },
  column: {
    flexDirection: 'column',
    marginRight:20,
  },
  additionalText: {
    marginLeft: 10,
    fontWeight:'bold',
  },
  bottom:{
    bottom:10,
    height:100,
    width:'100%',
    backgroundColor: 'transparent', 
    position: 'absolute',
    alignSelf:'center',
    justifyContent:'center', 
    zIndex:1,

  },
  touchableButton: {
    backgroundColor: '#5ebad3', 
    padding: 0, 
    alignItems: 'center',
    borderRadius: 15, 
    justifyContent:'center',
    height:60,
   
  },
  
 
  touchableButtonText: {
    color: 'white', 
    fontSize: 16, 
  },
  return:{
    top:40,
    backgroundColor:'#cfdee4',
    position:'absolute',
    zIndex:1,
    width:'auto',
    height:'auto',
    left:20,
    justifyContent:'center',
    alignContent:'center',
    borderRadius:35,
    textAlign:'center',
    opacity:0.5
  },

});

export default PlaceDescriptionScreen;

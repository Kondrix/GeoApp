import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LikedPlacesContext } from '../LikedPlacesContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Heart = ({ place }) => {
  const [likedPlaces, setLikedPlaces] = useContext(LikedPlacesContext);

  useEffect(() => {
      AsyncStorage.getItem('likedPlaces')
          .then(storedLikedPlaces => {

              if (storedLikedPlaces) {
                  setLikedPlaces(JSON.parse(storedLikedPlaces));
                  console.log(`Added ${place.id} to favorites`);

              } else {
                  setLikedPlaces([]);
                  
              }
          });
  }, []);

  const liked = likedPlaces.some(p => p.id === place.id);
  

  const toggleLike = () => {
    if (liked) {
        const newLikedPlaces = likedPlaces.filter(p => p.id !== place.id);
        AsyncStorage.setItem('likedPlaces', JSON.stringify(newLikedPlaces))
            .then(() => {
                console.log(`Removed ${place.id} from favorites`);
                setLikedPlaces(newLikedPlaces);
            });
    } else {
        AsyncStorage.getItem('likedPlaces')
            .then(storedLikedPlaces => {
                let newLikedPlaces = storedLikedPlaces ? JSON.parse(storedLikedPlaces) : [];
                newLikedPlaces.push(place);
                AsyncStorage.setItem('likedPlaces', JSON.stringify(newLikedPlaces))
                    .then(() => {
                        console.log(`Added ${place.name} to favorites`);
                        setLikedPlaces(newLikedPlaces);
                    });
            });
    }
};


  return (
      <TouchableOpacity onPress={toggleLike}>
          <MaterialIcons name="favorite" size={24} color={liked ? 'red' : 'grey'} />
      </TouchableOpacity>
  );
};
const Result = () => {
  const navigation = useNavigation();

  const route = useRoute();
  const { placeName } = route.params;
  const [places, setPlaces] = React.useState([]); 


  
  
  const fetchPlaces = async () => {
    try {
     
      const response = await fetch('http://10.0.2.2:5000/api/places');
      const data = await response.json();
     
      const filteredPlaces = data.filter(place => 
        place.name.toLowerCase().includes(placeName.toLowerCase()));
      setPlaces(filteredPlaces); 
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchPlaces();
  }, []);

  return (
    <LinearGradient
      colors={['#d7ecf1', '#f6eded']}
      style={styles.container}
    >
      <View style={styles.container}>
        <View style={styles.cont}>
          <ScrollView style={styles.row} vertical showsVerticalScrollIndicator={false} /* onScroll={handleScroll} */ scrollEventThrottle={1}>
            {places.map((place, i) => (
              <TouchableOpacity key={i} style={[
                styles.bsquare,
                i === places.length - 1 && { marginBottom: 10 }
              ]} onPress={() => { navigation.navigate('PlaceDescriptionScreen', { placeId: place.id }) }}>
                <View style={styles.like}>
                                <Heart place={place} />
                                </View>
                <View style={styles.imbq}>
                  <Image source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoReference}&key=` }} style={styles.image} />
                </View>
                <Text style={styles.bsquareText}>{place.name.split(' ').slice(0, 2).join(' ')}</Text>
                <View style={styles.bsquareText3}> 
                <Ionicons name="location" size={16} color={'#65bdd8'} fontWeight={'bold'}/>
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
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
};


// Style dla komponentu Result
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
      justifyContent:'center',
  },

  cheader: {
   
    top:70,
    left:20,
    height:'20%',
  },
  header: {
    fontSize: 25,
   
    
  },
  uheader: {
    fontSize: 30,
    fontWeight: 'bold',
    position:'relative',
  },
  look: {
    alignItems: 'center',
    
    
    height:'auto',

  },
  thold:{
    height:60,
    borderColor:'white',
    borderWidth:1,
    borderRadius:15,
    width:340,
    backgroundColor:'white'



  },
  destination: {
    
    alignItems: 'left',

    padding: 20,
    position:'relative',

  },
  cont:{
    top:0,
    bottom:200,
    },
  scrollContainer: {
    flexDirection: 'row',
    
  },
  detailItem: {
    
  },
  row:{
    top:50,
    backgroundColor:'transparent',
    marginBottom:90,
    
  },
  bsquare: {
    width: 358.5,
    height: 320,
    
    alignItems: 'center',
    backgroundColor:'#f4f9fc',
    borderRadius:20,
    marginLeft:0,
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
    fontSize: 14,
    position: 'absolute',
    bottom: 50,
    padding: 5,
    zIndex:1,
    left:0,
    fontWeight: 'bold',

  },
  bsquareText2: {
    color: 'black',
    fontSize: 13,
    position: 'absolute',
    bottom: 30,
    padding: 5,
    zIndex:1,
    left:15,

  },
  bsquareText3: {
    color: 'black',
    fontSize: 13,
    position: 'absolute',
    bottom: 30,
    padding: 5,
    zIndex:1,
    left:0,

  },
  bsquareText4: {
    color: 'white',
    backgroundColor: '#65bdd8',
    fontSize: 13,
    position: 'absolute',
    bottom: 35,
    zIndex:1,
    right:9,
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
  like:{
   right:10,
    zIndex:1,
    top:20,
    position:'absolute',

  }
});

export default Result;

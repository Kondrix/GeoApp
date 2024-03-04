import React, { useEffect, useState , useContext} from 'react';
import { View, Text, Image, StyleSheet, TextInput,ScrollView,TouchableOpacity ,Keyboard} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LikedPlacesContext } from '../LikedPlacesContext'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons} from '@expo/vector-icons';


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

const App = () => {
  const [places, setPlaces] = useState([]);
  const [likedPlaces, setLikedPlaces] = useContext(LikedPlacesContext);
  const navigation = useNavigation();
  const [placeName, setPlaceName] = useState('');

  const handleSearch = () => {
    // Tutaj możesz dodać logikę porównania z API
    navigation.navigate('Result', { placeName });
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log('Klawiatura otwarta');
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Klawiatura zamknięta');
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  useEffect(() => {
   
    fetch('http://10.0.2.2:5000/api/places')
      .then(response => response.json())
      .then(data => setPlaces(data));

    
    AsyncStorage.getItem('likedPlaces')
      .then(storedLikedPlaces => {
        if (storedLikedPlaces) {
          setLikedPlaces(JSON.parse(storedLikedPlaces));
      } else {
          setLikedPlaces([]);
      }
      });
      
  }, []);
  
  
  
  const uniquePlaces = Array.from(new Set(places.map(place => place.type)))
  .map(type => {
    return places.find(place => place.type === type);
  });

  return (
    <LinearGradient
  
  colors={['#d7ecf1', '#f6eded']}
  style={styles.container}
>
    <View style={styles.container}>
      <View style={styles.cheader}>
        
      <Text style={styles.header}>Odkrywaj</Text>
      <Text style={styles.uheader}>Ciekawe Miejsca!</Text>
      </View>
      <View style={styles.look}>
      <TextInput
            style={styles.thold}
            placeholder="Wpisz nazwę miejsca"
            value={placeName}
            onChangeText={setPlaceName}
            onSubmitEditing={handleSearch} 
          />
            <Ionicons  style={styles.icon} name="search" size={25} color={'gray'} />

        </View>
      <View style={styles.destination}>
      
        <Text style={styles.title}>Kategorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {uniquePlaces.map((place, index) => (
    <TouchableOpacity key={index} style={styles.square} onPress={() => {
      if (place.type === 'museum') {
        navigation.navigate('Muzeum');
      } else if (place.type === 'tourist_attraction') {
        navigation.navigate('Atrakcje');
      } else {
        alert(`Kliknięto kwadrat ${place.type}`);
      }
    }}>
     {place.type === 'museum' ? (
          <MaterialIcons name="museum" size={24} color={'#65bdd8'} />
          ) : place.type === 'tourist_attraction' ? (
            <MaterialCommunityIcons  name="church" size={24} color={'#65bdd8'} />
            ) : null}
    </TouchableOpacity>
  ))}
</ScrollView>

      </View>
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.title}>Popularne Miejsca</Text>
          <ScrollView style={styles.row} horizontal showsHorizontalScrollIndicator={false}>
            {places.map((place, i) => (
              <TouchableOpacity key={i} style={styles.bsquare}            onPress={() => navigation.navigate('PlaceDescriptionScreen', { placeId: place.id })}              >
                                <View style={styles.like}>
                                <Heart place={place}  />
                           
                                </View>
                <View style={styles.imbq}> 
                <Image source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photoReference}&key=""` }} style={styles.image} />

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
      
    </View>
    </LinearGradient>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',

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
    alignItems: 'left',
    textAlign:'center',
    color:'black',
    height:'auto',
    justifyContent:'center',
    marginLeft:20,
    marginRight:20,
  },
  look2: {
    alignItems: 'center',

  },
  icon:{
    left:5,
    position: 'absolute',
  },
  thold:{
    height:60,
    borderColor:'white',
    borderWidth:2,
    borderRadius:15,
    width:'100%',
    backgroundColor:'white',
    color:'black',    
    paddingLeft:30,
    



  },
  destination: {
    
    alignItems: 'left',

    padding: 20,
    position:'relative',

  },
  scrollContainer: {
    flexDirection: 'row',
  },
  square: {
    width: 50,
    height: 50,
    margin: 10,
    backgroundColor: '#f4f9fc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:15,
    borderWidth:2,
    borderColor:'white',
  },
  squareText: {
    color: 'black',
    fontSize: 20,
  },
 
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  details: {
    alignItems: 'left',
    left:20,
    position:'relative',
    
  },
  detailItem: {
    
  },
  row:{
    marginRight:20,
  },
  bsquare: {
    width: 240,
    height: 310,
    
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
    padding: 10, 
    borderRadius: 30, 
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 

  }
});

export default App;

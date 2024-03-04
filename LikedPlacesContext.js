import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LikedPlacesContext = createContext();

export const LikedPlacesProvider = ({ children }) => {
  const [likedPlaces, setLikedPlaces] = useState([]);

  useEffect(() => {
    
    const loadLikedPlaces = async () => {
      const savedLikedPlaces = await AsyncStorage.getItem('likedPlaces');
      if (savedLikedPlaces) {
        setLikedPlaces(JSON.parse(savedLikedPlaces));
      }
    };

    loadLikedPlaces();
  }, []);

  useEffect(() => {
    
    const saveLikedPlaces = async () => {
      await AsyncStorage.setItem('likedPlaces', JSON.stringify(likedPlaces));
    };

    saveLikedPlaces();
  }, [likedPlaces]);

  return (
    <LikedPlacesContext.Provider value={[likedPlaces, setLikedPlaces]}>
      {children}
    </LikedPlacesContext.Provider>
  );
};

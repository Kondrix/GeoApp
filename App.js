// App.js
import React, { useState, useEffect, createContext } from 'react';
import * as Location from 'expo-location';
import { StyleSheet, View , TouchableOpacity} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';

import Like from './screens/Like';
import Add from './screens/nav'
import Settings  from './screens/Settings';
import Museum from './screens/MuseumScreen';
import PlaceDescriptionScreen from './screens/PlaceDescriptionScreen';
import Attractions from './screens/tourist_attraction';
import Result from './screens/Result';
import NavStart from './screens/NavStart'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LikedPlacesProvider } from './LikedPlacesContext'; // Dodaj ten import
import { TabBarVisibilityProvider, useTabBarVisibility } from './TabBarContext'; // Zaimportuj nowy kontekst
import { LocationProvider  } from './LocationContext';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MyTabs() {
  const { tabBarVisible } = useTabBarVisibility(); 

  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: '#65bdd8',

      headerShown: false, tabBarStyle: {
        borderRadius:20,
        position: 'absolute',
        height:70,
       paddingBottom:10,
        margin:17,
        display: tabBarVisible ? 'flex' : 'none', 

      },
    }}
    
    >
      <Tab.Screen
        name="Start"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ulubione"
        component={Like}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
       <Tab.Screen
        name="Add"
        component={NavStart} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          ),
          tabBarStyle: {
            
         
            position: 'absolute',
            height:70,
           paddingBottom:20,
            margin:0,
          },
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />

<Tab.Screen
        name="Ustawienia"
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    
    </Tab.Navigator>
     
  );
}

function MyStack() {
  return (
    <Stack.Navigator initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen name="Home" component={MyTabs} />
      <Stack.Screen name="PlaceDescriptionScreen" component={PlaceDescriptionScreen} />
      <Stack.Screen name="Muzeum" component={Museum} />
      <Stack.Screen name="Atrakcje" component={Attractions} />
      <Stack.Screen name="Result" component={Result} />

      
    </Stack.Navigator>
  );
}
const CustomTabBarButton = ({  onPress, accessibilityState }) => {
  const isActive = accessibilityState?.selected;

  return (
    <TouchableOpacity
      style={{
        top: -30,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.shadow,
      }}
      onPress={onPress}
    >
      <View style={{
  width: isActive ? 55 : 70,
  height: isActive ? 55 : 70,
  borderRadius: 35,
  backgroundColor: '#65bdd8',
  top: isActive ? 34 : 20,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: isActive ? 'white' : 'gray',
  paddingTop: isActive ? 4 : 0,
  paddingRight: isActive ? 4 : 0,
  shadowColor: isActive ? '#000' : 'transparent', 
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: isActive ? 0.25 : 0,
  shadowRadius: isActive ? 3.84 : 0,
  elevation: isActive ? 5 : 0, 
}}>
        <Ionicons name="paper-plane-outline" size={40} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

export default function App() {
 

  return (
    <LocationProvider>
      <TabBarVisibilityProvider>
        <LikedPlacesProvider>
          <NavigationContainer>
            <MyStack />
          </NavigationContainer>
        </LikedPlacesProvider>
      </TabBarVisibilityProvider>
      </LocationProvider>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },

});

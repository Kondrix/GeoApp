
import React, { createContext, useState, useContext } from 'react';


const TabBarVisibilityContext = createContext({
  tabBarVisible: true,
  setTabBarVisible: () => {},
});


export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);


export const TabBarVisibilityProvider = ({ children }) => {
  const [tabBarVisible, setTabBarVisible] = useState(true);

  return (
    <TabBarVisibilityContext.Provider value={{ tabBarVisible, setTabBarVisible }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

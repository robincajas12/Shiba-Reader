import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { ReaderScreen } from '../screens/ReaderScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootTabParamList = {
  Home: undefined;
  Reader: { url: string } | undefined;
  Search: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => (
  <Text style={{ 
    color: focused ? '#c8c0b0' : '#555', 
    fontSize: 20,
    marginTop: 5
  }}>
    {label}
  </Text>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused }) => {
          let icon = '';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Reader') icon = '📖';
          else if (route.name === 'Search') icon = '🔍';
          else if (route.name === 'Settings') icon = '⚙️';
          return <TabIcon label={icon} focused={focused} />;
        },
        tabBarActiveTintColor: '#c8c0b0',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          backgroundColor: '#1c1c1c',
          borderTopColor: '#333',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: '#1c1c1c',
        },
        headerTitleStyle: {
          color: '#e5dccb',
        },
        headerTintColor: '#e5dccb',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Reader" 
        component={ReaderScreen} 
        options={{ 
          title: 'Lector',
          headerShown: false // We use our own header in ReaderScreen
        }}
        initialParams={{ url: 'https://www3.nhk.or.jp/news/easy/' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Buscar' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
};

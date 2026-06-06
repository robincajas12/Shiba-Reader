import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { ReaderScreen } from '../screens/ReaderScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VocabularyScreen } from '../screens/VocabularyScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { useTheme } from '../ThemeContext';

export type RootTabParamList = {
  Home: undefined;
  Reader: { url: string } | undefined;
  Vocabulary: undefined;
  MoreStack: undefined;
};

export type MoreStackParamList = {
  More: undefined;
  Search: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<MoreStackParamList>();

const MoreNavigator = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          color: theme.colors.header,
          fontFamily: theme.fonts.serif,
        },
        headerTintColor: theme.colors.header,
      }}
    >
      <Stack.Screen 
        name="More" 
        component={MoreScreen} 
        options={{ title: 'Más' }} 
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Buscar' }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Ajustes' }} 
      />
    </Stack.Navigator>
  );
};

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const { theme } = useTheme();
  return (
    <Text style={{ 
      color: focused ? theme.colors.primary : theme.colors.textMuted, 
      fontSize: 20,
      marginTop: 5
    }}>
      {label}
    </Text>
  );
};

export const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused }) => {
          let icon = '';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Reader') icon = '📖';
          else if (route.name === 'Vocabulary') icon = '🔖';
          else if (route.name === 'MoreStack') icon = '⋯';
          return <TabIcon label={icon} focused={focused} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          color: theme.colors.header,
          fontFamily: theme.fonts.serif,
        },
        headerTintColor: theme.colors.header,
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
        initialParams={{ url: 'https://www.google.com' }}
      />
      <Tab.Screen 
        name="Vocabulary" 
        component={VocabularyScreen} 
        options={{ title: 'Vocabulario' }}
      />
      <Tab.Screen 
        name="MoreStack" 
        component={MoreNavigator} 
        options={{ 
          title: 'Más',
          headerShown: false // The stack has its own header
        }}
      />
    </Tab.Navigator>
  );
};

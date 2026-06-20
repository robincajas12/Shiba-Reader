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
import { SRSReviewScreen } from '../screens/SRSReviewScreen';
import { LegalScreen } from '../screens/LegalScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { useTheme } from '../ThemeContext';

// 1. Tipos de Parámetros de Rutas
export type RootStackParamList = {
  MainTabs: undefined;
  Premium: undefined; // Movido al stack raíz para cubrir todo (incluso la barra inferior)
};

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
  SRSReview: { mode: 'normal' | 'queue' };
  Legal: undefined;
};

// 2. Creación de los Navegadores
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<MoreStackParamList>();

// 3. Sub-Navigator para la sección "More"
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
        options={{ title: 'More' }} 
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Search' }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="SRSReview" 
        component={SRSReviewScreen} 
        options={({ route }) => ({ 
          title: route.params?.mode === 'queue' ? 'Mining Queue' : 'Daily Review', 
          headerShown: false 
        })} 
      />
      <Stack.Screen 
        name="Legal" 
        component={LegalScreen} 
        options={{ title: 'Legal & Credits', headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

// Icono personalizado para las pestañas
const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const { theme } = useTheme();
  return (
    <Text style={{ 
      color: focused ? theme.colors.primary : theme.colors.textMuted, 
      fontSize: 22,
      lineHeight: 28,
      textAlign: 'center',
    }}>
      {label}
    </Text>
  );
};

// 4. Navegador de Pestañas Inferiores (Tab Navigator)
const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused }) => {
          let icon = '';
          if (route.name === 'Home') icon = '家';
          else if (route.name === 'Reader') icon = '読';
          else if (route.name === 'Vocabulary') icon = '語';
          else if (route.name === 'MoreStack') icon = '他';
          return <TabIcon label={icon} focused={focused} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 65,
          paddingTop: 8,
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
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Reader" 
        component={ReaderScreen} 
        options={{ 
          title: 'Reader',
          headerShown: false
        }}
        initialParams={{ url: 'https://www.google.com' }}
      />
      <Tab.Screen 
        name="Vocabulary" 
        component={VocabularyScreen} 
        options={{ title: 'Vocabulary' }}
      />
      <Tab.Screen 
        name="MoreStack" 
        component={MoreNavigator} 
        options={{ 
          title: 'More',
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

// 5. Navegador Raíz (Root Navigator)
export const AppNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Las pestañas que contienen toda la app base */}
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      
      {/* La pantalla premium como modal sobrepuesta a todo (cubre las pestañas) */}
      <RootStack.Screen 
        name="Premium" 
        component={PremiumScreen} 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }} 
      />
    </RootStack.Navigator>
  );
};

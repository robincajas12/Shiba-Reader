import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReaderScreen } from '../screens/ReaderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  Reader: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Reader"
      screenOptions={{
        headerShown: false // We use our own custom Header in ReaderScreen
      }}
    >
      <Stack.Screen name="Reader" component={ReaderScreen} />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          headerShown: true,
          title: 'Configuración'
        }} 
      />
    </Stack.Navigator>
  );
};

import { View, Text } from 'react-native'
import React from 'react'

import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import Index from "./screens/Index"

import HomeScreen from "./screens/HomeScreen"
import ChatScreen from "./screens/ChatScreen"
import EditProfile from './screens/EditProfile'
import EditPersonalInformation from './screens/EditPersonalInformation'
import EditUsername from './screens/EditUsername'
import EditName from './screens/EditName'
import EditBio from './screens/EditBio'
import EditPassword from './screens/EditPassword'
import EditPhone from './screens/EditPhone'
import EditGender from './screens/EditGender'
import EditDateOfBirth from './screens/EditDateOfBirth'

import useAuth from "./hooks/useAuth"

const StackNavigator = () => {
  const { user } = useAuth()

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
          <Stack.Screen name="EditPersonalInformation" component={EditPersonalInformation} options={{ headerShown: false }} />
          <Stack.Screen name="EditUsername" component={EditUsername} options={{ headerShown: false }} />
          <Stack.Screen name="EditName" component={EditName} options={{ headerShown: false }} />
          <Stack.Screen name="EditBio" component={EditBio} options={{ headerShown: false }} />
          <Stack.Screen name="EditPassword" component={EditPassword} options={{ headerShown: false }} />
          <Stack.Screen name="EditPhone" component={EditPhone} options={{ headerShown: false }} />
          <Stack.Screen name="EditGender" component={EditGender} options={{ headerShown: false }} />
          <Stack.Screen name="EditDateOfBirth" component={EditDateOfBirth} options={{ headerShown: false }} />
        </>
      ) :
        <>
          <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        </>
      }
    </Stack.Navigator>
  )
}

export default StackNavigator
import React from 'react'
import { View, ScrollView } from 'react-native'
import Header from '../components/Header'
import color from '../style/color'

import { useFonts } from 'expo-font'
import AddPost from '../components/AddPost'
import Posts from '../components/Posts'

const Feeds = () => {

  const [loaded] = useFonts({
    text: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf')
  })

  if (!loaded)
    return null

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.white
      }}
    >
      <Header showLogo showAratar />

      <ScrollView>
        <AddPost />
        <Posts />
      </ScrollView>
    </View>
  )
}

export default Feeds
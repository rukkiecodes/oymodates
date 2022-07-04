import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, Image, FlatList } from 'react-native'

import { collection, onSnapshot, query, where } from 'firebase/firestore'

import { db } from '../../hooks/firebase'
import useAuth from '../../hooks/useAuth'
import color from '../../style/color'

import { useFonts } from 'expo-font'
import { useNavigation } from '@react-navigation/native'


const MyReels = () => {
  const { user, userProfile } = useAuth()
  const navigation = useNavigation()

  const [reels, setReels] = useState([])

  useEffect(() =>
    (() => {
      onSnapshot(query(collection(db, 'reels'),
        where('user.id', '==', user?.uid)),
        snapshot => setReels(
          snapshot.docs.map(doc => ({
            id: doc?.id,
            ...doc?.data()
          }))
        ))
    })()
    , [user, db])

  const [loaded] = useFonts({
    text: require('../../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf'),
    boldText: require('../../assets/fonts/Montserrat_Alternates/MontserratAlternates-Bold.ttf')
  })

  if (!loaded) return null

  return (
    <FlatList
      data={reels}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        marginHorizontal: 10,
        marginTop: 20
      }}
      renderItem={({ item: reel }) => (
        <Pressable
          onPress={() => navigation.navigate('ViewReel', { reel })}
          style={{
            padding: 5,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginBottom: 20
          }}
        >
          <Image
            source={{ uri: reel?.thumbnail }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
              marginRight: 10
            }}
          />

          <View
            style={{
              flex: 1,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: userProfile?.theme == 'dark' ? color.white : color.black,
                fontSize: 18
              }}
            >
              {reel?.description}
            </Text>

            <Text
              style={{
                color: userProfile?.theme == 'dark' ? color.white : color.dark,
                fontSize: 13
              }}
            >
              Video - {reel?.user?.username}
            </Text>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-end'
              }}
            >
              <View
                style={{
                  flexDirection: 'row'
                }}
              >
                <Text
                  style={{
                    marginRight: 5,
                    fontFamily: 'text',
                    color: userProfile?.theme == 'dark' ? color.white : color.dark
                  }}
                >
                  {reel?.likesCount}
                </Text>
                <Text
                  style={{
                    color: userProfile?.theme == 'dark' ? color.white : color.lightText,
                    fontFamily: 'text'
                  }}
                >
                  {reel?.likesCount == 1 ? 'Like' : 'Likes' }
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: 10
                }}
              >
                <Text
                  style={{
                    marginRight: 5,
                    fontFamily: 'text',
                    color: userProfile?.theme == 'dark' ? color.white : color.dark
                  }}
                >
                  {reel?.commentsCount}
                </Text>
                <Text
                  style={{
                    color: userProfile?.theme == 'dark' ? color.white : color.lightText,
                    fontFamily: 'text'
                  }}
                >
                  {reel?.commentsCount == 1 ? 'Comment' : 'Comments'}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      )}
    />
  )
}

export default MyReels
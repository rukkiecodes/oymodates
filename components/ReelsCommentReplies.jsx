import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'

import { useFonts } from 'expo-font'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../hooks/firebase'
import color from '../style/color'
import LikeReelsReply from './LikeReelsReply'

const ReelsCommentReplies = (props) => {
  const comments = props.comment
  const [replies, setReplies] = useState([])

  useEffect(() =>
    onSnapshot(collection(db, 'reels', comments?.reel, 'comments', comments?.id, 'replies'),
      snapshot =>
        setReplies(
          snapshot?.docs?.map(doc => ({
            id: doc?.id,
            ...doc?.data()
          }))
        )
    )
    , [])

  const [loaded] = useFonts({
    text: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf')
  })

  if (!loaded) return null

  return (
    <View
      style={{
        marginTop: 10
      }}
    >
      <FlatList
        data={replies.splice(0, 1)}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
        renderItem={({ item: reply }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 10
            }}
          >
            <Image
              source={{ uri: reply?.user?.photoURL }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 50,
              }}
            />
            <View>
              <View
                style={{
                  marginLeft: 10,
                  backgroundColor: color.offWhite,
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: color.dark,
                    fontFamily: 'text',
                    fontSize: 13
                  }}
                >
                  {reply?.user?.displayName}
                </Text>
                <Text
                  style={{
                    color: color.dark
                  }}
                >
                  {reply?.reply}
                </Text>
              </View>
              <View
                style={{
                  width: '100%',
                  paddingHorizontal: 10,
                  marginTop: 5,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <LikeReelsReply reply={reply} />
                {/* <LikeReply reply={reply} /> */}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default ReelsCommentReplies
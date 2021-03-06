import { View, Text, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import color from '../style/color'
import useAuth from '../hooks/useAuth'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../hooks/firebase'

const PostSubReplies = ({ reply }) => {
  const { userProfile } = useAuth()

  const [replies, setReplies] = useState([])

  useEffect(() =>
    (() => {
      onSnapshot(collection(db, 'posts', reply?.post?.id, 'comments', reply?.comment, 'replies', reply?.id, 'reply'),
        snapshot =>
          setReplies(
            snapshot?.docs?.map(doc => ({
              id: doc?.id,
              ...doc?.data()
            }))
          )
      )
    })()
    , [])

  return (
    <FlatList
      data={replies}
      keyExtractor={Item => Item?.id}
      style={{ flex: 1 }}
      renderItem={({ item: reply }) => (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginTop: 10,
            marginLeft: 20
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
                backgroundColor: userProfile?.theme == 'light' ? color.offWhite : userProfile?.theme == 'dark' ? color.lightText : color.dark,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: userProfile?.theme == 'light' ? color.dark : color.white,
                  fontFamily: 'text',
                  fontSize: 13
                }}
              >
                {reply?.user?.username}
              </Text>
              <Text
                style={{
                  color: userProfile?.theme == 'light' ? color.dark : color.white
                }}
              >
                {reply?.reply}
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  )
}

export default PostSubReplies
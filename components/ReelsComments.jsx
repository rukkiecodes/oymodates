import React, { useEffect, useState } from 'react'

import {
  View,
  Text,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  Keyboard,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  UIManager,
} from 'react-native'

import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'

import { db } from '../hooks/firebase'

import color from '../style/color'

import useAuth from '../hooks/useAuth'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import uuid from 'uuid-random'
import { useFonts } from 'expo-font'

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
)
  UIManager.setLayoutAnimationEnabledExperimental(true)

const ReelsComments = (props) => {
  const { userProfile, user } = useAuth()
  const reel = props?.reel

  const [comments, setComments] = useState([])
  const [height, setHeight] = useState(40)
  const [input, setInput] = useState('')
  const [mediaVidiblity, setMediaVidiblity] = useState(false)

  useEffect(() =>
    onSnapshot(collection(db, 'reels', reel?.id, 'comments'),
      snapshot =>
        setComments(
          snapshot?.docs?.map(doc => ({
            id: doc?.id,
            ...doc?.data()
          }))
        )
    )
    , [])

  const likeComment = async (comment) => {
    comment?.likes?.includes(user.uid) ?
      await updateDoc(doc(db, 'reels', comment?.reel, 'comments', comment?.id), {
        likes: arrayRemove(userProfile?.id)
      }) :
      await updateDoc(doc(db, 'reels', comment?.reel, 'comments', comment?.id), {
        likes: arrayUnion(userProfile?.id)
      })
  }

  const sendCommentReply = async (comment) => {
    if (input != '')
      await updateDoc(doc(db, 'reels', comment?.reel, 'comments', comment?.id), {
        reply: arrayUnion({
          reply: input,
          id: uuid(),
          user: {
            id: userProfile?.id,
            displayName: userProfile?.displayName,
            photoURL: userProfile?.photoURL
          }
        })
      })
    setInput('')
  }

  const showReplyInput = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    setMediaVidiblity(!mediaVidiblity)
  }

  const [loaded] = useFonts({
    text: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf')
  })

  if (!loaded) return null

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        style={{
          flex: 1,
          marginHorizontal: 10
        }}
        renderItem={({ item: comment }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginBottom: 10
            }}
          >
            <Image
              source={{ uri: comment?.user?.photoURL }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 50
              }}
            />
            <View
              style={{
                width: '100%',
                alignItems: 'flex-start'
              }}
            >
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
                  {comment?.user?.displayName}
                </Text>
                <Text
                  style={{
                    color: color.dark
                  }}
                >
                  {comment?.comment}
                </Text>
              </View>

              <View
                style={{
                  width: '100%',
                  paddingHorizontal: 10
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginTop: 4
                  }}
                >
                  <TouchableOpacity
                    onPress={() => likeComment(comment)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                      marginRight: 10,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center'
                    }}
                  >
                    {
                      comment?.likes?.length > 0 &&
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center'
                        }}
                      >
                        <Image
                          source={require('../assets/heart.png')}
                          style={{
                            width: 15,
                            height: 15
                          }}
                        />
                        <Text
                          style={{
                            color: comment?.likes?.includes(user?.uid) ? color.red : color.dark,
                            marginLeft: 4
                          }}
                        >
                          {`${comment?.likes?.length} `}
                        </Text>
                      </View>
                    }
                    <Text
                      style={{
                        color: comment?.likes?.includes(user?.uid) ? color.red : color.dark
                      }}
                    >
                      {
                        comment?.likes?.length <= 1 ? 'Like' : 'Likes'
                      }
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={showReplyInput}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 2
                    }}
                  >
                    <Text
                      style={{
                        color: color.dark
                      }}
                    >
                      Reply
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    marginTop: 10
                  }}
                >
                  <FlatList
                    data={comment?.reply}
                    keyExtractor={item => item.id}
                    style={{
                      flex: 1
                    }}
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
                      </View>
                    )}
                  />
                </View>

                {
                  mediaVidiblity &&
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      width: '100%',
                      paddingRight: 20,
                      marginTop: 10
                    }}
                  >
                    <TextInput
                      multiline
                      value={input}
                      onChangeText={setInput}
                      onSubmitEditing={() => sendCommentReply(comment)}
                      onContentSizeChange={e => setHeight(e.nativeEvent.contentSize.height)}
                      placeholder={`Reply ${comment?.user?.displayName}`}
                      style={{
                        minHeight: 40,
                        height,
                        borderRadius: 50,
                        backgroundColor: color.offWhite,
                        width: '85%',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        color: color.dark
                      }}
                    />

                    <TouchableOpacity
                      onPress={() => sendCommentReply(comment)}
                      style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 10
                      }}>
                      <FontAwesome5
                        name='paper-plane'
                        color={color.lightText}
                        size={20}
                      />
                    </TouchableOpacity>
                  </View>
                }
              </View>
            </View>
          </View>
        )}
      />
    </TouchableWithoutFeedback>
  )
}

export default ReelsComments
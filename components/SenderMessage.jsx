import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, Image, TouchableOpacity, UIManager, LayoutAnimation, Platform, ImageBackground } from 'react-native'
import useAuth from '../hooks/useAuth'
import color from '../style/color'

import { AntDesign } from '@expo/vector-icons'

import Slider from '@react-native-community/slider'

import { Audio, Video } from 'expo-av'
import { useNavigation } from '@react-navigation/native'
import AutoHeightImage from 'react-native-auto-height-image'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) UIManager.setLayoutAnimationEnabledExperimental(true)

const SenderMessage = ({ messages, matchDetails }) => {
  const { userProfile, user } = useAuth()

  const navigation = useNavigation()
  const video = useRef(null)

  const [sound, setSound] = useState()
  const [status, setStatus] = useState()
  const [Value, SetValue] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [numberOfLines, setNumberOfLines] = useState(10)

  const playVoicenote = async voiceNote => {
    const { sound, status } = await Audio?.Sound?.createAsync({ uri: voiceNote })
    setSound(sound)
    setStatus(status)
    setIsPlaying(true)
    sound?.setOnPlaybackStatusUpdate(UpdateStatus)
    await sound?.playAsync()
  }

  const pauseVoicenote = async voiceNote => {
    sound?.pauseAsync()
    setIsPlaying(false)
  }

  const UpdateStatus = async (data) => {
    try {
      if (data.didJustFinish) {
        SetValue(0)
        setIsPlaying(false)
      } else if (data.positionMillis) {
        if (data.durationMillis) {
          SetValue((data.positionMillis / data.durationMillis) * 100)
        }
      }
    } catch (error) {
      console.log('Error')
    }
  }

  useEffect(() => {
    return sound ? () => sound?.unloadAsync() : undefined
  }, [sound])

  return (
    <View style={{ flexDirection: 'row-reverse', marginBottom: 10 }}>
      <View
        style={{
          alignSelf: 'flex-end',
          maxWidth: '80%'
        }}
      >
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
            setShowTime(!showTime)
            setNumberOfLines(numberOfLines == 10 ? 1000 : 10)
          }}
          onLongPress={() => navigation.navigate('MessageOptions', { messages, matchDetails })}
        >
          {
            messages?.message &&
            <View>
              {
                messages?.reply ?
                  <View
                    style={{
                      backgroundColor: messages.message ? color.blue : color.transparent,
                      padding: messages?.reply ? 5 : 10,
                      borderTopLeftRadius: 12,
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => console.log('reply: ', messages?.reply)}
                      activeOpacity={0.7}
                      style={{
                        padding: 5,
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                        backgroundColor: color.darkBlue,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        overflow: 'hidden'
                      }}
                    >
                      {
                        messages?.reply?.mediaType == 'video' &&
                        <Video
                          source={{ uri: messages?.reply?.media }}
                          resizeMode='cover'
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 8
                          }}
                        />
                      }
                      {
                        messages?.reply?.mediaType == 'image' &&
                        <Image
                          source={{ uri: messages?.reply?.media }}
                          resizeMode='cover'
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 8
                          }}
                        />
                      }
                      {
                        messages?.reply?.caption != '' &&
                        <Text
                          numberOfLines={3}
                          style={{
                            color: color.white,
                            marginLeft: messages?.reply?.media ? 10 : 0
                          }}
                        >
                          {messages?.reply?.caption}
                        </Text>
                      }
                      {
                        messages?.reply?.message &&
                        <Text
                          numberOfLines={3}
                          style={{
                            color: color.white,
                            marginLeft: messages?.reply?.media ? 10 : 0
                          }}
                        >
                          {messages?.reply?.message}
                        </Text>
                      }
                    </TouchableOpacity>
                    <Text
                      numberOfLines={numberOfLines}
                      style={{
                        color: color.white,
                        fontSize: 16,
                        textAlign: 'left'
                      }}
                    >
                      {messages?.message}
                    </Text>
                  </View> :
                  <View
                    style={{
                      backgroundColor: messages.message ? color.blue : color.transparent,
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 12,
                      borderBottomLeftRadius: 12,
                      borderTopLeftRadius: 12
                    }}
                  >
                    <Text
                      numberOfLines={numberOfLines}
                      style={{
                        color: color.white,
                        fontSize: 16,
                        textAlign: 'left'
                      }}
                    >
                      {messages?.message}
                    </Text>
                  </View>
              }
              {
                messages?.timestamp &&
                <>
                  {
                    showTime &&
                    <Text style={{ color: userProfile?.appMode == 'light' ? color.dark : color.white, fontSize: 8, textAlign: 'right', marginRight: 10, marginBottom: 10 }}>
                      {new Date(messages?.timestamp?.seconds * 1000 + messages?.timestamp?.nanoseconds / 1000000).toDateString()}
                    </Text>
                  }
                </>
              }
            </View>
          }
          {
            messages?.mediaType == 'image' &&
            <View
              style={{
                position: 'relative',
                backgroundColor: color.blue,
                borderRadius: 20,
                overflow: 'hidden'
              }}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('ViewAvarar', { avatar: messages?.media })}
                onLongPress={() => navigation.navigate('MessageOptions', { messages, matchDetails })}
              >
                <AutoHeightImage
                  source={{ uri: messages?.media }}
                  width={300}
                  resizeMode='cover'
                  style={{
                    flex: 1,
                    borderRadius: 20
                  }}
                />
              </Pressable>
              {
                messages?.caption &&
                <>
                  <View
                    style={{
                      flex: 1,
                      height: 30,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      padding: 5,
                      margin: 5,
                      backgroundColor: color.darkBlue,
                      borderRadius: 4,
                      borderBottomLeftRadius: 20,
                      borderBottomRightRadius: 20
                    }}
                  >
                    <Text
                      numberOfLines={numberOfLines}
                      style={{
                        color: userProfile?.appMode == 'light' ? color.dark : color.white,
                        fontSize: 16,
                        textAlign: 'left'
                      }}
                    >
                      {messages?.caption}
                    </Text>
                  </View>
                  {
                    messages?.timestamp &&
                    <>
                      {
                        showTime &&
                        <Text style={{ color: userProfile?.appMode == 'light' ? color.dark : color.white, fontSize: 8, textAlign: 'right', marginRight: 10, marginBottom: 10 }}>
                          {new Date(messages?.timestamp?.seconds * 1000 + messages?.timestamp?.nanoseconds / 1000000).toDateString()}
                        </Text>
                      }
                    </>
                  }
                </>
              }
            </View>
          }
          {
            messages?.mediaType == 'video' &&
            <View
              style={{
                position: 'relative'
              }}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('ViewVideo', { video: messages?.media })}
                onLongPress={() => navigation.navigate('MessageOptions', { messages, matchDetails })}
              >
                <Video
                  source={{ uri: messages?.media }}
                  resizeMode='cover'
                  style={{
                    flex: 1,
                    minWidth: 300,
                    minHeight: 300,
                    borderRadius: 20
                  }}
                />
              </Pressable>
              {
                messages?.caption != '' &&
                <>
                  <View
                    style={{
                      width: '100%',
                      height: 30,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Text
                      numberOfLines={numberOfLines}
                      style={{
                        color: userProfile?.appMode == 'light' ? color.dark : color.white,
                        fontSize: 16,
                        textAlign: 'left'
                      }}
                    >
                      {messages?.caption}
                    </Text>
                  </View>
                  {
                    messages?.timestamp &&
                    <>
                      {
                        showTime &&
                        <Text style={{ color: userProfile?.appMode == 'light' ? color.dark : color.white, fontSize: 8, textAlign: 'right' }}>
                          {new Date(messages?.timestamp?.seconds * 1000 + messages?.timestamp?.nanoseconds / 1000000).toDateString()}
                        </Text>
                      }
                    </>
                  }
                </>
              }
            </View>
          }
          {
            messages.voiceNote &&
            <View
              style={{
                position: 'relative',
                width: 200,
                height: 35,
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: color.blue,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 2,
                paddingLeft: 10
              }}
            >
              <Slider
                style={{ width: 150 }}
                value={Value}
                minimumValue={0}
                maximumValue={100}
                minimumTrackTintColor={color.white}
                maximumTrackTintColor={color.offWhite}
                thumbTintColor={color.offWhite}
              />
              <TouchableOpacity
                onPress={() => !isPlaying ? playVoicenote(messages.voiceNote) : pauseVoicenote(messages.voiceNote)}
                style={{
                  backgroundColor: color.white,
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {
                  !isPlaying ?
                    <AntDesign name='caretright' size={20} color={color.blue} /> :
                    <AntDesign name='pause' size={20} color={color.blue} />
                }
              </TouchableOpacity>
            </View>
          }
        </Pressable>
      </View >
    </View >
  )
}

export default SenderMessage
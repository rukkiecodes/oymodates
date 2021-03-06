import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'

import {
  View,
  Keyboard,
  TextInput,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Text,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image
} from 'react-native'

import color from '../style/color'

import Header from '../components/Header'

import { useRoute, useNavigation } from '@react-navigation/native'

import useAuth from '../hooks/useAuth'

import getMatchedUserInfo from '../lib/getMatchedUserInfo'

import SenderMessage from '../components/SenderMessage'
import RecieverMessage from '../components/RecieverMessage'
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../hooks/firebase'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'

import { useFonts } from 'expo-font'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) UIManager.setLayoutAnimationEnabledExperimental(true)

import { Audio, Video } from 'expo-av'

import uuid from 'uuid-random'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

import * as ImagePicker from 'expo-image-picker'

import * as VideoThumbnails from 'expo-video-thumbnails'
import Slider from '@react-native-community/slider'

const Message = () => {
  const navigation = useNavigation()
  const { user, userProfile, messageReply, setMessageReply } = useAuth()

  const { matchDetails } = useRoute().params

  const storage = getStorage()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [height, setHeight] = useState(50)
  const [mediaVidiblity, setMediaVidiblity] = useState(true)
  const [showRecording, setShowRecording] = useState(false)
  const [showSend, setShowSend] = useState(true)
  const [recording, setRecording] = useState()
  const [recordings, setRecordings] = useState([])
  const [recordingLoading, setRecordingLoading] = useState(false)
  const [chatTheme, setChatTheme] = useState()
  const [chatThemeIndex, setChatThemeIndex] = useState()

  useLayoutEffect(() =>
    (() => {
      onSnapshot(query(collection(db,
        'matches', matchDetails?.id, 'messages'),
        orderBy('timestamp', 'desc')),
        snapshot => setMessages(snapshot?.docs?.map(doc => ({
          id: doc?.id,
          ...doc?.data()
        })))
      )
    })()
    , [matchDetails, db])

  useLayoutEffect(() =>
    (() => {
      onSnapshot(doc(db, 'matches', matchDetails?.id), doc => {
        setChatTheme(doc?.data()?.chatTheme)
        setChatThemeIndex(doc?.data()?.chatThemeIndex)
      })
    })()
    , [matchDetails, db])

  useEffect(() =>
    (() => {
      Keyboard.addListener('keyboardDidShow', () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setMediaVidiblity(false)
      })
    })()
    , [])

  useEffect(() =>
    (() => {
      Keyboard.addListener('keyboardDidHide', () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setMediaVidiblity(true)
      })
    })()
    , [])

  const updateSeen = async () => {
    const snapshot = await getDocs(query(collection(db, 'matches', matchDetails?.id, 'messages'), where('seen', '==', false)))
    snapshot.forEach(async allDoc => {
      await updateDoc(doc(db, 'matches', matchDetails?.id, 'messages', allDoc?.id), {
        seen: true
      })
    })
  }

  useLayoutEffect(() => {
    updateSeen()
  }, [matchDetails])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    })

    if (!result?.cancelled) {
      if (result?.type === 'video') {
        const { uri } = await VideoThumbnails.getThumbnailAsync(result?.uri, { time: 1000 })
        if (uri)
          navigation.navigate('PreviewMessageImage', {
            matchDetails,
            media: {
              ...result,
              thumbnail: uri
            }
          })
      } else {
        navigation.navigate('PreviewMessageImage', {
          matchDetails,
          media: result
        })
      }
    }
  }

  const sendMessage = async () => {
    if (input != '') {
      addDoc(collection(db, 'matches', matchDetails?.id, 'messages'), {
        timestamp: serverTimestamp(),
        userId: user?.uid,
        username: userProfile?.username,
        photoURL: matchDetails?.users[user?.uid]?.photoURL,
        message: input,
        reply: messageReply ? messageReply : null,
        seen: false
      })
      setInput('')
      setMessageReply(null)
      updateSeen()
      await updateDoc(doc(db, 'matches', matchDetails?.id), {
        timestamp: serverTimestamp()
      })
    }
  }

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()

      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        })

        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        )

        setRecording(recording)
      } else console.log('Please grant permission to app microphone')
    } catch (error) {
      console.log('Failed to start recording: ', error)
    }
  }

  const stopRecording = async () => {
    setRecording(undefined)
    await recording.stopAndUnloadAsync()

    let updateRecordings = [...recordings]
    const { sound, status } = await recording.createNewLoadedSoundAsync()
    updateRecordings = []
    updateRecordings.push({
      sound,
      duration: getDurationFormated(status?.durationMillis),
      file: recording.getURI()
    })

    setRecordings(updateRecordings)

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = () => resolve(xhr.response)

      xhr.responseType = 'blob'
      xhr.open('GET', recording.getURI(), true)
      xhr.send(null)
    })

    const sourceRef = ref(storage, `messages/${user?.uid}/audio/${uuid()}`)

    setRecordingLoading(true)

    uploadBytes(sourceRef, blob)
      .then(snapshot => {
        getDownloadURL(snapshot?.ref)
          .then(downloadURL => {
            addDoc(collection(db, 'matches', matchDetails?.id, 'messages'), {
              userId: user?.uid,
              username: userProfile?.username,
              photoURL: matchDetails?.users[user?.uid]?.photoURL,
              voiceNote: downloadURL,
              mediaLink: snapshot?.ref?._location?.path,
              duration: getDurationFormated(status?.durationMillis),
              seen: false,
              timestamp: serverTimestamp(),
            }).finally(() => setRecordingLoading(false))
          })
      })
  }

  const getDurationFormated = millis => {
    const minutes = millis / 1000 / 60
    const minutesDisplay = Math.floor(minutes)
    const seconds = Math.round((minutes - minutesDisplay) * 60)
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
    return `${minutesDisplay}:${secondsDisplay}`
  }

  const [loaded] = useFonts({
    text: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf'),
    boldText: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Bold.ttf')
  })

  if (!loaded) return null

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: userProfile?.theme == 'dark' ? color.black : color.white
      }}
    >
      <Header
        showBack
        showTitle
        showMatchAvatar
        matchDetails={matchDetails}
        title={getMatchedUserInfo(matchDetails?.users, user?.uid)?.username}
        matchAvatar={getMatchedUserInfo(matchDetails?.users, user?.uid)?.photoURL}
        // showChatMenu
        backgroundColor={color.transparent}
      />

      <KeyboardAvoidingView style={{ flex: 1 }}>
        {
          !messages?.length ?
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  position: 'relative'
                }}
              >
                <Image
                  source={{ uri: getMatchedUserInfo(matchDetails?.users, user?.uid)?.photoURL }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 100
                  }}
                />
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderWidth: 2,
                    borderColor: userProfile?.theme == 'dark' ? color.dark : color.offWhite,
                    borderRadius: 100,
                    overflow: 'hidden',
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    shadowColor: color.black,
                    shadowOffset: {
                      width: 0,
                      height: 4,
                    },
                    shadowOpacity: 0.30,
                    shadowRadius: 4.65,
                    elevation: 8
                  }}
                >
                  <Image
                    source={{ uri: userProfile?.photoURL }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 100
                    }}
                  />
                </View>
              </View>
              <Text
                style={{
                  marginTop: 20,
                  fontFamily: 'text',
                  fontSize: 16,
                  color: userProfile?.theme == 'dark' ? color.white : color.dark
                }}
              >
                You matched with
                <Text
                  style={{
                    fontFamily: 'boldText'
                  }}
                >
                  {` ${getMatchedUserInfo(matchDetails?.users, user?.uid)?.username}`}
                </Text>
              </Text>
            </View> :
            <FlatList
              inverted={-1}
              style={{
                flex: 1,
                paddingHorizontal: 10
              }}
              data={messages}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item?.id}
              renderItem={({ item: message }) => (
                message?.userId === user?.uid ? (
                  <SenderMessage key={message?.id} messages={message} matchDetails={matchDetails} chatThemeIndex={chatThemeIndex} />
                ) : (
                  <RecieverMessage key={message?.id} messages={message} matchDetails={matchDetails} chatThemeIndex={chatThemeIndex} />
                )
              )}
            />
        }

        <View>
          {
            messageReply &&
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: 10,
                backgroundColor: userProfile?.theme == 'dark' ? color.dark : color.offWhite,
                marginTop: 10,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                overflow: 'hidden',
                padding: 5
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  backgroundColor: userProfile?.theme == 'dark' ? color.black : color.white,
                  flex: 1,
                  borderRadius: 12,
                  overflow: 'hidden',
                  padding: 5
                }}
              >
                {
                  messageReply?.mediaType == 'video' &&
                  <Image
                    source={{ uri: messageReply?.thumbnail }}
                    resizeMode='cover'
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 6
                    }}
                  />
                }
                {
                  messageReply?.mediaType == 'image' &&
                  <Image
                    source={{ uri: messageReply?.media }}
                    resizeMode='cover'
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 6
                    }}
                  />
                }
                {
                  messageReply?.voiceNote &&
                  <View
                    style={{
                      flex: 1,
                      position: 'relative',
                      height: 35,
                      borderRadius: 20,
                      overflow: 'hidden',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 2,
                      paddingLeft: 10
                    }}
                  >
                    <Slider
                      value={0}
                      minimumValue={0}
                      maximumValue={100}
                      style={{ flex: 1 }}
                      minimumTrackTintColor={userProfile?.theme == 'dark' ? color.white : color.blue}
                      maximumTrackTintColor={userProfile?.theme == 'dark' ? color.white : color.blue}
                      thumbTintColor={userProfile?.theme == 'dark' ? color.white : color.blue}
                    />
                    <TouchableOpacity
                      activeOpacity={1}
                      style={{
                        backgroundColor: userProfile?.theme == 'dark' ? color.white : color.faintBlue,
                        width: 30,
                        height: 30,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <AntDesign name='caretright' size={20} color={userProfile?.theme == 'dark' ? color.black : color.blue} />
                    </TouchableOpacity>
                  </View>
                }
                {
                  messageReply?.caption != '' &&
                  <Text
                    numberOfLines={3}
                    style={{
                      color: userProfile?.theme == 'light' ? color.dark : color.white,
                      marginLeft: messageReply?.media ? 10 : 0
                    }}
                  >
                    {messageReply?.caption}
                  </Text>
                }
                {
                  messageReply?.message &&
                  <Text
                    numberOfLines={3}
                    style={{
                      color: userProfile?.theme == 'light' ? color.dark : color.white,
                      marginLeft: messageReply?.media ? 10 : 0,
                      marginVertical: 10
                    }}
                  >
                    {messageReply?.message}
                  </Text>
                }
              </View>
              {
                messageReply &&
                <TouchableOpacity
                  onPress={() => setMessageReply(null)}
                  style={{
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12
                  }}
                >
                  <AntDesign name='close' size={24} color={userProfile?.theme == 'light' ? color.dark : color.white} />
                </TouchableOpacity>
              }
            </TouchableOpacity>
          }
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 10,
              backgroundColor: userProfile?.theme == 'dark' ? color.dark : color.offWhite,
              minHeight: 50,
              overflow: 'hidden',
              position: 'relative',
              marginHorizontal: 10,
              borderRadius: 12,
              borderTopLeftRadius: messageReply ? 0 : 12,
              borderTopRightRadius: messageReply ? 0 : 12
            }}
          >
            {
              mediaVidiblity && <>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MessageCamera', { matchDetails })}
                  style={{
                    width: 40,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <MaterialCommunityIcons name='camera-outline' color={userProfile?.theme == 'light' ? color.lightText : color.white} size={26} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    width: 40,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <MaterialCommunityIcons name='image-outline' color={userProfile?.theme == 'light' ? color.lightText : color.white} size={26} />
                </TouchableOpacity>
              </>
            }

            {
              showRecording ?
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    maxHeight: 70,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: 'text',
                      color: userProfile?.theme == 'light' ? color.lightText : color.white
                    }}
                  >
                    Recording...
                  </Text>
                </View> :
                <TextInput
                  multiline
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={sendMessage}
                  onContentSizeChange={e => setHeight(e.nativeEvent.contentSize.height)}
                  placeholder='Aa..'
                  placeholderTextColor={userProfile?.theme == 'light' ? color.lightText : color.white}
                  style={{
                    fontSize: 18,
                    flex: 1,
                    height,
                    maxHeight: 70,
                    fontFamily: 'text',
                    color: userProfile?.theme == 'light' ? color.dark : color.white
                  }}
                />
            }

            {
              showSend &&
              <TouchableOpacity
                onPress={sendMessage}
                style={{
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                <FontAwesome5
                  name='paper-plane'
                  color={userProfile?.theme == 'light' ? color.lightText : color.white}
                  size={20}
                />
              </TouchableOpacity>
            }

            <TouchableOpacity
              onLongPress={() => {
                setShowRecording(true)
                setShowSend(false)
                startRecording()
              }}
              onPressOut={() => {
                setShowRecording(false)
                setShowSend(true)
                stopRecording()
              }}
              style={{
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              {
                recordingLoading ?
                  <ActivityIndicator size='small' color={userProfile?.theme == 'light' ? color.lightText : color.white} /> :
                  <FontAwesome5
                    size={20}
                    name='microphone-alt'
                    color={userProfile?.theme == 'light' ? color.lightText : color.white}
                  />
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Message
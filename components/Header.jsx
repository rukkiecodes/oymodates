import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'

import { FontAwesome, MaterialCommunityIcons, MaterialIcons, Entypo, AntDesign, FontAwesome5, Feather } from '@expo/vector-icons'

import { useNavigation } from '@react-navigation/native'

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu'

import useAuth from '../hooks/useAuth'

import { useFonts } from 'expo-font'
import color from '../style/color'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../hooks/firebase'
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'

let file
let link = `posts/${new Date().toISOString()}`

import * as Device from 'expo-device'

import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

const Header = ({
  showAratar,
  showLogo,
  showTitle,
  title,
  showBack,
  showMatchAvatar,
  matchAvatar,
  showPhone,
  showVideo,
  showPost,
  postDetails,
  showAdd,
  showCancelPost,
  showMessageImageGallerySelect
}) => {
  const navigation = useNavigation()
  const { user, userProfile, madiaString, media, setMedia } = useAuth()
  const storage = getStorage()

  const [loading, setLoading] = useState(false)
  const [mediaType, setMediaType] = useState('image')

  const [expoPushToken, setExpoPushToken] = useState('')
  const [notification, setNotification] = useState(false)
  const notificationListener = useRef()
  const responseListener = useRef()

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token))

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  let uploadTask
  const savePost = async () => {
    if (postDetails.caption || postDetails.media) {
      setLoading(true)
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.onload = () => resolve(xhr.response)

        xhr.responseType = 'blob'
        xhr.open('GET', postDetails.media, true)
        xhr.send(null)
      })

      const mediaRef = ref(storage, `posts/${new Date().toISOString()}`)

      // uploadTask = uploadBytesResumable(mediaRef, blob)
      uploadBytes(mediaRef, blob)
        .then(snapshot => {
          getDownloadURL(snapshot.ref)
            .then(downloadURL => {
              setLoading(true)
              addDoc(collection(db, 'posts'), {
                user: {
                  id: userProfile?.id,
                  displayName: userProfile?.displayName,
                  username: userProfile?.username,
                  photoURL: userProfile?.photoURL
                },
                likesCount: 0,
                commentsCount: 0,
                media: downloadURL,
                mediaLink: snapshot.ref._location.path,
                mediaType,
                caption: postDetails.caption,
                timestamp: serverTimestamp()
              }).then(async () => await schedulePushNotification())
                .finally(() => {
                  setLoading(false)
                  cancelPost()
                })
            })
        })
    }
  }

  const cancelPost = async () => {
    postDetails = new Object()
    setMedia('')
    setLoading(false)
    navigation.goBack()
  }

  let extention = madiaString.slice(-7)

  useEffect(() => {
    if (extention.includes('jpg' || 'png' || 'gif' || 'jpeg' || 'JPEG' || 'JPG' || 'PNG' || 'GIF'))
      setMediaType('image')
    else if (extention.includes('mp4' || 'webm' || 'WEBM' || 'webM'))
      setMediaType('video')
  }, [media])

  const [loaded] = useFonts({
    logo: require('../assets/fonts/Pacifico/Pacifico-Regular.ttf'),
    text: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf')
  })

  if (!loaded) return null

  return (
    <View
      style={{
        width: '100%'
      }}
    >
      <View
        style={{
          backgroundColor: color.white,
          height: 50,
          marginTop: 40,
          paddingHorizontal: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center'
          }}
        >
          {
            showBack &&
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10
              }}
            >
              <Entypo name='chevron-left' size={24} color={color.dark} />
            </TouchableOpacity>
          }
          {
            showLogo &&
            <Text
              style={{
                fontFamily: 'logo',
                fontSize: 30,
                margin: 0,
                marginTop: -10
              }}
            >
              Oymo
            </Text>
          }
          {
            showMatchAvatar &&
            <Image
              source={{ uri: matchAvatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 50,
                marginRight: 10
              }}
            />
          }
          {
            showTitle &&
            <Text
              style={{
                fontFamily: 'text',
                fontSize: 18,
                textTransform: 'capitalize',
                color: color.dark
              }}
            >
              {title}
            </Text>
          }
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          {
            showPhone &&
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10
              }}
            >
              <Entypo name='phone' size={20} color={color.lightText} />
            </TouchableOpacity>
          }

          {
            showVideo &&
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <FontAwesome5 name='video' size={20} color={color.lightText} />
            </TouchableOpacity>
          }

          {
            showCancelPost &&
            <TouchableOpacity
              onPress={cancelPost}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: color.borderColor,
                borderWidth: 1,
                borderRadius: 4,
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginRight: 5
              }}
            >
              <Text
                style={{
                  color: color.dark,
                  fontFamily: 'text',
                  marginLeft: 10
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          }

          {
            showPost &&
            <TouchableOpacity
              onPress={savePost}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: loading == true ? color.faintRed : color.red,
                borderRadius: 4,
                paddingVertical: 10,
                paddingHorizontal: 20,
                marginLeft: 5
              }}
            >
              {
                loading ? <ActivityIndicator color={color.white} size='small' />
                  :
                  <>
                    <Feather name="corner-left-up" size={20} color={loading == true ? color.red : color.white} />
                    <Text
                      style={{
                        fontFamily: 'text',
                        marginLeft: 10,
                        color: loading == true ? color.red : color.white
                      }}
                    >
                      Post
                    </Text>
                  </>
              }
            </TouchableOpacity>
          }

          {
            showMessageImageGallerySelect &&
            <TouchableOpacity
              onPress={() => navigation.navigate('PreviewMessageImage')}
              style={{
                backgroundColor: color.blue,
                borderRadius: 12,
                width: 60,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontFamily: 'text',
                  color: color.white,
                  fontSize: 16
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          }

          {
            showAdd &&
            <Menu>
              <MenuTrigger
                customStyles={{
                  triggerWrapper: {
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 20
                  }
                }}
              >
                <FontAwesome name='plus-square-o' color={color.dark} size={26} />
              </MenuTrigger>

              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    width: 150,
                    borderRadius: 10,
                    overflow: 'hidden'
                  }
                }}
              >
                <MenuOption
                  onSelect={() => navigation.navigate('Add')}
                  customStyles={{
                    optionWrapper: {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingHorizontal: 15,
                      paddingVertical: 8
                    }
                  }}
                >
                  <Text>Post</Text>
                  <MaterialCommunityIcons name='grid' size={20} color={color.dark} />
                </MenuOption>

                <MenuOption
                  onSelect={() => navigation.navigate('AddReels')}
                  customStyles={{
                    optionWrapper: {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingHorizontal: 15,
                      paddingVertical: 8
                    }
                  }}
                >
                  <Text>Reel</Text>
                  <Image
                    source={require('../assets/video.png')}
                    style={{
                      width: 19,
                      height: 19
                    }}
                  />
                </MenuOption>
              </MenuOptions>
            </Menu>
          }

          {
            showAratar &&
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {
                user.photoURL ?
                  <Image
                    source={{ uri: userProfile?.photoURL || user.photoURL }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 50
                    }}
                  />
                  :
                  <AntDesign name='user' size={24} color={color.lightText} />
              }
            </TouchableOpacity>
          }
        </View>
      </View>
    </View>
  )
}

async function schedulePushNotification () {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New post added',
      body: 'Your post has been added successfully.\nYou can check it out now',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 1 },
  })
}

async function registerForPushNotificationsAsync () {
  let token
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
      return
    }
    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    alert('Must use physical device for Push Notifications')
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  return token
}

export default Header
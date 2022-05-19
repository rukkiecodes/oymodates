import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'

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
import { addDoc, arrayUnion, collection } from 'firebase/firestore'
import { db } from '../hooks/firebase'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'

let file
let link = `posts/${new Date().toISOString()}`


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
  const [expanded, setExpanded] = useState(false)

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

      const mediaRef = ref(storage, link)

      uploadTask = uploadBytesResumable(mediaRef, blob)

      uploadTask.on('state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log('Upload is ' + progress + '% done')

          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused')
              break
            case 'running':
              console.log('Upload is running')
              break
          }
        },
        error => console.log('error uploading image: ', error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(downloadURL => {
              file = downloadURL
              setLoading(true)
              addDoc(collection(db, 'posts'), {
                user: userProfile,
                media: arrayUnion(file),
                mediaLink: link,
                mediaType,
                caption: postDetails.caption
              }).finally(() => {
                setLoading(false)
                cancelPost()
              })
            })
        }
      )
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
    else if (extention.includes('mp4'))
      setMediaType('video')
  }, [media])

  const [loaded] = useFonts({
    logo: require('../assets/fonts/Pacifico/Pacifico-Regular.ttf'),
    text: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf')
  })

  if (!loaded)
    return null

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
              <FontAwesome5 name='chevron-left' size={20} color={color.dark} />
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
              <FontAwesome5 name='phone' color={color.lightText} size={16} />
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
              <FontAwesome5 name='video' color={color.lightText} size={16} />
            </TouchableOpacity>
          }

          {
            showCancelPost &&
            <TouchableOpacity
              onPress={cancelPost}
              style={{
                backgroundColor: `${color.blue}33`,
                borderRadius: 12,
                width: 70,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10
              }}
            >
              <Text
                style={{
                  fontFamily: 'text',
                  color: color.blue,
                  fontSize: 16
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
                backgroundColor: color.blue,
                borderRadius: 12,
                width: 60,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {
                loading ? <ActivityIndicator color={color.white} size='small' />
                  :
                  <Text
                    style={{
                      fontFamily: 'text',
                      color: color.white,
                      fontSize: 16
                    }}
                  >
                    Post
                  </Text>
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
                    width: 120,
                    borderRadius: 12,
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
                  onSelect={() => alert(`Reels`)}
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
                    <MaterialIcons name='video-collection' size={20} color={color.dark} />
                </MenuOption>
              </MenuOptions>
            </Menu>
          }

          {
            showAratar &&
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
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
                  <FontAwesome5 name='user' size={16} color={color.lightText} />
              }
            </TouchableOpacity>
          }
        </View>
      </View>
    </View>
  )
}

export default Header
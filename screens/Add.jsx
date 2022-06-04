import React, { useState, useEffect, useRef } from 'react'

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
  UIManager,
  useWindowDimensions
} from 'react-native'

import Header from '../components/Header'

import color from '../style/color'

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { EvilIcons } from '@expo/vector-icons'

import { useFonts } from 'expo-font'

import * as ImagePicker from 'expo-image-picker'
import useAuth from '../hooks/useAuth'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
)
  UIManager.setLayoutAnimationEnabledExperimental(true)

import { useNavigation } from '@react-navigation/native'

import { Video } from 'expo-av'

const Add = () => {
  const { user, media, setMedia, madiaString } = useAuth()
  const navigation = useNavigation()
  const video = useRef(null)
  const windowWidth = useWindowDimensions().width

  const [input, setInput] = useState('')
  const [height, setHeight] = useState(50)
  const [expanded, setExpanded] = useState(false)
  const [mediaVidiblity, setMediaVidiblity] = useState(true)
  const [mediaType, setMediaType] = useState('image')
  const [status, setStatus] = useState({})
  const [mute, setMute] = useState(false)

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [1, 1],
      allowsEditing: true,
      quality: 1,
    })

    if (!result.cancelled) setMedia(result.uri)
  }

  useEffect(() =>
    Keyboard.addListener('keyboardDidShow', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
      setMediaVidiblity(false)
    })
    , [])

  useEffect(() =>
    Keyboard.addListener('keyboardDidHide', () => {
      setExpanded(false)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
      setMediaVidiblity(true)
    })
    , [])

  let extention = madiaString.slice(-7)

  useEffect(() => {
    if (extention.includes('jpg' || 'png' || 'gif' || 'jpeg' || 'JPEG' || 'JPG' || 'PNG' || 'GIF'))
      setMediaType('image')
    else if (extention.includes('mp4'))
      setMediaType('video')
  }, [media])

  const [loaded] = useFonts({
    text: require('../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf')
  })

  if (!loaded)
    return null

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.white,
        position: 'relative'
      }}
    >
      <Header
        showBack
        showTitle
        showPost
        showCancelPost
        postDetails={{
          media,
          caption: input
        }}
        title='Create post'
      />

      <ScrollView>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
            setMediaVidiblity(true)
          }}
        >
          <View
            style={{
              maxHeight: 300,
              overflow: 'hidden',
              paddingHorizontal: 10
            }}
          >
            <TextInput
              multiline
              value={input}
              onChangeText={setInput}
              placeholder="What's on your mind..."
              onContentSizeChange={e => setHeight(e.nativeEvent.contentSize.height)}
              style={{
                height,
                backgroundColor: color.white,
                maxHeight: 300,
                fontSize: 18,
                paddingVertical: 10
              }}
            />
          </View>
        </TouchableWithoutFeedback>

        {
          media != '' &&
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 150
            }}
          >
            <View
              style={{
                width: '100%'
              }}
            >
              {
                mediaType == 'image' ?
                  <Image
                    source={{ uri: media }}
                    style={{
                      width: '100%',
                      height: 400
                    }}
                  /> :
                  <View
                    style={{
                      flex: 1,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      width: windowWidth,
                      position: 'relative'
                    }}
                  >
                    <Video
                      ref={video}
                      style={{
                        flex: 1,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        width: windowWidth,
                        height: 600,
                        minHeight: 300,
                      }}
                      source={{
                        uri: media,
                      }}
                      useNativeControls={false}
                      resizeMode='cover'
                      isMuted={mute}
                      usePoster={true}
                      isLooping
                      onPlaybackStatusUpdate={status => setStatus(() => status)}
                    />

                    <TouchableOpacity
                      onPress={() =>
                        status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
                      }
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                      }}
                    />

                    <TouchableOpacity
                      onPress={() => setMute(!mute)}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        margin: 30,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: `${color.dark}89`,
                        borderRadius: 50,
                        zIndex: 1,
                        width: 50,
                        height: 50
                      }}
                    >
                      <MaterialCommunityIcons name={mute ? 'volume-high' : 'volume-mute'} size={24} color={color.white} />
                    </TouchableOpacity>
                  </View>
              }
            </View>
          </View>
        }
      </ScrollView>

      <View
        style={{
          width: '100%',
          borderTopWidth: 1,
          borderTopColor: color.borderColor,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <TouchableOpacity
          onPress={pickImage}
          style={{
            width: '50%',
            height: 50,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: `${color.white}33`,
            paddingHorizontal: 10
          }}
        >
          <EvilIcons name='image' size={24} color={color.black} />
          <Text
            style={{
              color: color.dark,
              fontFamily: 'text',
              marginLeft: 10
            }}
          >
            Photo/Video
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('PostCamera')}
          style={{
            width: '50%',
            height: 50,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: `${color.white}33`,
            paddingHorizontal: 10
          }}
        >
          <EvilIcons name='camera' size={24} color={color.black} />
          <Text
            style={{
              color: color.dark,
              fontFamily: 'text',
              marginLeft: 10
            }}
          >
            Camera
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Add
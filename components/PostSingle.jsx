import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState, useLayoutEffect } from 'react'

import { View, TouchableOpacity, Dimensions, ImageBackground } from 'react-native'

import { Video } from 'expo-av'
import color from '../style/color'
import { useNavigation } from '@react-navigation/native'
import useAuth from '../hooks/useAuth'

const { width } = Dimensions.get('window')

export const PostSingle = forwardRef(({ item }, parentRef) => {
  const { userProfile } = useAuth()
  const ref = useRef(null)

  const navigation = useNavigation()

  const [videoStatus, setVideoStatus] = useState({})

  useImperativeHandle(parentRef, () => ({
    play,
    unload,
    stop
  }))

  useEffect(() =>
    navigation.addListener('blur', () => {
      ref.current.stopAsync()
      return () => unload()
    })
    , [navigation])

  useEffect(() => {
    return () => unload()
  }, [])

  useLayoutEffect(() => {
    ref.current.playAsync()
  }, [])

  const play = async () => {
    if (ref.current == null) return

    const status = await ref.current.getStatusAsync()
    if (status?.isPlaying) return

    try {
      await ref.current.playAsync()
    } catch (e) {}
  }
  const stop = async () => {
    if (ref.current == null) return

    const status = await ref.current.getStatusAsync()
    if (!status?.isPlaying) return

    try {
      await ref.current.stopAsync()
    } catch (e) { }
  }

  const unload = async () => {
    if (ref.current == null) return

    try {
      await ref.current.unloadAsync()
    } catch (e) { }
  }

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => videoStatus.isPlaying ? ref.current.pauseAsync() : ref.current.playAsync()}
      style={{
        flex: 1,
        width,
        backgroundColor: color.transparent
      }}
    >
      <Video
        ref={ref}
        style={{ flex: 1, backgroundColor: color.transparent }}
        resizeMode='contain'
        isLooping
        usePoster
        posterSource={{ uri: item?.thumbnail }}
        posterStyle={{
          resizeMode: 'contain',
          height: '100%'
        }}
        shouldPlay={false}
        source={{ uri: item?.media }}
        onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
      />
    </TouchableOpacity>
  )
})

export default PostSingle
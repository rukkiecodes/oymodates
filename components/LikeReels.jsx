import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import { AntDesign, FontAwesome } from '@expo/vector-icons'
import color from '../style/color'

import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, increment, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import useAuth from '../hooks/useAuth'
import { db } from '../hooks/firebase'
import axios from 'axios'

const LikeReels = ({ reel }) => {
  const { auth, user, userProfile } = useAuth()

  const [currentLikesState, setCurrentLikesState] = useState({ state: false, counter: reel?.likesCount })

  useEffect(() =>
    (() => {
      getLikesById(reel?.id, user?.uid)
        .then(res => {
          setCurrentLikesState({
            ...currentLikesState,
            state: res
          })
        })
    })()
    , [])

  const updateLike = () => new Promise(async (resolve, reject) => {
    if (currentLikesState.state) {
      await deleteDoc(doc(db, 'reels', reel?.id, 'likes', user?.uid))
      await updateDoc(doc(db, 'reels', reel?.id), {
        likesCount: increment(-1)
      })
      await updateDoc(doc(db, 'users', reel?.user?.id), {
        likesCount: increment(-1)
      })
    } else {
      await setDoc(doc(db, 'reels', reel?.id, 'likes', user?.uid), {
        id: userProfile?.id,
        photoURL: userProfile?.photoURL,
        displayName: userProfile?.displayName,
        username: userProfile?.username,
      })
      await updateDoc(doc(db, 'reels', reel?.id), {
        likesCount: increment(1)
      })
      await updateDoc(doc(db, 'users', reel?.user?.id), {
        likesCount: increment(1)
      })
      if (reel?.user?.id != user?.uid)
        await addDoc(collection(db, 'users', reel?.user?.id, 'notifications'), {
          action: 'reel',
          activity: 'likes',
          text: 'likes your post',
          notify: reel?.user,
          id: reel?.id,
          seen: false,
          reel,
          user: {
            id: userProfile?.id,
            username: userProfile?.username,
            displayName: userProfile?.displayName,
            photoURL: userProfile?.photoURL
          },
          timestamp: serverTimestamp()
        }).then(() => {
          axios.post(`https://app.nativenotify.com/api/indie/notification`, {
            subID: reel?.user?.id,
            appId: 3167,
            appToken,
            title: '????',
            message: `@${userProfile?.username} likes to your comment (${reel?.description?.slice(0, 100)})`
          })
        })
    }
  })

  const getLikesById = () => new Promise(async (resolve, reject) => {
    getDoc(doc(db, 'reels', reel?.id, 'likes', user?.uid))
      .then(res => resolve(res?.exists()))
  })

  const handleUpdateLikes = async () => {
    setCurrentLikesState({
      state: !currentLikesState.state,
      counter: currentLikesState.counter + (currentLikesState.state ? -1 : 1)
    })
    updateLike()
  }

  const disabled = () => {
    console.log('not logged in')
  }

  return (
    <TouchableOpacity
      onPress={() => userProfile ? handleUpdateLikes() : disabled()}
      style={{
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
      }}
    >
      <AntDesign name='heart' size={24} color={currentLikesState.state ? color.red : color.white} />
      <Text
        style={{
          color: color.white,
          fontFamily: 'text',
          marginTop: 5
        }}
      >
        {currentLikesState.counter ? currentLikesState.counter : '0'}
      </Text>
    </TouchableOpacity>
  )
}

export default LikeReels
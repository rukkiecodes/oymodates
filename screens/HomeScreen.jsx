import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Pressable
} from 'react-native'
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react'

import firebase from "../hooks/firebase"

import useAuth from "../hooks/useAuth"
import Bar from "./StatusBar"

import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import Swiper from "react-native-deck-swiper"

import home from "../style/home"

import generateId from '../lib/generateId'

import { useNavigation } from '@react-navigation/native'

import { LinearGradient } from 'expo-linear-gradient'
import color from '../style/color'

import { useFonts } from 'expo-font'

const HomeScreen = () => {
  const navigation = useNavigation()

  const swipeRef = useRef(null)

  const {
    user,
    userProfile,
    renderHome,
    setRenderHome
  } = useAuth()

  useLayoutEffect(() => {
    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then(doc => {
        if (!doc.data()?.name || !doc.data()?.avatar?.length || !doc.data()?.location || !doc.data()?.occupation || !doc.data()?.intrests?.length)
          navigation.navigate("Setup")
        else setRenderHome(true)
      })
  }, [userProfile])

  const [profils, setProfiles] = useState([])
  const [stackSize, setStackSize] = useState(2)

  useEffect(() => {
    const fetchUsers = async () => {
      const passes = await firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .collection("passes")
        .get()
        .then(snapshot => snapshot?.docs?.map(doc => doc.id))

      const swipes = await firebase.firestore()
        .collection("users")
        .doc(user.uid)
        .collection("swipes")
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.id))


      const passedUserIds = passes.length > 0 ? passes : ['test']
      const swipedUserIds = swipes.length > 0 ? swipes : ['test']

      await firebase.firestore()
        .collection("users")
        .where("id", "not-in", [...passedUserIds, ...swipedUserIds])
        .get()
        .then((snapshot) => {
          if (userProfile?.showMe)
            setProfiles(
              snapshot.docs
                .filter(doc => doc.id !== user.uid)
                .filter(doc => doc.data().gender == userProfile?.showMe)
                .map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }))
            )
          else
            setProfiles(
              snapshot.docs
                .filter(doc => doc.id !== user.uid)
                .map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }))
            )
        })
    }

    fetchUsers()
  }, [userProfile])

  const swipeLeft = async (cardIndex) => {
    setStackSize(stackSize + 1)
    if (!profils[cardIndex]) return

    const userSwiped = profils[cardIndex]
    firebase.firestore()
      .collection("users")
      .doc(user.uid)
      .collection("passes")
      .doc(userSwiped.id)
      .set(userSwiped)
  }

  const swipeRight = async (cardIndex) => {
    setStackSize(stackSize + 1)
    if (!profils[cardIndex]) return

    const userSwiped = profils[cardIndex]

    // // check if the user swiped on you...
    await firebase.firestore()
      .collection("users")
      .doc(userSwiped.id)
      .collection("swipes")
      .doc(user.uid)
      .get()
      .then(documentSnapShot => {
        if (documentSnapShot.exists) {
          // user ha matched with you before
          // create match

          firebase.firestore()
            .collection("users")
            .doc(user.uid)
            .collection("swipes")
            .doc(userSwiped.id)
            .set(userSwiped)

          // CREATE A MATCH
          firebase.firestore()
            .collection("matches")
            .doc(generateId(user.uid, userSwiped.id))
            .set({
              users: {
                [user.uid]: userProfile,
                [userSwiped.id]: userSwiped
              },
              usersMatched: [user.uid, userSwiped.id],
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })

          navigation.navigate("Match", {
            userProfile,
            userSwiped
          })
        } else {
          // User has swiped as first interaction between the two or didnt get swiped on...

          firebase.firestore()
            .collection("users")
            .doc(user.uid)
            .collection("swipes")
            .doc(userSwiped.id)
            .set(userSwiped)

          firebase.firestore()
            .collection("users")
            .doc(userSwiped.id)
            .collection("pendingSwipes")
            .doc(user.uid)
            .set(userProfile)
        }
      })
  }

  const [loaded] = useFonts({
    logo: require("../assets/fonts/Pacifico/Pacifico-Regular.ttf"),
    text: require("../assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf")
  })

  if (!loaded)
    return null

  return (
    <SafeAreaView style={home.container}>
      <Bar />
      {
        renderHome &&
        <>
          <View style={home.header}>
            <Pressable
              onPress={() => navigation.navigate("Account")}
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: color.transparent
              }}
            >
              {
                userProfile == null ?
                  <ActivityIndicator size="small" color="rgba(0,0,0,0)" />
                  : (userProfile?.avatar?.length ?
                    (
                      userProfile?.avatar &&
                      <Image style={{ width: 35, height: 35, borderRadius: 50, marginTop: -3 }} source={{ uri: userProfile?.avatar[0] }} />
                    )
                    : <SimpleLineIcons name="user" color="#000" size={22} />
                  )
              }
            </Pressable>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                marginTop: -10
              }}
            >
              <Image
                resizeMode="cover"
                style={{
                  width: 30,
                  height: 30,
                  marginTop: 10,
                  marginRight: 10
                }}
                source={require("../assets/logo.png")}
              />
              <Text
                style={{
                  fontSize: 30,
                  color: color.red,
                  fontFamily: "logo"
                }}
              >
                Oymo
              </Text>
            </View>

            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <MaterialCommunityIcons name="bell" size={26} color={color.lightText} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, marginTop: -8 }}>
            {profils.length >= 1 ? (
              <Swiper
                ref={swipeRef}
                cards={profils}
                containerStyle={{
                  backgroundColor: color.transparent,
                  marginTop: -20
                }}
                cardIndex={0}
                stackSize={stackSize}
                verticalSwipe={true}
                animateCardOpacity
                onSwipedLeft={(cardIndex) => {
                  swipeLeft(cardIndex)
                }}
                onSwipedRight={(cardIndex) => {
                  swipeRight(cardIndex)
                }}
                onSwipedBottom={(cardIndex) => {
                  swipeLeft(cardIndex)
                }}
                backgroundColor={color.transparent}
                cardHorizontalMargin={2}
                overlayLabels={{
                  left: {
                    title: "NOPE",
                    style: {
                      label: {
                        textAlign: "right",
                        color: color.red,
                        fontFamily: "text"
                      }
                    }
                  },
                  bottom: {
                    title: "NOPE",
                    style: {
                      label: {
                        textAlign: "right",
                        color: color.red,
                        fontFamily: "text"
                      }
                    }
                  },
                  right: {
                    title: "MATCH",
                    style: {
                      label: {
                        textAlign: "left",
                        color: color.green,
                        fontFamily: "text"
                      }
                    }
                  }
                }}
                renderCard={card => card ? (
                  <View key={card.id}
                    style={{
                      backgroundColor: color.white,
                      height: 698,
                      marginTop: -30,
                      width: "100%",
                      borderRadius: 10,
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <Image
                      style={{
                        flex: 1,
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                      }}
                      source={{ uri: card?.avatar[0] }}
                    />

                    <LinearGradient
                      colors={['transparent', color.dark]}
                      style={{
                        width: "100%",
                        minHeight: 60,
                        position: "absolute",
                        bottom: 0,
                        paddingHorizontal: 20,
                        paddingVertical: 10
                      }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center"
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 20,
                            color: color.white,
                            marginBottom: 10,
                            fontFamily: "text",
                            textTransform: "capitalize"
                          }}>
                          {card.username}
                        </Text>
                        {
                          card.hideAge == true ? (null) : (
                            <Text
                              style={{
                                fontSize: 20,
                                color: color.white,
                                marginBottom: 10,
                                fontFamily: "text"
                              }}>
                              {", " + card.age}
                            </Text>
                          )
                        }
                      </View>
                      <View>
                        <Text
                          style={{
                            color: color.white,
                            fontFamily: "text"
                          }}
                        >
                          {card.occupation}
                        </Text>
                      </View>
                      {
                        card.about ? (
                          <Text
                            style={{
                              fontFamily: "text",
                              color: color.white,
                              marginTop: 10,
                              marginBottom: 10
                            }}
                          >
                            {userProfile?.about}
                          </Text>
                        ) :
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              justifyContent: "flex-start",
                              alignItems: "center"
                            }}
                          >
                            {
                              card.intrests.map((pation, index) => {
                                return (
                                  <View
                                    style={{
                                      paddingHorizontal: 10,
                                      paddingVertical: 5,
                                      borderRadius: 50,
                                      marginRight: 10,
                                      marginBottom: 10,
                                      backgroundColor: color.pink
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: color.white,
                                        fontFamily: "text",
                                        fontWeight: "600",
                                        textTransform: "capitalize"
                                      }}
                                    >
                                      {pation}
                                    </Text>
                                  </View>
                                )
                              })
                            }
                          </View>
                      }

                      <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                        <TouchableOpacity
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            width: 40,
                            height: 40,
                            borderWidth: 1,
                            borderColor: color.lightGold
                          }}>
                          <MaterialCommunityIcons name="refresh" color={color.lightGold} size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => swipeRef.current.swipeLeft()}
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            width: 55,
                            height: 55,
                            borderWidth: 1,
                            borderColor: color.lightRed
                          }}>
                          <MaterialCommunityIcons name="close" color={color.lightRed} size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            width: 40,
                            height: 40,
                            borderWidth: 1,
                            borderColor: color.lightBlue
                          }}>
                          <MaterialCommunityIcons name="star" color={color.lightBlue} size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => swipeRef.current.swipeRight()}
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            width: 55,
                            height: 55,
                            borderWidth: 1,
                            borderColor: color.lightGreen
                          }}>
                          <MaterialCommunityIcons name="heart" color={color.lightGreen} size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => console.log(card)}
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 50,
                            width: 40,
                            height: 40,
                            borderWidth: 1,
                            borderColor: color.lightPurple
                          }}>
                          <MaterialCommunityIcons name="lightning-bolt" color={color.lightPurple} size={30} />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                ) : (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: color.white,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    {
                      userProfile?.avatar &&
                      <Image
                        style={{
                          width: 105,
                          height: 105,
                          borderRadius: 50
                        }}
                        width={105}
                        height={105}
                        source={{ uri: userProfile?.avatar[0] }}
                      />
                    }
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "text",
                        marginTop: 20
                      }}
                    >
                      Checking for more
                    </Text>
                  </View>
                )}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: color.white,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {
                  userProfile?.avatar &&
                  <Image
                    style={{
                      width: 105,
                      height: 105,
                      borderRadius: 50
                    }}
                    width={105}
                    height={105}
                    source={{ uri: userProfile?.avatar[0] }}
                  />
                }
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "text",
                    marginTop: 20
                  }}
                >
                  Checking for more
                </Text>
              </View>
            )}
          </View>
        </>
      }
    </SafeAreaView>
  )
}

export default HomeScreen
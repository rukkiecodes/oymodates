import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useLayoutEffect,
  useMemo
} from 'react'

import * as Google from 'expo-google-app-auth'

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut
} from 'firebase/auth'
import { auth, db } from './firebase'

import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext({})

const config = {
  iosClientId: '226795182379-0vc5joofiinjq2lr26ut1qisj4ce3v0m.apps.googleusercontent.com',
  androidClientId: '226795182379-o54lbfbngssuc4lpnf0ifqbmshbmrbr3.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  permissions: ['public_profile', 'email', 'gender', 'location']
}

export const AuthProvider = ({ children }) => {

  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [date, setDate] = useState()
  const [job, setJob] = useState('')
  const [company, setCompany] = useState('')
  const [image, setImage] = useState(null)
  const [username, setUsername] = useState('')
  const [school, setSchool] = useState('')
  const [city, setCity] = useState('')
  const [checked, setChecked] = useState('male')
  const [about, setAbout] = useState('')
  const [passions, setPassions] = useState([])

  const [media, setMedia] = useState('')
  const [likes, setLikes] = useState({})

  useEffect(() =>
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        getUserProfile(user)
      }
      else setUser(null)

      setLoadingInitial(false)
    })
    , [])

  const getUserProfile = async (user) => {
    let profile = await (await getDoc(doc(db, 'users', user.uid))).data()
    setUserProfile(profile)

    if (profile?.ageDate) setDate(profile?.ageDate)
    if (profile?.job) setJob(profile?.job)
    if (profile?.company) setCompany(profile?.company)
    if (profile?.username) setUsername(profile?.username)
    if (profile?.school) setSchool(profile?.school)
    if (profile?.city) setCity(profile?.city)
    if (profile?.gender) setChecked(profile?.gender)
    if (profile?.about) setAbout(profile?.about)
    if (profile?.passions) setPassions([...profile?.passions])
  }

  const signInWighGoogle = async () => {
    setLoading(true)

    await Google.logInAsync(config)
      .then(async loginResult => {
        if (loginResult.type === 'success') {
          //login
          const { idToken, accessToken } = loginResult
          const credential = GoogleAuthProvider.credential(idToken, accessToken)

          await signInWithCredential(auth, credential)
        }

        return Promise.reject()
      }).catch(error => setError(error))
      .finally(() => setLoading(false))
  }

  const logout = () => {
    setLoading(true)

    signOut(auth)
      .catch(error => setError(error))
      .finally(() => setLoading(false))
  }

  let madiaString = JSON.stringify(media)

  const memodValue = useMemo(() => ({
    user,
    error,
    loading,
    logout,
    signInWighGoogle,
    userProfile,
    getUserProfile,
    date,
    setDate,
    job,
    setJob,
    image,
    setImage,
    username,
    setUsername,
    school,
    setSchool,
    media,
    setMedia,
    madiaString,
    likes,
    setLikes,
    company,
    setCompany,
    city,
    setCity,
    checked,
    setChecked,
    about,
    setAbout,
    passions,
    setPassions
  }), [
    user,
    loading,
    error,
    userProfile,
    image,
    date,
    job,
    username,
    school,
    media,
    setMedia,
    madiaString,
    likes,
    setLikes,
    company,
    setCompany,
    city,
    setCity,
    checked,
    setChecked,
    about,
    setAbout,
    passions,
    setPassions
  ])

  return (
    <AuthContext.Provider
      value={memodValue}
    >
      {!loadingInitial && children}
    </AuthContext.Provider>
  )
}

// host.exp.exponent
export default function useAuth () {
  return useContext(AuthContext)
}
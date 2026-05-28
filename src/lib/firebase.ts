import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth'
import { Firestore, getFirestore, enableMultiTabIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null

function getApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null
  if (_app) return _app
  const existing = getApps()
  _app = existing.length > 0 ? existing[0] : initializeApp(firebaseConfig)
  return _app
}

export function getAuthInstance(): Auth {
  if (_auth) return _auth
  const a = getApp()
  if (!a) throw new Error('Firebase not available in server context')
  _auth = getAuth(a)
  return _auth
}

export function getDbInstance(): Firestore {
  if (_db) return _db
  const a = getApp()
  if (!a) throw new Error('Firebase not available in server context')
  _db = getFirestore(a)
  enableMultiTabIndexedDbPersistence(_db).catch(() => {})
  return _db
}

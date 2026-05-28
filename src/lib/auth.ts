import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { getAuthInstance } from './firebase'

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuthInstance(), callback)
}

export async function registerWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(getAuthInstance(), email, password)
  return result.user
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(getAuthInstance(), email, password)
  return result.user
}

export async function logout() {
  await signOut(getAuthInstance())
}

export function getCurrentUser(): User | null {
  return getAuthInstance().currentUser
}

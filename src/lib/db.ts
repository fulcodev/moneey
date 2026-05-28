import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore'
import { getDbInstance } from './firebase'
import { getCurrentUser } from './auth'

function ensureAuth() {
  const user = getCurrentUser()
  if (!user) throw new Error('User not authenticated')
  return user
}

export async function addDocument<T extends DocumentData>(collectionName: string, data: T) {
  const user = ensureAuth()
  const colRef = collection(getDbInstance(), `users/${user.uid}/${collectionName}`)
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: Timestamp.now().toDate().toISOString(),
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
  return docRef.id
}

export async function updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>) {
  const user = ensureAuth()
  const docRef = doc(getDbInstance(), `users/${user.uid}/${collectionName}`, docId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now().toDate().toISOString(),
  })
}

export async function deleteDocument(collectionName: string, docId: string) {
  const user = ensureAuth()
  const docRef = doc(getDbInstance(), `users/${user.uid}/${collectionName}`, docId)
  await deleteDoc(docRef)
}

export async function getDocument(collectionName: string, docId: string) {
  const user = ensureAuth()
  const docRef = doc(getDbInstance(), `users/${user.uid}/${collectionName}`, docId)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getDocuments(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const user = ensureAuth()
  const colRef = collection(getDbInstance(), `users/${user.uid}/${collectionName}`)
  const q = query(colRef, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

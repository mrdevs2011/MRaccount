import { auth, db } from './config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Ro'yxatdan o'tish — avtomatik MRaccount ID beriladi (Firebase UID)
export async function registerUser(email, password, fullName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;

  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    fullName: fullName || '',
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data);
}

export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

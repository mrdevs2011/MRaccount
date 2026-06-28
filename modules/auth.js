/**
 * MRaccount — auth.js
 * Asosiy ro'yxatdan o'tish / kirish / chiqish logikasi.
 * Bu modul faqat MRaccount o'zining Firebase loyihasi bilan ishlaydi.
 */

import { auth, db, state } from './config.js';
import { $, toast } from './utils.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  doc, setDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export async function registerUser(email, password, fullName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
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

onAuthStateChanged(auth, user => {
  state.me = user || null;
  // TODO: SSO oqimi shu yerga ulanadi (sso.js)
});

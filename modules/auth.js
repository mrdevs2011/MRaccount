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

// Username ichida saqlanadi, Firebase uchun fake email ishlatiladi
function toEmail(username) {
  return `${username}@mrplatform.uz`;
}

export async function registerUser(username, password, name) {
  const uname = username.toLowerCase().trim();

  if (!/^[a-z0-9_]{3,20}$/.test(uname)) {
    throw new Error('Username: 3-20 belgi, faqat harflar, raqamlar, _');
  }

  const cred = await createUserWithEmailAndPassword(auth, toEmail(uname), password);
  const uid  = cred.user.uid;

  await setDoc(doc(db, 'users', uid), {
    uid,
    username: uname,
    name:     name.trim() || uname,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function loginUser(username, password) {
  const uname = username.toLowerCase().trim();
  const cred  = await signInWithEmailAndPassword(auth, toEmail(uname), password);
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

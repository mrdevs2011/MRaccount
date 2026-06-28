/**
 * MRaccount — auth.js
 * Asosiy ro'yxatdan o'tish / kirish / chiqish logikasi.
 * Bu modul faqat MRaccount o'zining Firebase loyihasi bilan ishlaydi.
 */

import { auth, db, state } from './config.js';
import { $, toast } from './utils.js';
import { uploadAvatar, getAvatarUrl } from './avatar.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  doc, setDoc, updateDoc, getDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * Yangi foydalanuvchini ro'yxatdan o'tkazish.
 * avatarFile ixtiyoriy — yuborilsa Supabase'ga yuklanadi.
 */
export async function registerUser(email, password, fullName, avatarFile = null) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  let avatarUrl = null;

  // Profile picture yuklash (agar tanlangan bo'lsa)
  if (avatarFile) {
    try {
      avatarUrl = await uploadAvatar(uid, avatarFile);
    } catch (err) {
      // Rasm yuklanmasa ham ro'yxatdan o'tishni to'xtatmaymiz
      console.warn('[avatar] Yuklashda xato:', err.message);
    }
  }

  // Firestore'ga saqlash
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    fullName: fullName || '',
    avatarUrl,
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

/**
 * Mavjud foydalanuvchining avatarini yangilash.
 */
export async function updateAvatar(user, avatarFile) {
  const avatarUrl = await uploadAvatar(user.uid, avatarFile);
  await updateDoc(doc(db, 'users', user.uid), { avatarUrl });
  return avatarUrl;
}

/**
 * Foydalanuvchi profilini Firestore'dan olish.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

onAuthStateChanged(auth, user => {
  state.me = user || null;
});

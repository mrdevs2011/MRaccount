/**
 * MRaccount — sso.js
 *
 * SSO oqimi:
 * 1. Boshqa ilova foydalanuvchini shu manzilga yo'naltiradi:
 *    https://mraccount.vercel.app/?redirect_uri=https://otherapp.vercel.app/auth/callback&client_id=mrgram
 * 2. Foydalanuvchi MRaccount'da kiradi/ro'yxatdan o'tadi.
 * 3. MRaccount Firebase ID tokenni + avatarUrl'ni callback'ga qaytaradi:
 *    https://otherapp.vercel.app/auth/callback?token=<ID_TOKEN>&avatar=<AVATAR_URL>
 * 4. Qabul qiluvchi ilova /api orqali tokenni serverda tekshiradi.
 */

import { db } from './config.js';
import { getUserProfile } from './auth.js';
import {
  collection, query, where, getDocs,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export function getRedirectParams() {
  const params = new URLSearchParams(location.search);
  return {
    redirectUri: params.get('redirect_uri'),
    clientId: params.get('client_id'),
  };
}

/**
 * client_id va redirect_uri /console da yaratilgan ilova bilan mosligini tekshiradi.
 */
export async function validateSsoRequest(clientId, redirectUri) {
  if (!clientId || !redirectUri) return null;
  try {
    const q = query(collection(db, 'apps'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const app = snap.docs[0].data();
    if (!(app.redirectUris || []).includes(redirectUri)) return null;
    return app;
  } catch (err) {
    console.warn('[SSO] Tekshirishda xato:', err.message);
    return null;
  }
}

/**
 * Login muvaffaqiyatli bo'lgandan keyin foydalanuvchini token + avatarUrl bilan qaytaradi.
 * Boshqa ilovalar (MRgram, MRtube...) callback URL'dan avatarni olib to'g'ridan-to'g'ri ko'rsata oladi.
 */
export async function completeSsoRedirect(user, redirectUri) {
  const token = await user.getIdToken();
  const url = new URL(redirectUri);
  url.searchParams.set('token', token);

  // Avatarni ham o'tkazamiz — boshqa ilovalar uchun qulay
  try {
    const profile = await getUserProfile(user.uid);
    if (profile?.avatarUrl) {
      url.searchParams.set('avatar', profile.avatarUrl);
    }
    if (profile?.fullName) {
      url.searchParams.set('name', profile.fullName);
    }
  } catch (_) {
    // Avatar yo'q bo'lsa ham SSO ishlaydi
  }

  location.replace(url.toString());
}

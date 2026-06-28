/**
 * MRaccount — sso.js
 *
 * KELAJAKDAGI REJA (hozircha amalga oshirilmagan):
 * MRaccount boshqa MR-ilovalar (MRgram, MRtube, ...) uchun
 * yagona kirish (SSO) provider bo'lib xizmat qiladi.
 *
 * Taxminiy oqim:
 * 1. Boshqa ilova foydalanuvchini shu manzilga yo'naltiradi:
 *    https://mraccount.vercel.app/?redirect_uri=https://otherapp.vercel.app/auth/callback&client_id=mrgram
 * 2. Foydalanuvchi MRaccount'da kirim/ro'yxatdan o'tadi.
 * 3. MRaccount Firebase ID tokenni yaratadi va redirect_uri'ga qaytaradi:
 *    https://otherapp.vercel.app/auth/callback?token=<ID_TOKEN>
 * 4. Qabul qiluvchi ilova /api orqali tokenni o'zining serverida
 *    tekshiradi (api/verify-token.js ga qarang).
 *
 * Xavfsizlik eslatmalari (keyinroq qo'shiladi):
 * - redirect_uri whitelist (faqat ruxsat etilgan domenlar)
 * - client_id -> ruxsat etilgan ilovalar ro'yxati
 * - token muddati va imzosi serverda tekshiriladi
 */

import { db } from './config.js';
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
 * client_id va redirect_uri /console da yaratilgan ilova bilan mosligini
 * Firestore'dagi 'apps' kolleksiyasi orqali tekshiradi.
 * Mos kelsa — app hujjatini qaytaradi, aks holda null.
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
 * Login muvaffaqiyatli bo'lgandan keyin foydalanuvchini ID token bilan
 * so'rovchi ilovaga qaytaradi.
 */
export async function completeSsoRedirect(user, redirectUri) {
  const token = await user.getIdToken();
  const url = new URL(redirectUri);
  url.searchParams.set('token', token);
  location.replace(url.toString());
}

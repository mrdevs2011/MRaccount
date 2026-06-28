/**
 * MRaccount — avatar.js
 * Supabase Storage orqali profile picture yuklash va olish.
 * Barcha MR-ilovalar bu moduldan foydalanib avatarni ko'rsatishi mumkin.
 */

import { SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET } from './config.js';

/**
 * Rasmni Supabase Storage'ga yuklaydi.
 * @param {string} uid  - Firebase foydalanuvchi UID
 * @param {File}   file - Tanlangan rasm fayli
 * @returns {string}    - Yuklangan rasmning public URL'i
 */
export async function uploadAvatar(uid, file) {
  // Faqat rasm fayllarini qabul qilish
  if (!file.type.startsWith('image/')) {
    throw new Error('Faqat rasm fayllari qabul qilinadi (JPG, PNG, WEBP...)');
  }
  // Maksimal o'lcham: 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Rasm hajmi 5MB dan oshmasligi kerak');
  }

  // Fayl kengaytmasini aniqlash
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  // Har bir foydalanuvchi uchun bir xil nom — yangi yuklanganda eski o'rnini bosadi
  const path = `${uid}/avatar.${ext}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${path}`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'true',   // mavjud bo'lsa ustiga yozadi
      },
      body: file,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Rasmni yuklashda xato yuz berdi');
  }

  return getAvatarUrl(uid, ext);
}

/**
 * Foydalanuvchi avatarining public URL'ini qaytaradi.
 * @param {string} uid - Firebase foydalanuvchi UID
 * @param {string} ext - Fayl kengaytmasi (default: 'jpg')
 * @returns {string}   - Public URL
 */
export function getAvatarUrl(uid, ext = 'jpg') {
  // Cache busting uchun timestamp qo'shmaymiz — upsert ishlatilgani uchun
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${uid}/avatar.${ext}`;
}

/**
 * Foydalanuvchi avatarini Firestore'da saqlangan URL bo'yicha qaytaradi.
 * URL yo'q bo'lsa — null qaytaradi (UI fallback ko'rsatadi).
 * @param {string|null} avatarUrl
 * @returns {string|null}
 */
export function resolveAvatar(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  return avatarUrl;
}

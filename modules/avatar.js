import { SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET } from './config.js';

export async function uploadAvatar(uid, file) {
  if (!file.type.startsWith('image/')) throw new Error('Faqat rasm fayllari');
  if (file.size > 5 * 1024 * 1024) throw new Error('Rasm 5MB dan oshmasin');

  const ext  = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `${uid}/avatar.${ext}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${path}`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: file,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Rasm yuklanmadi');
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${path}`;
}

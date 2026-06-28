/**
 * MRaccount — api/verify-token.js
 *
 * Boshqa MR-ilovalar (MRgram, MRtube...) bu endpointga foydalanuvchi
 * token'ini yuborib, u haqiqiy MRaccount foydalanuvchisi ekanini
 * tekshirishlari mumkin (kelajakda).
 *
 * Hozircha skelet — Firebase Admin SDK orqali to'liq implementatsiya
 * keyinroq qo'shiladi (xizmat hisobi kaliti kerak bo'ladi).
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { token } = req.body || {};
  if (!token) {
    res.status(400).json({ error: 'Token kerak' });
    return;
  }

  // TODO: firebase-admin bilan tokenni tekshirish
  // const decoded = await admin.auth().verifyIdToken(token);
  // res.status(200).json({ valid: true, uid: decoded.uid });

  res.status(501).json({ error: 'Hali implementatsiya qilinmagan' });
}

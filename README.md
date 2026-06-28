# MRaccount

MR-ilovalar (MRgram, MRtube, ...) uchun **mustaqil**, yagona akkaunt/SSO provider.

⚠️ Bu loyiha MRgram/MRtube kodiga yoki Firebase loyihasiga **hech qanday bog'liq emas**.

## Yangilik: Profile Picture qo'llab-quvvatlash

Foydalanuvchilar MRaccount'da ro'yxatdan o'tishda yoki keyinchalik profil avatarini yuklashlari mumkin. Avatar **Supabase Storage**'da saqlanadi va barcha MR-ilovalarga SSO orqali uzatiladi.

### Supabase konfiguratsiyasi

`modules/config.js` da:
```js
export const SUPABASE_URL    = 'https://olclnloqpxannznqtmvr.supabase.co';
export const SUPABASE_KEY    = 'sb_publishable_S5hxl5otPP1m5PRQS8hedw_9AE1lcwG';
export const SUPABASE_BUCKET = 'avatars';
```

### Supabase Storage sozlamasi

Supabase Dashboard → Storage da **`avatars`** nomli bucket yarating:
- **Public bucket** qilib belgilang (barcha ilovalar rasmni ko'ra olsin)
- RLS Policy: `INSERT` va `UPDATE` faqat autentifikatsiyadan o'tgan foydalanuvchilarga

### Avatar qanday ishlaydi?

1. **Ro'yxatdan o'tishda**: Foydalanuvchi ixtiyoriy ravishda rasm tanlaydi → `registerUser()` avatar faylni `uploadAvatar(uid, file)` orqali Supabase'ga yuklaydi → URL Firestore'dagi `users/{uid}.avatarUrl` maydoniga saqlanadi.

2. **SSO redirect'da**: `completeSsoRedirect()` Firestore'dan `avatarUrl`ni olib, callback URL'ga qo'shadi:
   ```
   https://yourapp.vercel.app/callback?token=...&avatar=<URL>&name=<ISM>
   ```

3. **Boshqa ilovalarda (MRgram, MRtube)**: Callback'dan `avatar` parametrini olib to'g'ridan-to'g'ri `<img>` da ko'rsating. Maxsus API kerak emas.

4. **Console'da**: Header'da kirgan foydalanuvchining avatari ko'rsatiladi. Avatar rasmiga bosib yangi rasm yuklash mumkin.

### Boshqa ilovalarda avatarni ko'rsatish namunasi

```js
// SSO callback sahifasida
const params = new URLSearchParams(location.search);
const token  = params.get('token');
const avatar = params.get('avatar');
const name   = params.get('name');

if (avatar) {
  document.getElementById('userAvatar').src = avatar;
}
```

## Fayl strukturasi

```
MRaccount/
├── index.html              # Login/register + avatar yuklash
├── modules/
│   ├── config.js           # Firebase + Supabase konfiguratsiyasi
│   ├── auth.js             # register/login/logout + updateAvatar
│   ├── avatar.js           # Supabase Storage yuklash/olish (YANGI)
│   ├── sso.js              # SSO oqimi (avatarUrl ham o'tkazadi)
│   ├── utils.js            # $, esc, toast
│   └── script.js           # UI <-> auth bog'lovchi
├── CSS/
│   └── style.css           # Avatar upload stillari ham bor
├── api/
│   └── verify-token.js     # Token tekshirish (serverda)
├── console/
│   ├── index.html          # Console UI + avatar (header'da)
│   ├── modules/
│   │   └── console.js      # Ilovalar CRUD + avatar yangilash
│   └── CSS/
│       └── console.css
├── package.json
└── vercel.json
```

## Deploy

1. Supabase'da `avatars` bucket yarating (public).
2. Firebase Authentication → Email/Password yoqing.
3. Firestore Database yarating, rules qo'ying.
4. Vercel'da deploy qiling → `mraccount.vercel.app`.
5. Firebase Console → Authorized domains → `mraccount.vercel.app` qo'shing.

## Keyingi qadamlar (TODO)

- [ ] Firestore Security Rules yozish
- [ ] `api/verify-token.js` da `firebase-admin` bilan token tekshirish
- [ ] Supabase RLS: faqat egasi o'z avatarini yuklaya olsin (UID bo'yicha)
- [ ] Rasm o'lchamini client tomondan resize qilish (katta fayllar uchun)

# MRaccount

MR-ilovalar (MRgram, MRtube, ...) uchun **mustaqil**, yagona akkaunt/SSO provider.

⚠️ Bu loyiha MRgram/MRtube kodiga yoki Firebase loyihasiga **hech qanday bog'liq emas**.
O'zining alohida Firebase loyihasi va Vercel deploy'i bo'ladi: `mraccount.vercel.app`.

## Fayl strukturasi

```
MRaccount/
├── index.html              # Login/register sahifasi
├── modules/
│   ├── config.js           # Firebase config (TODO: o'z key'laringizni qo'ying)
│   ├── auth.js             # register/login/logout
│   ├── sso.js              # Kelajakdagi SSO oqimi (hozircha skelet)
│   ├── utils.js            # $ , esc, toast yordamchilari
│   └── script.js           # UI <-> auth bog'lovchi
├── CSS/
│   └── style.css
├── api/
│   └── verify-token.js     # Boshqa ilovalar token tekshirishi uchun (hozircha 501)
├── package.json
└── vercel.json
```

## Console (/console)

Dasturchilar `mraccount.vercel.app/console` orqali:
1. MRaccount akkaunti bilan kirishadi (yoki ro'yxatdan o'tishadi).
2. Ilova nomi va `redirect_uri`(lar)ni kiritib, yangi "ilova" yaratishadi.
3. Tizim avtomatik `clientId` va `apiKey` generatsiya qilib beradi.
4. Shu `clientId` va `redirect_uri`ni o'z ilovasidagi "MRaccount bilan kirish"
   tugmasiga ulashadi:
   ```
   https://mraccount.vercel.app/?client_id=<clientId>&redirect_uri=<redirect_uri>
   ```
5. Foydalanuvchi shu tugmani bossa → MRaccount'ga tushadi → kiradi/ro'yxatdan
   o'tadi → MRaccount avtomatik `redirect_uri?token=<ID_TOKEN>` ga qaytaradi.

Bu oqim `modules/sso.js` (`validateSsoRequest`, `completeSsoRedirect`) va
`console/modules/console.js` (ilovalarni Firestore'dagi `apps` kolleksiyasida
saqlash) orqali ishlaydi — **hozir ishlaydigan holatda**, lekin productionga
chiqarishdan oldin pastdagi xavfsizlik eslatmalarini ko'rib chiqing.

### ⚠️ Xavfsizlik eslatmalari (muhim — hozirgi holat faqat skelet/demo darajasida)

- `apps` kolleksiyasi hozircha **client tomondan to'g'ridan-to'g'ri** o'qiladi
  (login sahifasi `client_id` bo'yicha so'rov yuboradi). Firestore rules buni
  o'qishga ruxsat bersa, `apiKey` maydoni ham birga qaytadi va texnik jihatdan
  ko'rinadigan bo'ladi. Productionda buni **serverless function** (`api/`)
  orqali qilish kerak — shunda `apiKey` hech qachon brauzerga chiqmaydi.
- `apiKey` hozircha hech qayerda haqiqiy autentifikatsiya uchun
  ishlatilmaydi — u shunchaki generatsiya qilinib ko'rsatiladi. Real loyihada
  bu key serverda (`api/verify-token.js` ichida) talab qilinishi va
  tekshirilishi kerak.
- Firestore Security Rules hali yozilmagan (default — hammaga yopiq bo'lishi
  mumkin). Kamida quyidagilar kerak bo'ladi:
  - `users/{uid}` — faqat egasi o'qiy/yoza oladi
  - `apps` — yaratish/o'chirish faqat `ownerUid == request.auth.uid` bo'lsa;
    o'qish (SSO tekshiruvi uchun) ehtiyotkorlik bilan sozlanishi kerak
    (yuqoridagi eslatmaga qarang).

## Keyingi qadamlar (TODO)

1. ✅ Firebase config qo'shildi (`mrplatform-9cdc0` loyihasi).
2. Firebase Console'da shu loyiha uchun **Authentication → Sign-in method →
   Email/Password**ni yoqing (agar yoqilmagan bo'lsa).
3. **Firestore Database** yarating (agar yo'q bo'lsa) va kerakli rules qo'ying.
4. Vercel'da yangi loyiha yarating va shu papkani deploy qiling →
   domen: `mraccount.vercel.app`.
5. Deploy qilingandan keyin Firebase Console → Authentication →
   **Settings → Authorized domains** ga `mraccount.vercel.app`ni qo'shing
   (aks holda login xato beradi).
6. SSO oqimini `modules/sso.js` va `api/verify-token.js` ichida to'liq yozish:
   - `redirect_uri` / `client_id` whitelist
   - Login muvaffaqiyatli bo'lganda token bilan boshqa ilovaga qaytarish
   - `firebase-admin` orqali serverda tokenni tasdiqlash
7. MRgram/MRtube tomonida "MRaccount bilan kirish" tugmasini qo'shish
   (foydalanuvchini `mraccount.vercel.app?redirect_uri=...&client_id=...` ga yo'naltirish).

Hozircha bu — **bo'sh skelet**: login/register ishlaydi, lekin SSO ulanishi
va boshqa ilovalar bilan integratsiya hali yo'q.

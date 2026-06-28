/**
 * MRaccount SDK  —  v1.0
 * Boshqa ilovalaringizda popup orqali MRaccount login qo'shish uchun.
 *
 * Ishlatish:
 *   import MRaccount from './mraccount-sdk.js';
 *
 *   MRaccount.login().then(user => {
 *     console.log(user.name, user.username, user.uid);
 *   });
 */

const MRACCOUNT_URL = 'https://mrplatform-9cdc0.web.app'; // deploy qilgandan keyin o'zgartiring

const MRaccount = {
  /**
   * MRaccount popup ochib, foydalanuvchi login bo'lishini kutadi.
   *
   * @returns {Promise<{ uid, name, username }>}  foydalanuvchi ma'lumotlari
   */
  login() {
    return new Promise((resolve, reject) => {
      // Eski popupni yopish
      if (this._popup && !this._popup.closed) {
        this._popup.focus();
        return;
      }

      // Popup o'lchami va pozitsiyasi
      const w = 440, h = 600;
      const left = Math.round(window.screenX + (window.outerWidth  - w) / 2);
      const top  = Math.round(window.screenY + (window.outerHeight - h) / 2);

      this._popup = window.open(
        MRACCOUNT_URL,
        'mraccount_login',
        `width=${w},height=${h},left=${left},top=${top},` +
        `toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
      );

      if (!this._popup) {
        reject(new Error('Popup bloklandi. Brauzer sozlamalarida ruxsat bering.'));
        return;
      }

      // Foydalanuvchi popupni qo'lda yopsa
      const closedTimer = setInterval(() => {
        if (this._popup?.closed) {
          clearInterval(closedTimer);
          window.removeEventListener('message', handler);
          reject(new Error('Kirish bekor qilindi.'));
        }
      }, 500);

      // MRaccountdan xabar kelishi
      const handler = (event) => {
        // Xavfsizlik: faqat MRaccount domenidan kelgan xabarlar
        if (event.origin !== new URL(MRACCOUNT_URL).origin) return;

        const { type, uid, name, username } = event.data || {};
        if (type !== 'MRACCOUNT_LOGIN') return;

        // Tozalash
        clearInterval(closedTimer);
        window.removeEventListener('message', handler);

        if (!uid) {
          reject(new Error('Foydalanuvchi ma\'lumotlari topilmadi.'));
          return;
        }

        resolve({ uid, name, username });
      };

      window.addEventListener('message', handler);
    });
  },

  /**
   * Hozirgi sessiyani localStorage dan o'chiradi.
   * (ixtiyoriy — faqat o'zingiz saqlamoqchi bo'lsangiz)
   */
  logout() {
    localStorage.removeItem('mra_user');
  },

  /**
   * Saqlangan sessiyani qaytaradi yoki null.
   */
  getSession() {
    try {
      return JSON.parse(localStorage.getItem('mra_user')) || null;
    } catch {
      return null;
    }
  },

  /**
   * Foydalanuvchini localStorage ga saqlaydi.
   */
  saveSession(user) {
    localStorage.setItem('mra_user', JSON.stringify(user));
  },
};

export default MRaccount;

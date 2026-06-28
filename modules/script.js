import { registerUser, loginUser } from './auth.js';
import { $, toast } from './utils.js';
import { getRedirectParams, validateSsoRequest, completeSsoRedirect } from './sso.js';

const { clientId, redirectUri } = getRedirectParams();
let ssoApp = null;

if (clientId && redirectUri) {
  validateSsoRequest(clientId, redirectUri).then(app => {
    ssoApp = app;
    const statusEl = $('authStatus');
    if (app) {
      statusEl.textContent = `"${app.name}" ilovasiga kirish uchun MRaccount orqali tasdiqlang`;
    } else {
      statusEl.textContent = "Diqqat: bu ilova ro'yxatdan o'tmagan yoki redirect_uri mos kelmadi";
      statusEl.style.color = '#f85149';
    }
  });
}

const tabLogin = $('tabLogin');
const tabRegister = $('tabRegister');
const loginForm = $('loginForm');
const registerForm = $('registerForm');

tabLogin.onclick = () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
};

tabRegister.onclick = () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
};

loginForm.onsubmit = async e => {
  e.preventDefault();
  try {
    const user = await loginUser($('loginEmail').value.trim(), $('loginPassword').value);
    if (ssoApp) {
      toast('Kirildi ✓, qaytarilmoqda...', 'success');
      await completeSsoRedirect(user, redirectUri);
    } else {
      toast('Kirildi ✓', 'success');
    }
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  }
};

registerForm.onsubmit = async e => {
  e.preventDefault();
  try {
    const user = await registerUser(
      $('regEmail').value.trim(),
      $('regPassword').value,
      $('regName').value.trim()
    );
    if (ssoApp) {
      toast("Ro'yxatdan o'tildi ✓, qaytarilmoqda...", 'success');
      await completeSsoRedirect(user, redirectUri);
    } else {
      toast("Ro'yxatdan o'tildi ✓", 'success');
    }
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  }
};

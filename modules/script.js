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

const tabLogin    = $('tabLogin');
const tabRegister = $('tabRegister');
const loginForm   = $('loginForm');
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

// Avatar preview
const avatarInput = $('regAvatar');
const avatarPreview = $('avatarPreview');
const avatarPlaceholder = $('avatarPlaceholder');

avatarInput?.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  avatarPreview.src = url;
  avatarPreview.style.display = 'block';
  avatarPlaceholder.style.display = 'none';
});

loginForm.onsubmit = async e => {
  e.preventDefault();
  const btn = loginForm.querySelector('.auth-btn');
  btn.disabled = true;
  btn.textContent = 'Kirilmoqda...';
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
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirish';
  }
};

registerForm.onsubmit = async e => {
  e.preventDefault();
  const btn = registerForm.querySelector('.auth-btn');
  btn.disabled = true;
  btn.textContent = "Ro'yxatdan o'tilmoqda...";
  try {
    const avatarFile = avatarInput?.files[0] || null;
    const user = await registerUser(
      $('regEmail').value.trim(),
      $('regPassword').value,
      $('regName').value.trim(),
      avatarFile
    );
    if (ssoApp) {
      toast("Ro'yxatdan o'tildi ✓, qaytarilmoqda...", 'success');
      await completeSsoRedirect(user, redirectUri);
    } else {
      toast("Ro'yxatdan o'tildi ✓", 'success');
    }
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = "Ro'yxatdan o'tish";
  }
};

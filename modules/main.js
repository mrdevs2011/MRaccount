import { registerUser, loginUser, logoutUser, getProfile, updateProfile, onAuth } from './auth.js';
import { $, toast, copyToClipboard } from './utils.js';

const pageAuth    = $('pageAuth');
const pageProfile = $('pageProfile');

// ── Sahifalar almashinuvi ────────────────────────────────────────
function showAuth()    { pageAuth.style.display = 'flex';    pageProfile.style.display = 'none'; }
function showProfile() { pageAuth.style.display = 'none';    pageProfile.style.display = 'flex'; }

// ── Tablar ──────────────────────────────────────────────────────
$('tabLogin').onclick = () => {
  $('tabLogin').classList.add('active');
  $('tabRegister').classList.remove('active');
  $('loginForm').style.display = 'flex';
  $('registerForm').style.display = 'none';
  $('authStatus').textContent = '';
};
$('tabRegister').onclick = () => {
  $('tabRegister').classList.add('active');
  $('tabLogin').classList.remove('active');
  $('registerForm').style.display = 'flex';
  $('loginForm').style.display = 'none';
  $('authStatus').textContent = '';
};

// ── Kirish ──────────────────────────────────────────────────────
$('loginForm').onsubmit = async e => {
  e.preventDefault();
  const btn = $('loginBtn');
  btn.disabled = true; btn.textContent = 'Kirilmoqda...';
  try {
    await loginUser($('loginEmail').value.trim(), $('loginPassword').value);
  } catch (err) {
    showError(errMsg(err));
  } finally {
    btn.disabled = false; btn.textContent = 'Kirish';
  }
};

// ── Ro'yxatdan o'tish ───────────────────────────────────────────
$('registerForm').onsubmit = async e => {
  e.preventDefault();
  const btn = $('registerBtn');
  btn.disabled = true; btn.textContent = "Ro'yxatdan o'tilmoqda...";
  try {
    await registerUser(
      $('regEmail').value.trim(),
      $('regPassword').value,
      $('regName').value.trim(),
    );
  } catch (err) {
    showError(errMsg(err));
  } finally {
    btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish";
  }
};

// ── Profil sahifasini to'ldirish ────────────────────────────────
async function fillProfile(user) {
  $('profileId').textContent    = user.uid;
  $('profileEmail').textContent = user.email || '';

  try {
    const profile = await getProfile(user.uid);
    const name = profile?.fullName || user.email?.split('@')[0] || '';
    $('profileName').textContent = name;
    $('editName').value = name;

    // Faqat initsial ko'rsatiladi (rasm yo'q)
    $('profileFallback').textContent = (name || user.email || '?')[0].toUpperCase();
    $('profileFallback').style.display = 'flex';
  } catch (_) {
    $('profileFallback').textContent = (user.email || '?')[0].toUpperCase();
    $('profileFallback').style.display = 'flex';
  }
}

// ── Auth holati ─────────────────────────────────────────────────
onAuth(async user => {
  if (user) {
    await fillProfile(user);
    showProfile();
  } else {
    showAuth();
  }
});

// ── ID nusxalash ────────────────────────────────────────────────
$('copyIdBtn').onclick = () => {
  const id = $('profileId').textContent;
  copyToClipboard(id);
  const btn = $('copyIdBtn');
  btn.innerHTML = '✓';
  btn.style.color = '#3fb950';
  setTimeout(() => {
    btn.style.color = '';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  }, 2000);
};

// ── Ism saqlash ─────────────────────────────────────────────────
$('saveNameBtn').onclick = async () => {
  const name = $('editName').value.trim();
  const { auth } = await import('./config.js');
  const user = auth.currentUser;
  if (!user) return;
  try {
    $('saveNameBtn').disabled = true; $('saveNameBtn').textContent = '...';
    await updateProfile(user.uid, { fullName: name });
    $('profileName').textContent = name || user.email;
    $('profileFallback').textContent = (name || user.email || '?')[0].toUpperCase();
    toast('Saqlandi ✓', 'success');
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  } finally {
    $('saveNameBtn').disabled = false; $('saveNameBtn').textContent = 'Saqlash';
  }
};

// ── Chiqish ─────────────────────────────────────────────────────
$('logoutBtn').onclick = async () => {
  await logoutUser();
};

// ── Xato xabarlari ──────────────────────────────────────────────
function showError(msg) {
  const el = $('authStatus');
  el.textContent = msg;
  el.className = 'status error';
}

function errMsg(err) {
  const map = {
    'auth/invalid-credential':       'Email yoki parol noto\'g\'ri',
    'auth/email-already-in-use':     'Bu email allaqachon ro\'yxatdan o\'tgan',
    'auth/weak-password':            'Parol kamida 6 ta belgi bo\'lishi kerak',
    'auth/invalid-email':            'Email formati noto\'g\'ri',
    'auth/user-not-found':           'Foydalanuvchi topilmadi',
    'auth/too-many-requests':        'Ko\'p urinish. Biroz kutib turing',
    'auth/network-request-failed':   'Internet aloqasi yo\'q',
  };
  const code = err.code || '';
  return map[code] || err.message;
}

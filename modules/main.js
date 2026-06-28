import { registerUser, loginUser, logoutUser, getProfile, updateProfile, onAuth } from './auth.js';
import { $, toast, copyToClipboard } from './utils.js';

const pageAuth    = $('pageAuth');
const pageProfile = $('pageProfile');

function showAuth()    { pageAuth.style.display = 'flex'; pageProfile.style.display = 'none'; }
function showProfile() { pageAuth.style.display = 'none'; pageProfile.style.display = 'flex'; }

// ── Tablar ───────────────────────────────────────────────────────
$('tabLogin').onclick = () => {
  $('tabLogin').classList.add('active');
  $('tabRegister').classList.remove('active');
  $('loginForm').style.display    = 'flex';
  $('registerForm').style.display = 'none';
  $('authStatus').textContent = '';
};
$('tabRegister').onclick = () => {
  $('tabRegister').classList.add('active');
  $('tabLogin').classList.remove('active');
  $('registerForm').style.display = 'flex';
  $('loginForm').style.display    = 'none';
  $('authStatus').textContent = '';
};

// ── Kirish ───────────────────────────────────────────────────────
$('loginForm').onsubmit = async e => {
  e.preventDefault();
  const btn = $('loginBtn');
  btn.disabled = true; btn.textContent = 'Kirilmoqda...';
  try {
    await loginUser($('loginUsername').value.trim(), $('loginPassword').value);
  } catch (err) {
    showError(errMsg(err));
  } finally {
    btn.disabled = false; btn.textContent = 'Kirish';
  }
};

// ── Ro'yxatdan o'tish ────────────────────────────────────────────
$('registerForm').onsubmit = async e => {
  e.preventDefault();
  const btn = $('registerBtn');
  btn.disabled = true; btn.textContent = "Ro'yxatdan o'tilmoqda...";
  try {
    await registerUser(
      $('regUsername').value.trim(),
      $('regPassword').value,
      $('regName').value.trim(),
    );
  } catch (err) {
    showError(errMsg(err));
  } finally {
    btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish";
  }
};

// ── Profilni to'ldirish ──────────────────────────────────────────
async function fillProfile(user) {
  try {
    const p = await getProfile(user.uid);
    const name = p?.name || '';

    $('profileName').textContent     = name;
    $('profileUsername').textContent = '@' + (p?.username || '');
    $('profileId').textContent       = user.uid;
    $('profileFallback').textContent = (name || '?')[0].toUpperCase();
    $('editName').value              = name;
  } catch (_) {
    $('profileId').textContent       = user.uid;
    $('profileFallback').textContent = '?';
  }
}

// ── Auth holati ──────────────────────────────────────────────────
onAuth(async user => {
  if (user) { await fillProfile(user); showProfile(); }
  else       { showAuth(); }
});

// ── ID nusxalash ─────────────────────────────────────────────────
$('copyIdBtn').onclick = () => {
  copyToClipboard($('profileId').textContent);
  const btn = $('copyIdBtn');
  const orig = btn.innerHTML;
  btn.textContent = '✓ Nusxalandi!';
  btn.classList.add('copied');
  setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
};

// ── Ism saqlash ──────────────────────────────────────────────────
$('saveNameBtn').onclick = async () => {
  const name = $('editName').value.trim();
  const { auth } = await import('./config.js');
  const user = auth.currentUser;
  if (!user) return;
  try {
    $('saveNameBtn').disabled = true; $('saveNameBtn').textContent = '...';
    await updateProfile(user.uid, { name });
    $('profileName').textContent     = name;
    $('profileFallback').textContent = (name || '?')[0].toUpperCase();
    toast('Saqlandi ✓', 'success');
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  } finally {
    $('saveNameBtn').disabled = false; $('saveNameBtn').textContent = 'Saqlash';
  }
};

// ── Chiqish ──────────────────────────────────────────────────────
$('logoutBtn').onclick = async () => { await logoutUser(); };

// ── Xato xabarlari ───────────────────────────────────────────────
function showError(msg) {
  const el = $('authStatus');
  el.textContent = msg;
  el.className = 'status error';
}

function errMsg(err) {
  const map = {
    'auth/invalid-credential':     "Username yoki parol noto'g'ri",
    'auth/email-already-in-use':   'Bu username band, boshqasini tanlang',
    'auth/weak-password':          "Parol kamida 6 ta belgi bo'lishi kerak",
    'auth/too-many-requests':      "Ko'p urinish. Biroz kutib turing",
    'auth/network-request-failed': "Internet aloqasi yo'q",
  };
  return map[err.code] || err.message;
}

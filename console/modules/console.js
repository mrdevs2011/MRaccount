/**
 * MRaccount — console/modules/console.js
 *
 * Dasturchilar konsoli: foydalanuvchi MRaccount orqali kiradi,
 * o'z ilovasini ro'yxatdan o'tkazadi (nom + redirect URI'lar),
 * tizim avtomatik clientId va apiKey generatsiya qiladi.
 *
 * Bu clientId/apiKey keyinchalik boshqa ilovada
 * "MRaccount bilan kirish" tugmasini sozlash uchun ishlatiladi:
 *   https://mraccount.vercel.app/?client_id=<clientId>&redirect_uri=<redirect_uri>
 */

import { auth, db } from '../../modules/config.js';
import { loginUser, registerUser, logoutUser } from '../../modules/auth.js';
import { $, esc, toast } from '../../modules/utils.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  collection, query, where, addDoc, deleteDoc, doc,
  getDocs, serverTimestamp, orderBy,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/* ── ID / key generatorlar ────────────────────────────────────────────── */
function randomId(len = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

function slugify(name) {
  return (name || 'app')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'app';
}

function genClientId(name) {
  return `${slugify(name)}-${randomId(6)}`;
}

function genApiKey() {
  return `mra_${randomId(32)}`;
}

/* ── Auth gate ────────────────────────────────────────────────────────── */
const authGate   = $('consoleAuthGate');
const dashboard  = $('consoleDashboard');
const loginForm  = $('consoleLoginForm');
const registerForm = $('consoleRegisterForm');
const tabLogin   = $('consoleTabLogin');
const tabRegister = $('consoleTabRegister');

tabLogin?.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
});

tabRegister?.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
});

loginForm?.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await loginUser($('cLoginEmail').value.trim(), $('cLoginPassword').value);
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  }
});

registerForm?.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await registerUser(
      $('cRegEmail').value.trim(),
      $('cRegPassword').value,
      $('cRegName').value.trim()
    );
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  }
});

$('consoleLogoutBtn')?.addEventListener('click', async () => {
  await logoutUser();
});

onAuthStateChanged(auth, user => {
  if (user) {
    authGate.style.display = 'none';
    dashboard.style.display = 'block';
    $('consoleUserEmail').textContent = user.email || '';
    loadApps(user.uid);
  } else {
    authGate.style.display = 'flex';
    dashboard.style.display = 'none';
  }
});

/* ── Apps CRUD ────────────────────────────────────────────────────────── */
async function loadApps(uid) {
  const listEl = $('appsList');
  listEl.innerHTML = '<div class="console-empty">Yuklanmoqda...</div>';
  try {
    const q = query(collection(db, 'apps'), where('ownerUid', '==', uid), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      listEl.innerHTML = '<div class="console-empty">Hali ilova qo\'shilmagan. Yuqoridagi forma orqali birinchi ilovangizni yarating.</div>';
      return;
    }
    listEl.innerHTML = snap.docs.map(d => renderAppCard(d.id, d.data())).join('');
    wireAppCardButtons();
  } catch (err) {
    listEl.innerHTML = `<div class="console-empty">Xato: ${esc(err.message)}</div>`;
  }
}

function renderAppCard(id, app) {
  const redirectUris = (app.redirectUris || []).map(u => `<code>${esc(u)}</code>`).join('<br>');
  const loginUrl = `https://mraccount.vercel.app/?client_id=${encodeURIComponent(app.clientId)}&redirect_uri=${encodeURIComponent((app.redirectUris || [])[0] || '')}`;
  return `
    <div class="app-card" data-id="${id}">
      <div class="app-card-head">
        <div class="app-name">${esc(app.name)}</div>
        <button class="app-delete-btn" data-id="${id}" title="O'chirish">✕</button>
      </div>
      <div class="app-field">
        <span class="app-field-label">Client ID</span>
        <code class="app-field-val">${esc(app.clientId)}</code>
      </div>
      <div class="app-field">
        <span class="app-field-label">API Key</span>
        <code class="app-field-val">${esc(app.apiKey)}</code>
      </div>
      <div class="app-field">
        <span class="app-field-label">Redirect URI(lar)</span>
        <div class="app-field-val">${redirectUris || '<em>yo\'q</em>'}</div>
      </div>
      <div class="app-field">
        <span class="app-field-label">Login URL namunasi</span>
        <code class="app-field-val app-field-url">${esc(loginUrl)}</code>
      </div>
    </div>`;
}

function wireAppCardButtons() {
  document.querySelectorAll('.app-delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("Ilovani o'chirishni tasdiqlaysizmi?")) return;
      try {
        await deleteDoc(doc(db, 'apps', btn.dataset.id));
        toast("Ilova o'chirildi", 'success');
        loadApps(auth.currentUser.uid);
      } catch (err) {
        toast('Xato: ' + err.message, 'error');
      }
    };
  });
}

const newAppForm = $('newAppForm');
newAppForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('newAppName').value.trim();
  const redirectRaw = $('newAppRedirects').value.trim();
  if (!name) { toast('Ilova nomini kiriting', 'error'); return; }
  if (!redirectRaw) { toast('Kamida bitta redirect URI kiriting', 'error'); return; }

  const redirectUris = redirectRaw.split('\n').map(s => s.trim()).filter(Boolean);

  try {
    await addDoc(collection(db, 'apps'), {
      ownerUid: auth.currentUser.uid,
      name,
      clientId: genClientId(name),
      apiKey: genApiKey(),
      redirectUris,
      createdAt: serverTimestamp(),
    });
    newAppForm.reset();
    toast('Ilova yaratildi ✓', 'success');
    loadApps(auth.currentUser.uid);
  } catch (err) {
    toast('Xato: ' + err.message, 'error');
  }
});

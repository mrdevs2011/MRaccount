/**
 * MRaccount — config.js
 * Bu MRaccount o'zining MUSTAQIL Firebase loyihasi (mrplatform-9cdc0).
 * MRgram/MRtube bilan HECH QANDAY bog'liqligi yo'q.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyB9hkwSuetnh_RX4iTfYkT4M1aYc4OC_c8",
  authDomain: "mrplatform-9cdc0.firebaseapp.com",
  projectId: "mrplatform-9cdc0",
  storageBucket: "mrplatform-9cdc0.firebasestorage.app",
  messagingSenderId: "565072671024",
  appId: "1:565072671024:web:0d9763fb28efce02c858f5",
  measurementId: "G-7ZVQDS7Q14",
};

const fbApp = initializeApp(firebaseConfig);

export { firebaseConfig };
export const auth = getAuth(fbApp);
export const db   = getFirestore(fbApp);

// Global state
export const state = {
  me: null,
};

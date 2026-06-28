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
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCMSXLY_leS9xg6yS2y5h1eb1NE66LE5e0",
  authDomain: "ai-nutrition-analyser.firebaseapp.com",
  projectId: "ai-nutrition-analyser",
  storageBucket: "ai-nutrition-analyser.firebasestorage.app",
  messagingSenderId: "34569893121",
  appId: "1:34569893121:web:f08add13343fada6c81700"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

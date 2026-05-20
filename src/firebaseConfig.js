import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgmNbzlFpVEtrXy4xBxp-BzCrr2NJ2548",
  authDomain: "locationapp-23504.firebaseapp.com",
  projectId: "locationapp-23504",
  storageBucket: "locationapp-23504.firebasestorage.app",
  messagingSenderId: "421003651169",
  appId: "1:421003651169:web:67c77ff3dc5c3459762220",
  measurementId: "G-D9XEFZT7FM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

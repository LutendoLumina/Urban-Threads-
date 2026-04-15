import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXn5UouO3uoP2NbmbAUY8tdtW7gxJxcoY",
  authDomain: "urbanthreadsstore-4e1c5.firebaseapp.com",
  projectId: "urbanthreadsstore-4e1c5",
  storageBucket: "urbanthreadsstore-4e1c5.firebasestorage.app",
  messagingSenderId: "21832635924",
  appId: "1:21832635924:web:7aba75c63e13679e8b3901"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
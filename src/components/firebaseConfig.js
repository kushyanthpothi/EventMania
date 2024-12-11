// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9qItoH4H9RdBIs5MQJ7_liZ6rMk8qQXc",
  authDomain: "ap-event-mania.firebaseapp.com",
  databaseURL: "https://ap-event-mania-default-rtdb.firebaseio.com",
  projectId: "ap-event-mania",
  storageBucket: "ap-event-mania.appspot.com",
  messagingSenderId: "331661624600",
  appId: "1:331661624600:web:a7b59e464239bdb8d0ca6d",
  measurementId: "G-HWM7FJ1XH7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Export the initialized services
export { app, auth, firestore, database, storage }; // Export storage

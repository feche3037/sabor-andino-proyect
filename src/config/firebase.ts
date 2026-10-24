import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  // @ts-expect-error getReactNativePersistence is available in React Native environment
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase leída de variables de entorno públicas de Expo (o valores de respaldo para desarrollo)
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDemoKeySaborAndino123456789012345",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "sabor-andino-proyect.firebaseapp.com",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "sabor-andino-proyect",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "sabor-andino-proyect.appspot.com",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    "1:123456789012:web:abcdef1234567890abcdef",
};

// Inicialización de la app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicialización de Auth con persistencia en AsyncStorage para React Native
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Si ya fue inicializado (ej. por Fast Refresh durante desarrollo)
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

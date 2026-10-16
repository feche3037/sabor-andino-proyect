#!/usr/bin/env node
// Carga firebase-import.json en Cloud Firestore.
// Uso: npm run seed   (lee las credenciales de .env)
// Opcional: SEED_EMAIL / SEED_PASSWORD en .env para autenticarse si las reglas exigen login.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, writeBatch } from "firebase/firestore";

const env = process.env;
const faltantes = ["API_KEY", "PROJECT_ID", "APP_ID"].filter(
  (k) => !env[`EXPO_PUBLIC_FIREBASE_${k}`],
);
if (faltantes.length) {
  console.error(`Faltan variables EXPO_PUBLIC_FIREBASE_${faltantes.join(", ")} en .env`);
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const archivo = join(dirname(fileURLToPath(import.meta.url)), "..", "firebase-import.json");
const datos = JSON.parse(readFileSync(archivo, "utf8"));

async function main() {
  if (env.SEED_EMAIL && env.SEED_PASSWORD) {
    await signInWithEmailAndPassword(getAuth(app), env.SEED_EMAIL, env.SEED_PASSWORD);
    console.log(`Autenticado como ${env.SEED_EMAIL}`);
  }

  for (const [coleccion, documentos] of Object.entries(datos)) {
    const entradas = Object.entries(documentos);
    // Firestore admite hasta 500 operaciones por batch
    for (let i = 0; i < entradas.length; i += 400) {
      const batch = writeBatch(db);
      for (const [id, data] of entradas.slice(i, i + 400)) {
        batch.set(doc(db, coleccion, id), data);
      }
      await batch.commit();
    }
    console.log(`✔ ${coleccion}: ${entradas.length} documentos`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Error al cargar los datos:", e.message);
    if (e.code === "permission-denied") {
      console.error("Reglas de Firestore sin permiso: usá modo de prueba o definí SEED_EMAIL/SEED_PASSWORD en .env.");
    }
    process.exit(1);
  });

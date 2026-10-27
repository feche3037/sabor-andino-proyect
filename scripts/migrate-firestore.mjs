#!/usr/bin/env node
/**
 * Script de migración de esquema para Cloud Firestore (Sabor Andino).
 *
 * Transforma:
 *  - usuarios: elimina o limpia 'puesto', añade 'fotoUrl' y 'emailVerified'.
 *  - productores: migra 'producto' (1:1) hacia 'productosIds' (N:M), añade 'direccion', 'celular', 'redesSociales', 'fotoUrl'.
 *  - productos: añade 'lote', 'stock', 'presentacion', 'fotoUrl', 'productoresIds'.
 *
 * Uso:
 *   node --env-file=.env scripts/migrate-firestore.mjs
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

const env = process.env;
const faltantes = ["API_KEY", "PROJECT_ID", "APP_ID"].filter(
  (k) => !env[`EXPO_PUBLIC_FIREBASE_${k}`],
);

if (faltantes.length) {
  console.error(
    `Faltan variables EXPO_PUBLIC_FIREBASE_${faltantes.join(", ")} en .env`,
  );
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

async function migrarUsuarios() {
  console.log("👉 Iniciando migración de 'usuarios'...");
  const snap = await getDocs(collection(db, "usuarios"));
  let modificados = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const updateData = {};

    // Agregar fotoUrl si no existe
    if (data.fotoUrl === undefined) {
      updateData.fotoUrl = null;
    }
    // Agregar emailVerified por defecto a true para usuarios ya existentes
    if (data.emailVerified === undefined) {
      updateData.emailVerified = true;
    }
    // Puesto ya no se requiere en la UI pero mantenemos compatibilidad o null
    if (data.puesto !== undefined) {
      updateData.puesto = null;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date().toISOString();
      await updateDoc(doc(db, "usuarios", docSnap.id), updateData);
      modificados++;
    }
  }

  console.log(`✔ Usuarios actualizados: ${modificados} de ${snap.size}`);
}

async function migrarProductoresYProductos() {
  console.log("👉 Iniciando migración de 'productores' y 'productos' (Relación N:M)...");
  const productoresSnap = await getDocs(collection(db, "productores"));
  const productosSnap = await getDocs(collection(db, "productos"));

  // Mapeo productoId -> Set de productorIds
  const mapaProductoAProductores = new Map();
  productosSnap.docs.forEach((docSnap) => {
    mapaProductoAProductores.set(docSnap.id, new Set());
  });

  // 1. Migrar Productores
  for (const prodDoc of productoresSnap.docs) {
    const pData = prodDoc.data();
    const updateData = {};

    // Extraer productosIds desde el campo legacy 'producto' si existe
    let productosIds = Array.isArray(pData.productosIds) ? [...pData.productosIds] : [];
    if (pData.producto && pData.producto.id && !productosIds.includes(pData.producto.id)) {
      productosIds.push(pData.producto.id);
    }
    updateData.productosIds = productosIds;

    // Vincular al mapa inverso
    productosIds.forEach((pid) => {
      if (mapaProductoAProductores.has(pid)) {
        mapaProductoAProductores.get(pid).add(prodDoc.id);
      }
    });

    if (pData.direccion === undefined) updateData.direccion = "Sin dirección registrada";
    if (pData.celular === undefined) updateData.celular = "Sin celular registrado";
    if (pData.redesSociales === undefined) {
      updateData.redesSociales = { instagram: "", facebook: "" };
    }
    if (pData.fotoUrl === undefined) updateData.fotoUrl = null;

    updateData.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, "productores", prodDoc.id), updateData);
  }
  console.log(`✔ Productores actualizados: ${productoresSnap.size}`);

  // 2. Migrar Productos
  for (const prodDoc of productosSnap.docs) {
    const pData = prodDoc.data();
    const updateData = {};

    const asociados = Array.from(mapaProductoAProductores.get(prodDoc.id) || []);
    const existentes = Array.isArray(pData.productoresIds) ? pData.productoresIds : [];
    const unionProductores = Array.from(new Set([...existentes, ...asociados]));

    updateData.productoresIds = unionProductores;
    if (pData.lote === undefined) updateData.lote = "L-2026-001";
    if (pData.stock === undefined) updateData.stock = 50;
    if (pData.presentacion === undefined) updateData.presentacion = "Molido 250g";
    if (pData.fotoUrl === undefined) updateData.fotoUrl = null;

    updateData.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, "productos", prodDoc.id), updateData);
  }
  console.log(`✔ Productos actualizados: ${productosSnap.size}`);
}

async function main() {
  if (env.SEED_EMAIL && env.SEED_PASSWORD) {
    await signInWithEmailAndPassword(getAuth(app), env.SEED_EMAIL, env.SEED_PASSWORD);
    console.log(`Autenticado con cuenta administrativa: ${env.SEED_EMAIL}`);
  }

  await migrarUsuarios();
  await migrarProductoresYProductos();
  console.log("🎉 Migración de Firestore completada con éxito.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error durante la migración:", err);
    process.exit(1);
  });


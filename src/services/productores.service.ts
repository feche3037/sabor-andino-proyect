import * as Crypto from "expo-crypto";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { Productor, Producto } from "@/types";

const COLECCION_PRODUCTORES = "productores";

/**
 * Genera iniciales a partir del nombre completo
 */
export function generarIniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return nombre.trim().substring(0, 2).toUpperCase();
}

/**
 * Suscribe en tiempo real a la colección de productores
 */
export function suscribirProductores(
  onUpdate: (productores: Productor[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(collection(db, COLECCION_PRODUCTORES), orderBy("nombre", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const productores: Productor[] = [];
      snapshot.forEach((doc) => {
        productores.push(doc.data() as Productor);
      });
      onUpdate(productores);
    },
    (error) => {
      console.error("Error al suscribir productores:", error);
      if (onError) onError(error);
    },
  );
}

/**
 * Obtiene todos los productores de Firestore
 */
export async function obtenerProductores(): Promise<Productor[]> {
  try {
    const q = query(collection(db, COLECCION_PRODUCTORES), orderBy("nombre", "asc"));
    const snapshot = await getDocs(q);
    const productores: Productor[] = [];
    snapshot.forEach((doc) => {
      productores.push(doc.data() as Productor);
    });
    return productores;
  } catch (error) {
    console.error("Error al obtener productores:", error);
    throw error;
  }
}

/**
 * Crea un productor con UUID autogenerado
 */
export async function crearProductor(data: {
  nombre: string;
  localidad: string;
  producto: Producto;
}): Promise<Productor> {
  try {
    const id = Crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const iniciales = generarIniciales(data.nombre);

    const nuevoProductor: Productor = {
      id,
      nombre: data.nombre.trim(),
      localidad: data.localidad.trim(),
      producto: data.producto,
      iniciales,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = doc(db, COLECCION_PRODUCTORES, id);
    await setDoc(docRef, nuevoProductor);
    return nuevoProductor;
  } catch (error) {
    console.error("Error al crear productor:", error);
    throw error;
  }
}

/**
 * Actualiza los datos de un productor
 */
export async function actualizarProductor(
  id: string,
  data: {
    nombre?: string;
    localidad?: string;
    producto?: Producto;
  },
): Promise<void> {
  try {
    const docRef = doc(db, COLECCION_PRODUCTORES, id);
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.nombre) {
      updateData.iniciales = generarIniciales(data.nombre);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error al actualizar productor:", error);
    throw error;
  }
}

/**
 * Elimina un productor por su ID
 */
export async function eliminarProductor(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLECCION_PRODUCTORES, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar productor:", error);
    throw error;
  }
}


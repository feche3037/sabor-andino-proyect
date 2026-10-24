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
import { Producto } from "@/types";

const COLECCION_PRODUCTOS = "productos";

/**
 * Suscribe en tiempo real a la colección de productos
 */
export function suscribirProductos(
  onUpdate: (productos: Producto[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(collection(db, COLECCION_PRODUCTOS), orderBy("nombre", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const productos: Producto[] = [];
      snapshot.forEach((d) => {
        productos.push(d.data() as Producto);
      });
      onUpdate(productos);
    },
    (error) => {
      console.error("Error al suscribir productos:", error);
      if (onError) onError(error);
    },
  );
}

/**
 * Obtiene todos los productos de Firestore
 */
export async function obtenerProductos(): Promise<Producto[]> {
  try {
    const q = query(collection(db, COLECCION_PRODUCTOS), orderBy("nombre", "asc"));
    const snapshot = await getDocs(q);
    const productos: Producto[] = [];
    snapshot.forEach((d) => {
      productos.push(d.data() as Producto);
    });
    return productos;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

/**
 * Crea un producto con UUID autogenerado y nuevos campos
 */
export async function crearProducto(
  data: Omit<Producto, "id" | "createdAt" | "updatedAt">,
): Promise<Producto> {
  try {
    const id = Crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const nuevoProducto: Producto = {
      id,
      nombre: data.nombre.trim(),
      color: data.color.trim(),
      lote: data.lote?.trim() || "",
      stock: data.stock !== undefined ? Number(data.stock) : 0,
      presentacion: data.presentacion?.trim() || "",
      fotoUrl: data.fotoUrl || null,
      productoresIds: data.productoresIds || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const docRef = doc(db, COLECCION_PRODUCTOS, id);
    await setDoc(docRef, nuevoProducto);
    return nuevoProducto;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
}

/**
 * Actualiza los datos de un producto
 */
export async function actualizarProducto(
  id: string,
  data: Partial<Omit<Producto, "id" | "createdAt">>,
): Promise<void> {
  try {
    const docRef = doc(db, COLECCION_PRODUCTOS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
}

/**
 * Elimina un producto por su ID
 */
export async function eliminarProducto(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLECCION_PRODUCTOS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
}

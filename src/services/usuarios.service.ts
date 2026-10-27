import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { db } from "@/config/firebase";
import { Usuario } from "@/types";

const COLECCION_USUARIOS = "usuarios";

export async function obtenerUsuario(uid: string): Promise<Usuario | null> {
  try {
    const docRef = doc(db, COLECCION_USUARIOS, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Usuario;
    }
    return null;
  } catch (error) {
    // console.error("Error al obtener usuario:", error);
    throw error;
  }
}

export async function guardarUsuario(usuario: Usuario): Promise<void> {
  try {
    const docRef = doc(db, COLECCION_USUARIOS, usuario.uid);
    await setDoc(docRef, {
      ...usuario,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // console.error("Error al guardar usuario:", error);
    throw error;
  }
}

export async function actualizarUsuario(
  uid: string,
  data: Partial<Omit<Usuario, "uid">>,
): Promise<void> {
  try {
    const docRef = doc(db, COLECCION_USUARIOS, uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // console.error("Error al actualizar usuario:", error);
    throw error;
  }
}


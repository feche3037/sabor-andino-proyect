import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/config/firebase";

/**
 * Sube una imagen desde la URI local (proporcionada por expo-image-picker) a Firebase Storage.
 * @param uri Ruta local del archivo en el dispositivo (ej: file://...)
 * @param path Ruta destino en Firebase Storage (ej: "usuarios/uid/avatar.jpg")
 * @returns Promesa con la URL de descarga pública
 */
export async function subirImagen(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}


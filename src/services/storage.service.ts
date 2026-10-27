import { supabase } from "@/config/supabase";

/** Nombre del bucket en Supabase Storage */
const BUCKET = "imagenes";

/**
 * Sube una imagen desde la URI local (proporcionada por expo-image-picker) a Supabase Storage.
 * @param uri Ruta local del archivo en el dispositivo (ej: file://...)
 * @param path Ruta destino en el bucket (ej: "usuarios/uid/avatar.jpg")
 * @returns Promesa con la URL pública de la imagen subida
 */
export async function subirImagen(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  // Detectar el tipo MIME del blob; por defecto "image/jpeg"
  const contentType = blob.type || "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType,
      upsert: true, // Sobrescribe si ya existe (ej: al editar foto de perfil)
    });

  if (error) {
    throw new Error(`Error al subir imagen a Supabase Storage: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

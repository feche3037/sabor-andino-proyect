import { Platform } from "react-native";
import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { supabase } from "@/config/supabase";

/** Nombre del bucket en Supabase Storage */
const BUCKET = "imagenes";

/**
 * Deduce el tipo MIME según la extensión del archivo o el contenido del URI.
 */
function inferMimeType(filePathOrUri: string): string | null {
  if (filePathOrUri.startsWith("data:")) {
    const match = filePathOrUri.match(/^data:([^;,]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  const cleanPath = filePathOrUri.split("?")[0].split("#")[0];
  const ext = cleanPath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "svg":
      return "image/svg+xml";
    default:
      return null;
  }
}

/**
 * Lee el contenido binario de una imagen según la plataforma.
 * - En Web: usa fetch() nativo del navegador y devuelve un Blob.
 * - En iOS / Android (Expo Go): lee el archivo como ArrayBuffer evitando
 *   el bug de FormData/Blob de React Native con Supabase.
 */
async function getFileBody(uri: string): Promise<{ data: Blob | ArrayBuffer; mimeType?: string }> {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    return { data: blob, mimeType: blob.type || undefined };
  }

  // En Native (iOS / Android)
  // Caso 1: URI en Base64 directo (data:image/...)
  if (uri.startsWith("data:")) {
    const commaIndex = uri.indexOf(",");
    const base64Data = commaIndex !== -1 ? uri.slice(commaIndex + 1) : uri;
    return {
      data: decode(base64Data),
      mimeType: inferMimeType(uri) || undefined,
    };
  }

  // Caso 2: Archivo local (file://, content:// o rutas en caché)
  // Intentamos con la API moderna de Expo (File.bytes) y fallback a la legacy (readAsStringAsync)
  try {
    const file = new File(uri);
    const bytes = await file.bytes();
    // Extraer el ArrayBuffer exacto respetando offset y length
    const arrayBuffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    return {
      data: arrayBuffer,
      mimeType: inferMimeType(uri) || undefined,
    };
  } catch {
    const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });
    return {
      data: decode(base64),
      mimeType: inferMimeType(uri) || undefined,
    };
  }
}

/**
 * Sube una imagen desde la URI local (proporcionada por expo-image-picker o cámara)
 * a Supabase Storage, compatible con Web, iOS y Android (Expo Go).
 *
 * @param uri Ruta local del archivo en el dispositivo (ej: file://..., content://..., blob:..., data:...)
 * @param path Ruta destino en el bucket (ej: "usuarios/uid/avatar.jpg")
 * @returns Promesa con la URL pública de la imagen subida
 */
export async function subirImagen(uri: string, path: string): Promise<string> {
  const { data: fileBody, mimeType: detectedMimeType } = await getFileBody(uri);

  // Determinar Content-Type final
  const contentType =
    detectedMimeType ||
    inferMimeType(uri) ||
    inferMimeType(path) ||
    "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, fileBody, {
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

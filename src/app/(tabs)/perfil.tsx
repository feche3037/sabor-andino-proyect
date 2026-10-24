import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";
import { subirImagen } from "@/services/storage.service";
import { validarCelular, validarNombre } from "@/utils/validations";

type CamposEditables = "nombre" | "apellido" | "telefono";

export default function PerfilScreen() {
  const router = useRouter();
  const { user, userProfile, updateProfileData, logout } = useAuth();

  const [ediciones, setEdiciones] = useState<
    Partial<Record<CamposEditables, string>>
  >({});
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [modalLogoutVisible, setModalLogoutVisible] = useState(false);
  const [aviso, setAviso] = useState<{ titulo: string; mensaje: string } | null>(
    null,
  );

  const partesNombre = (user?.displayName || "").split(" ");
  const base: Record<CamposEditables, string> = {
    nombre: userProfile?.nombre ?? partesNombre[0] ?? "",
    apellido: userProfile?.apellido ?? partesNombre[1] ?? "",
    telefono: userProfile?.telefono ?? "",
  };

  const nombre = ediciones.nombre ?? base.nombre;
  const apellido = ediciones.apellido ?? base.apellido;
  const telefono = ediciones.telefono ?? base.telefono;
  const email = userProfile?.email || user?.email || "";
  const fotoActual = userProfile?.fotoUrl || user?.photoURL || null;

  const editar = (campo: CamposEditables) => (valor: string) =>
    setEdiciones((prev) => ({ ...prev, [campo]: valor }));

  // Generar iniciales dinámicamente según el nombre y apellido
  const iniciales = `${nombre.trim()[0] || ""}${
    apellido.trim()[0] || ""
  }`.toUpperCase() || "SA";

  // Función para seleccionar y subir imagen a Firebase Storage
  const handleCambiarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permisos requeridos",
          "Necesitamos acceso a tu galería para actualizar tu foto de perfil.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setSubiendoFoto(true);
        const localUri = result.assets[0].uri;
        const storagePath = `usuarios/${user?.uid || "anon"}/avatar_${Date.now()}.jpg`;

        const downloadUrl = await subirImagen(localUri, storagePath);
        await updateProfileData({ fotoUrl: downloadUrl });

        setAviso({
          titulo: "Foto actualizada",
          mensaje: "Tu foto de perfil ha sido actualizada con éxito.",
        });
      }
    } catch (error) {
      console.error("Error al actualizar foto:", error);
      Alert.alert("Error", "No se pudo subir la foto. Intenta nuevamente.");
    } finally {
      setSubiendoFoto(false);
    }
  };

  // Guardar cambios en Firestore
  const handleGuardarCambios = async () => {
    const errNom = validarNombre(nombre);
    if (errNom) {
      setAviso({ titulo: "Nombre inválido", mensaje: errNom });
      return;
    }

    const errApe = validarNombre(apellido);
    if (errApe) {
      setAviso({ titulo: "Apellido inválido", mensaje: errApe });
      return;
    }

    const errTel = validarCelular(telefono);
    if (errTel) {
      setAviso({ titulo: "Teléfono inválido", mensaje: errTel });
      return;
    }

    try {
      setGuardando(true);
      await updateProfileData({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
      });
      setAviso({
        titulo: "Perfil actualizado",
        mensaje:
          "Los datos de tu perfil se guardaron correctamente en la base de datos.",
      });
    } catch (error) {
      setAviso({
        titulo: "Error",
        mensaje: "No se pudo actualizar el perfil. Intenta nuevamente.",
      });
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Cierra la sesión y vuelve explícitamente al login
  const handleConfirmarLogout = async () => {
    try {
      setCerrandoSesion(true);
      await logout();
      setModalLogoutVisible(false);
      router.replace("/login");
    } catch (error) {
      setModalLogoutVisible(false);
      setAviso({ titulo: "Error", mensaje: "No se pudo cerrar sesión." });
      console.error(error);
    } finally {
      setCerrandoSesion(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#7A2214" />

      {/* Encabezado Rojo Terracota */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi perfil</Text>

        {/* Borde inferior dentado andino */}
        <View style={styles.teethContainer}>
          {Array.from({ length: 16 }).map((_, index) => (
            <View key={index} style={styles.tooth} />
          ))}
        </View>
      </View>

      {/* Contenido Formulario Desplazable adaptativo al teclado */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar con selector de imagen */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              activeOpacity={0.8}
              onPress={handleCambiarFoto}
              disabled={subiendoFoto || guardando}
            >
              {fotoActual ? (
                <Image
                  source={{ uri: fotoActual }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{iniciales}</Text>
                </View>
              )}

              {/* Indicador de edición/cámara */}
              <View style={styles.cameraBadge}>
                {subiendoFoto ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.userNameText}>
              {nombre || "Usuario"} {apellido}
            </Text>
            <Text style={styles.userEmailSubtitle}>{email}</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={editar("nombre")}
              placeholder="Tu nombre (solo letras)"
              placeholderTextColor="#999999"
              editable={!guardando && !cerrandoSesion}
            />

            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={apellido}
              onChangeText={editar("apellido")}
              placeholder="Tu apellido (solo letras)"
              placeholderTextColor="#999999"
              editable={!guardando && !cerrandoSesion}
            />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            <Text style={styles.helperText}>
              El correo electrónico está vinculado a tu cuenta de acceso.
            </Text>

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={editar("telefono")}
              placeholder="Ej: 387 455-0192"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
              editable={!guardando && !cerrandoSesion}
            />

            {/* Botón Guardar Cambios */}
            <TouchableOpacity
              style={[styles.submitButton, guardando && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={handleGuardarCambios}
              disabled={guardando || cerrandoSesion}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Guardar cambios</Text>
              )}
            </TouchableOpacity>

            {/* Botón Desloguear / Cerrar Sesión */}
            <TouchableOpacity
              style={[
                styles.logoutButton,
                cerrandoSesion && styles.buttonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={() => setModalLogoutVisible(true)}
              disabled={guardando || cerrandoSesion}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color="#7A2214"
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Aviso de Operación */}
      <Modal
        visible={aviso !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAviso(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{aviso?.titulo}</Text>
            <Text style={styles.modalMessage}>{aviso?.mensaje}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.85}
              onPress={() => setAviso(null)}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación de Logout */}
      <Modal
        visible={modalLogoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="log-out-outline"
              size={36}
              color="#7A2214"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalMessage}>
              Tendrás que volver a ingresar tus credenciales para acceder a tu
              cuenta.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButtonSecondary]}
                activeOpacity={0.85}
                onPress={() => setModalLogoutVisible(false)}
                disabled={cerrandoSesion}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  cerrandoSesion && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleConfirmarLogout}
                disabled={cerrandoSesion}
              >
                {cerrandoSesion ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Cerrar sesión</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0EA",
  },
  header: {
    backgroundColor: "#7A2214",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  teethContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    overflow: "hidden",
  },
  tooth: {
    flex: 1,
    height: 8,
    backgroundColor: "#F4F0EA",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 1,
    top: 5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#7A2214",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#E8A338",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C2C2C",
    textAlign: "center",
  },
  userEmailSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2D9CC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#555555",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F9F8F6",
    borderWidth: 1,
    borderColor: "#E2DCD5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333333",
  },
  inputDisabled: {
    backgroundColor: "#EFECE6",
    color: "#888888",
  },
  helperText: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
    marginBottom: 4,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#7A2214",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#7A2214",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#7A2214",
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  logoutIcon: {
    marginRight: 6,
  },
  logoutButtonText: {
    color: "#7A2214",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#7A2214",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    minWidth: 120,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButtonSecondary: {
    backgroundColor: "#F4F0EA",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  modalButtonTextSecondary: {
    color: "#555555",
    fontSize: 15,
    fontWeight: "600",
  },
});


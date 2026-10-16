import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/context/auth-context";

type CamposEditables = "nombre" | "apellido" | "telefono" | "puesto";

export default function PerfilScreen() {
  const router = useRouter();
  const { user, userProfile, updateProfileData, logout } = useAuth();

  // Cambios del usuario sobre los valores base (perfil de Firestore o cuenta de Auth)
  const [ediciones, setEdiciones] = useState<
    Partial<Record<CamposEditables, string>>
  >({});
  const [guardando, setGuardando] = useState(false);
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
    puesto: userProfile?.puesto || "Auxiliar",
  };
  const nombre = ediciones.nombre ?? base.nombre;
  const apellido = ediciones.apellido ?? base.apellido;
  const telefono = ediciones.telefono ?? base.telefono;
  const puesto = ediciones.puesto ?? base.puesto;
  const email = userProfile?.email || user?.email || "";

  const editar = (campo: CamposEditables) => (valor: string) =>
    setEdiciones((prev) => ({ ...prev, [campo]: valor }));

  // Generar iniciales dinámicamente según el nombre y apellido
  const iniciales = `${nombre.trim()[0] || ""}${
    apellido.trim()[0] || ""
  }`.toUpperCase() || "SA";

  // Guardar cambios en Firestore
  const handleGuardarCambios = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      setAviso({
        titulo: "Campos incompletos",
        mensaje: "Por favor completa al menos Nombre y Apellido.",
      });
      return;
    }

    try {
      setGuardando(true);
      await updateProfileData({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        puesto: puesto.trim(),
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

      {/* Contenido Formulario Desplazable */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado del Perfil (Avatar + Nombre + Etiqueta de Puesto) */}
        <View style={styles.userHeaderRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userNameText}>
              {nombre || "Usuario"} {apellido}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {puesto || "Rol no asignado"}
              </Text>
            </View>
          </View>
        </View>

        {/* Campos de Edición */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={editar("nombre")}
          placeholder="Tu nombre"
          placeholderTextColor="#999999"
          editable={!guardando && !cerrandoSesion}
        />

        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          value={apellido}
          onChangeText={editar("apellido")}
          placeholder="Tu apellido"
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

        <Text style={styles.label}>Puesto / Rol</Text>
        <TextInput
          style={styles.input}
          value={puesto}
          onChangeText={editar("puesto")}
          placeholder="Ej: Auxiliar administrativa"
          placeholderTextColor="#999999"
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
          style={[styles.logoutButton, cerrandoSesion && styles.buttonDisabled]}
          activeOpacity={0.85}
          onPress={() => setModalLogoutVisible(true)}
          disabled={guardando || cerrandoSesion}
        >
          {cerrandoSesion ? (
            <ActivityIndicator color="#C0392B" />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#C0392B"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Cerrar Sesión */}
      <Modal visible={modalLogoutVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.dangerIconContainer}>
                <Ionicons name="log-out-outline" size={24} color="#C0392B" />
              </View>
              <Text style={styles.modalTitle}>Cerrar sesión</Text>
              <TouchableOpacity
                onPress={() => setModalLogoutVisible(false)}
                disabled={cerrandoSesion}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseás cerrar sesión?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalLogoutVisible(false)}
                disabled={cerrandoSesion}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteBtn, cerrandoSesion && styles.buttonDisabled]}
                onPress={handleConfirmarLogout}
                disabled={cerrandoSesion}
              >
                {cerrandoSesion ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteBtnText}>Cerrar sesión</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de aviso (validaciones y resultados) */}
      <Modal visible={aviso !== null} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{aviso?.titulo}</Text>
            <Text style={styles.modalMessage}>{aviso?.mensaje}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => setAviso(null)}
              >
                <Text style={styles.saveBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barra de Navegación Inferior */}
      <BottomNav currentTab="perfil" />
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
    paddingBottom: 28,
    paddingHorizontal: 20,
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  teethContainer: {
    position: "absolute",
    bottom: -6,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tooth: {
    width: 10,
    height: 6,
    backgroundColor: "#7A2214",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  userHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FCF0D3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#7A2214",
    fontWeight: "bold",
    fontSize: 22,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userNameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F1F1F",
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: "#E2EFE0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleBadgeText: {
    color: "#2E6930",
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B2B2B",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333333",
  },
  inputDisabled: {
    backgroundColor: "#EFECE6",
    color: "#666666",
  },
  helperText: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#8B2613",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 26,
    marginBottom: 12,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FADBD8",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#C0392B",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dangerIconContainer: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F1F1F",
    flex: 1,
  },
  modalMessage: {
    fontSize: 15,
    color: "#555555",
    lineHeight: 22,
    marginVertical: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: "#666666",
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#7A2214",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  deleteBtn: {
    backgroundColor: "#C0392B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

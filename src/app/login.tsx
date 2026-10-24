import { Ionicons } from "@expo/vector-icons";
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
import { validarEmail } from "@/utils/validations";

export default function LoginScreen() {
  const router = useRouter();
  const { login, resetPassword } = useAuth();

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para recuperación de contraseña
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Mapeo amigable de errores de Firebase Auth
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code: string }).code;
      switch (code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "El correo o la contraseña son incorrectos. Verificá tus credenciales.";
        case "auth/invalid-email":
          return "El formato de correo no es válido.";
        case "auth/too-many-requests":
          return "Demasiados intentos fallidos. Por seguridad, aguarda unos minutos e intenta nuevamente.";
        case "auth/network-request-failed":
          return "Error de red. Verifica tu conexión a internet.";
        default:
          return "Ocurrió un error al iniciar sesión. Intenta nuevamente.";
      }
    }
    return "Error inesperado al iniciar sesión.";
  };

  // Función para procesar e iniciar sesión
  const handleLogin = async () => {
    setErrorMessage(null);

    const emailErr = validarEmail(email);
    if (emailErr) {
      setErrorMessage(emailErr);
      return;
    }

    if (!password) {
      setErrorMessage("Por favor ingresá tu contraseña.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Función para enviar correo de restablecimiento de contraseña
  const handleSendResetEmail = async () => {
    setResetError(null);
    const err = validarEmail(resetEmail);
    if (err) {
      setResetError(err);
      return;
    }

    try {
      setResetLoading(true);
      await resetPassword(resetEmail);
      setResetModalVisible(false);
      setResetEmail("");
      Alert.alert(
        "Correo enviado",
        "Te hemos enviado un enlace para restablecer tu contraseña. Revisá tu bandeja de entrada o spam.",
      );
    } catch {
      setResetError(
        "No se pudo enviar el correo de recuperación. Verificá que la dirección sea correcta.",
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B2613" />

      {/* Encabezado Rojo Terracota */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="shapes" size={28} color="#E8A338" />
          <Text style={styles.logoText}>Sabor Andino</Text>
        </View>
        <Text style={styles.headerTitle}>¡Hola de nuevo!</Text>
        <Text style={styles.headerSubtitle}>
          Ingresá tus datos para acceder a tu cuenta.
        </Text>
      </View>

      {/* Formulario de Login con soporte para teclado nativo */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color="#D32F2F" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Campo Correo electrónico */}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor="#9E9E9E"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              if (errorMessage) setErrorMessage(null);
            }}
            editable={!loading}
          />

          {/* Campo Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Tu contraseña"
              placeholderTextColor="#9E9E9E"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (errorMessage) setErrorMessage(null);
              }}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.showText}>
                {showPassword ? "Ocultar" : "Mostrar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Opción ¿Te olvidaste tu contraseña? */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => {
              setResetEmail(email.trim());
              setResetError(null);
              setResetModalVisible(true);
            }}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Te olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Botón Iniciar Sesión */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          {/* Enlace para ir a Crear Cuenta */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>¿No tenés una cuenta?</Text>
            <TouchableOpacity
              onPress={() => router.push("/signup")}
              disabled={loading}
            >
              <Text style={styles.registerLink}> Registrarse</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal para Recuperar Contraseña */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalContentWrapper}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="key-outline" size={28} color="#7A2214" />
                <Text style={styles.modalTitle}>Recuperar contraseña</Text>
              </View>

              <Text style={styles.modalSubtitle}>
                Ingresá tu correo electrónico registrado y te enviaremos un
                enlace para restablecer tu contraseña.
              </Text>

              {resetError && (
                <View style={styles.modalErrorBanner}>
                  <Text style={styles.modalErrorText}>{resetError}</Text>
                </View>
              )}

              <TextInput
                style={styles.modalInput}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={resetEmail}
                onChangeText={(t) => {
                  setResetEmail(t);
                  if (resetError) setResetError(null);
                }}
                editable={!resetLoading}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setResetModalVisible(false)}
                  disabled={resetLoading}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    resetLoading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSendResetEmail}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Enviar enlace</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F2EC",
  },
  header: {
    backgroundColor: "#8B2613",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
  },
  headerSubtitle: {
    color: "#E0C8C3",
    fontSize: 14,
  },
  formContainer: {
    padding: 24,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: "#C62828",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2B2B",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DCD5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333333",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DCD5",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333333",
  },
  showText: {
    color: "#8B2613",
    fontWeight: "bold",
    fontSize: 13,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 6,
  },
  forgotPasswordText: {
    color: "#8B2613",
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#8B2613",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  footerText: {
    color: "#555555",
    fontSize: 14,
  },
  registerLink: {
    color: "#8B2613",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContentWrapper: {
    width: "100%",
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#2C2C2C",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalErrorBanner: {
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  modalErrorText: {
    color: "#C62828",
    fontSize: 13,
  },
  modalInput: {
    backgroundColor: "#F9F8F6",
    borderWidth: 1,
    borderColor: "#E2DCD5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333333",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: "#666666",
    fontWeight: "600",
    fontSize: 15,
  },
  modalConfirmButton: {
    backgroundColor: "#7A2214",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import {
  validarEmail,
  validarNombre,
  validarPassword,
} from "@/utils/validations";

export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Control para mostrar u ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mapeo amigable de errores de Firebase Auth
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code: string }).code;
      switch (code) {
        case "auth/email-already-in-use":
          return "Ya existe una cuenta con este correo electrónico.";
        case "auth/invalid-email":
          return "El formato de correo no es válido.";
        case "auth/weak-password":
          return "La contraseña ingresada no cumple los requisitos de seguridad.";
        case "auth/network-request-failed":
          return "Error de red. Verifica tu conexión a internet.";
        default:
          return "No se pudo completar el registro. Intenta nuevamente.";
      }
    }
    return "Ocurrió un error inesperado durante el registro.";
  };

  // Requisitos de contraseña para feedback visual
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  // Función para procesar y validar el registro
  const handleRegister = async () => {
    setErrorMessage(null);

    const errNom = validarNombre(nombre);
    if (errNom) {
      setErrorMessage(`Nombre: ${errNom}`);
      return;
    }

    const errApe = validarNombre(apellido);
    if (errApe) {
      setErrorMessage(`Apellido: ${errApe}`);
      return;
    }

    const errEmail = validarEmail(email);
    if (errEmail) {
      setErrorMessage(errEmail);
      return;
    }

    const errPass = validarPassword(password);
    if (errPass) {
      setErrorMessage(errPass);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      await register(nombre, apellido, email, password);
      // Redirigir a la pantalla de verificación de correo
      router.replace("/verify-email");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B2613" />

      {/* Encabezado Rojo Terracota con botón volver */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/login")
            }
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Ionicons name="shapes" size={24} color="#E8A338" />
            <Text style={styles.logoText}>Sabor Andino</Text>
          </View>
        </View>

        <Text style={styles.headerTitle}>Crear cuenta</Text>
        <Text style={styles.headerSubtitle}>
          Completá tus datos para empezar.
        </Text>
      </View>

      {/* Formulario de registro adaptativo a teclado */}
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

          {/* Campo Nombre */}
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre (solo letras)"
            placeholderTextColor="#9E9E9E"
            value={nombre}
            onChangeText={(t) => {
              setNombre(t);
              if (errorMessage) setErrorMessage(null);
            }}
            editable={!loading}
          />

          {/* Campo Apellido */}
          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu apellido (solo letras)"
            placeholderTextColor="#9E9E9E"
            value={apellido}
            onChangeText={(t) => {
              setApellido(t);
              if (errorMessage) setErrorMessage(null);
            }}
            editable={!loading}
          />

          {/* Campo Correo electrónico */}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor="#9E9E9E"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errorMessage) setErrorMessage(null);
            }}
            editable={!loading}
          />

          {/* Campo Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña segura"
              placeholderTextColor="#9E9E9E"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
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

          {/* Indicadores visuales de requisitos de contraseña */}
          <View style={styles.passwordRequirementsContainer}>
            <Text style={styles.requirementsTitle}>
              Requisitos de contraseña:
            </Text>
            <View style={styles.requirementItem}>
              <Ionicons
                name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={hasMinLength ? "#2E7D32" : "#888888"}
              />
              <Text
                style={[
                  styles.requirementText,
                  hasMinLength && styles.requirementMet,
                ]}
              >
                Mínimo 8 caracteres
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={hasUppercase ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={hasUppercase ? "#2E7D32" : "#888888"}
              />
              <Text
                style={[
                  styles.requirementText,
                  hasUppercase && styles.requirementMet,
                ]}
              >
                Al menos una letra mayúscula
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={hasNumber ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={hasNumber ? "#2E7D32" : "#888888"}
              />
              <Text
                style={[
                  styles.requirementText,
                  hasNumber && styles.requirementMet,
                ]}
              >
                Al menos un número
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={hasSpecial ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={hasSpecial ? "#2E7D32" : "#888888"}
              />
              <Text
                style={[
                  styles.requirementText,
                  hasSpecial && styles.requirementMet,
                ]}
              >
                Al menos un carácter especial (!@#$%^&*)
              </Text>
            </View>
          </View>

          {/* Campo Confirmar contraseña */}
          <Text style={styles.label}>Confirmar contraseña</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repetí la contraseña"
              placeholderTextColor="#9E9E9E"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (errorMessage) setErrorMessage(null);
              }}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <Text style={styles.showText}>
                {showConfirmPassword ? "Ocultar" : "Mostrar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón Registrarse */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          {/* Enlace para ir a Login */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>¿Ya tenés una cuenta?</Text>
            <TouchableOpacity
              onPress={() => router.replace("/login")}
              disabled={loading}
            >
              <Text style={styles.loginLink}> Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 6,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#E0C8C3",
    fontSize: 14,
  },
  formContainer: {
    padding: 24,
    paddingBottom: 40,
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
  passwordRequirementsContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE5DE",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 6,
    gap: 6,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#555555",
    marginBottom: 2,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: "#777777",
  },
  requirementMet: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#8B2613",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
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
    marginTop: 6,
  },
  footerText: {
    color: "#555555",
    fontSize: 14,
  },
  loginLink: {
    color: "#8B2613",
    fontWeight: "bold",
    fontSize: 14,
  },
});

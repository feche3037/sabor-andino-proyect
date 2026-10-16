import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  // Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mapeo amigable de errores de Firebase Auth
  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code: string }).code;
      switch (code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "El correo o la contraseña son incorrectos.";
        case "auth/invalid-email":
          return "El formato de correo no es válido.";
        case "auth/too-many-requests":
          return "Demasiados intentos fallidos. Intenta más tarde.";
        case "auth/network-request-failed":
          return "Error de red. Verifica tu conexión a internet.";
        default:
          return "Ocurrió un error al iniciar sesión. Intenta nuevamente.";
      }
    }
    return "Error inesperado. Intenta nuevamente.";
  };

  // Función para procesar e iniciar sesión
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, ingresá tu correo y contraseña.",
      );
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // La navegación hacia /home es manejada por el NavigationGate / AuthContext
    } catch (error) {
      Alert.alert("Error de autenticación", getErrorMessage(error));
    } finally {
      setLoading(false);
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

      {/* Formulario de Login */}
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        {/* Campo Correo electrónico */}
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tucorreo@ejemplo.com"
          placeholderTextColor="#9E9E9E"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
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
            onChangeText={setPassword}
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
});

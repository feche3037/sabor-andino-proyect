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
          return "La contraseña debe tener al menos 6 caracteres.";
        case "auth/network-request-failed":
          return "Error de red. Verifica tu conexión a internet.";
        default:
          return "No se pudo completar el registro. Intenta nuevamente.";
      }
    }
    return "Ocurrió un error inesperado durante el registro.";
  };

  // Función para procesar y validar el registro
  const handleRegister = async () => {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, completá todos los campos.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error de contraseña", "Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Contraseña débil",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    try {
      setLoading(true);
      await register(nombre, apellido, email, password);
      // Redirigir a Home directamente ya autenticado
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error de registro", getErrorMessage(error));
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

      {/* Formulario de registro */}
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        {/* Campo Nombre */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor="#9E9E9E"
          value={nombre}
          onChangeText={setNombre}
          editable={!loading}
        />

        {/* Campo Apellido */}
        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu apellido"
          placeholderTextColor="#9E9E9E"
          value={apellido}
          onChangeText={setApellido}
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
          onChangeText={setEmail}
          editable={!loading}
        />

        {/* Campo Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Elegí una contraseña"
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
        <Text style={styles.helperText}>Al menos 6 caracteres.</Text>

        {/* Campo Confirmar contraseña */}
        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Repetí la contraseña"
            placeholderTextColor="#9E9E9E"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 18,
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
  helperText: {
    color: "#777777",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
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
});

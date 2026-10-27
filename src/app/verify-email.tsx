import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, sendVerificationEmail, reloadUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleCheck = async () => {
    try {
      setChecking(true);
      await reloadUser();
      if (user?.emailVerified) {
        Alert.alert("¡Verificado!", "Tu correo ha sido confirmado exitosamente.");
        router.replace("/home");
      } else {
        Alert.alert(
          "Aún no verificado",
          "Por favor revisá tu bandeja de entrada o spam y hacé clic en el enlace de confirmación.",
        );
      }
    } catch {
      Alert.alert("Error", "No pudimos comprobar el estado de verificación.");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await sendVerificationEmail();
      Alert.alert(
        "Correo enviado",
        "Se ha enviado un nuevo enlace de verificación a tu casilla de correo.",
      );
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(
        "Aviso",
        err.message?.includes("too-many-requests")
          ? "Por favor espera unos momentos antes de solicitar otro correo."
          : "Ocurrió un error al reenviar el correo.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header Terracota */}
      <View style={styles.header}>
        <Ionicons name="mail-open-outline" size={56} color="#E8A338" />
        <Text style={styles.headerTitle}>Verificá tu correo</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.instructionText}>
            Hemos enviado un correo de confirmación a:
          </Text>
          <Text style={styles.emailText}>{user?.email || "tu correo"}</Text>
          <Text style={styles.subText}>
            Para acceder a las funciones de Sabor Andino y garantizar la seguridad
            de tu cuenta, hacé clic en el enlace que enviamos a tu bandeja de
            entrada (revisá también spam o correo no deseado).
          </Text>

          {/* Botón Comprobar */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleCheck}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryButtonText}>Ya lo verifiqué</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón Reenviar */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={handleResend}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator color="#7A2214" />
            ) : (
              <>
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color="#7A2214"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.secondaryButtonText}>
                  Reenviar correo de verificación
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cerrar Sesión */}
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Cerrar sesión e ingresar con otra cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: "center",
    paddingVertical: 36,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 12,
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2D9CC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  instructionText: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
  },
  emailText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#7A2214",
    textAlign: "center",
    marginVertical: 8,
  },
  subText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#7A2214",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#7A2214",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: "#7A2214",
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  logoutText: {
    color: "#888888",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

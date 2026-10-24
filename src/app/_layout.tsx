import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "@/context/auth-context";

const WELCOME_SEEN_KEY = "@sabor_andino_has_seen_welcome";

function NavigationGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [checkingWelcome, setCheckingWelcome] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkWelcome() {
      try {
        const val = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
        setHasSeenWelcome(val === "true");
      } catch (err) {
        console.warn("Error leyendo bienvenida:", err);
        setHasSeenWelcome(true);
      } finally {
        setCheckingWelcome(false);
      }
    }
    checkWelcome();
  }, [segments]);

  useEffect(() => {
    if (loading || checkingWelcome) return;

    const currentScreen = segments[0] as string | undefined;

    // 1. Si no ha visto la pantalla de bienvenida y no está autenticado
    if (!hasSeenWelcome && !user) {
      if (currentScreen !== "welcome") {
        router.replace("/welcome");
      }
      return;
    }

    // 2. Si no hay usuario autenticado
    if (!user) {
      if (
        currentScreen !== "login" &&
        currentScreen !== "signup" &&
        currentScreen !== "welcome"
      ) {
        router.replace("/login");
      }
      return;
    }

    // 3. Si hay usuario autenticado pero no ha verificado su correo
    if (!user.emailVerified) {
      if (currentScreen !== "verify-email") {
        router.replace("/verify-email");
      }
      return;
    }

    // 4. Si el usuario está autenticado y verificado
    if (
      currentScreen === "login" ||
      currentScreen === "signup" ||
      currentScreen === "welcome" ||
      currentScreen === "verify-email" ||
      !currentScreen
    ) {
      router.replace("/home");
    }
  }, [user, loading, checkingWelcome, hasSeenWelcome, segments, router]);

  if (loading || checkingWelcome) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2613" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="verify-email" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </NavigationGate>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F4F0EA",
    alignItems: "center",
    justifyContent: "center",
  },
});

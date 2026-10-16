import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "@/context/auth-context";

function NavigationGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentScreen = segments[0] as string | undefined;
    const isAuthScreen = currentScreen === "login" || currentScreen === "signup";

    if (!user && !isAuthScreen) {
      // Redirigir a login si no hay sesión activa
      router.replace("/login");
    } else if (user && isAuthScreen) {
      // Redirigir a home si ya está autenticado y se encuentra en login/signup
      router.replace("/home");
    }
  }, [user, loading, segments, router]);

  if (loading) {
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
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="home" />
          <Stack.Screen name="productores" />
          <Stack.Screen name="productos" />
          <Stack.Screen name="perfil" />
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

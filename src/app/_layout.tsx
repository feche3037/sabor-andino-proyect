import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { DataProvider } from "@/context/data-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Mantiene el splash nativo visible hasta conocer el estado de autenticación
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hide();
  }, [loading]);

  // El splash nativo cubre la pantalla mientras se resuelve la sesión
  if (loading) return null;

  const isGuest = !user;
  const isUnverified = !!user && !user.emailVerified;
  const isVerified = !!user && user.emailVerified;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      <Stack.Protected guard={isGuest}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>

      <Stack.Protected guard={isUnverified}>
        <Stack.Screen name="verify-email" />
      </Stack.Protected>

      <Stack.Protected guard={isVerified}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <DataProvider>
          <RootNavigator />
        </DataProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

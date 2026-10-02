import { Redirect } from "expo-router";

export default function Index() {
  // Redirige automáticamente a /login al abrir la app
  return <Redirect href="/login" />;
}

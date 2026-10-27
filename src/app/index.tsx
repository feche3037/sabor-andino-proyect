import { Redirect } from "expo-router";

import { useAuth } from "@/context/auth-context";

export default function Index() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/welcome" />;
  if (!user.emailVerified) return <Redirect href="/verify-email" />;
  return <Redirect href="/home" />;
}

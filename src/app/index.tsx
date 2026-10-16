import { Redirect } from "expo-router";
import { useAuth } from "@/context/auth-context";

export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? "/home" : "/login"} />;
}

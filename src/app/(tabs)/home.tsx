import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth-context";

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile, user } = useAuth();

  const nombreUsuario =
    userProfile?.nombre || user?.displayName?.split(" ")[0] || "";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#7A2214" />

      {/* Contenido Desplazable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado Rojo Terracota con diseño andino */}
        <View style={styles.header}>
          {/* Logo / Ícono Andino */}
          <View style={styles.logoWrapper}>
            <View style={styles.sunDot} />
            <Ionicons name="shapes" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Sabor Andino</Text>
          <Text style={styles.subtitle}>Especias del Norte</Text>

          {nombreUsuario ? (
            <View style={styles.userGreetingBadge}>
              <Text style={styles.userGreetingText}>
                ¡Hola, {nombreUsuario}!
              </Text>
            </View>
          ) : null}

          {/* Borde inferior decorativo dentado/andino */}
          <View style={styles.teethContainer}>
            {Array.from({ length: 16 }).map((_, index) => (
              <View key={index} style={styles.tooth} />
            ))}
          </View>
        </View>

        {/* Tarjeta de Nuestra Misión */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nuestra misión</Text>
          <Text style={styles.descriptionText}>
            Llevar a cada mesa el sabor del Norte argentino. Acopiamos, secamos
            y molemos pimentón, ají y hierbas de los Valles Calchaquíes, con
            calidad controlada en cada lote y un trato justo con quienes
            cultivan.
          </Text>

          <Text style={styles.footerNote}>
            Desde 2009, junto a los productores de los Valles Calchaquíes.
          </Text>

          {/* Botones de acción rápida */}
          <View style={styles.buttonsContainer}>
            {/* Botón Ver Productores */}
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.8}
              onPress={() => router.push("/productores")}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.actionButtonText}>Ver productores</Text>
            </TouchableOpacity>

            {/* Botón Ver Productos */}
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              activeOpacity={0.8}
              onPress={() => router.push("/productos")}
            >
              <Ionicons
                name="pricetag-outline"
                size={20}
                color="#7A2214"
                style={styles.buttonIcon}
              />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Ver productos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0EA",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: "#7A2214",
    alignItems: "center",
    paddingTop: 36,
    paddingBottom: 28,
    position: "relative",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 8,
  },
  sunDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E8A338",
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#F4E0C8",
    marginTop: 2,
    fontWeight: "500",
  },
  userGreetingBadge: {
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userGreetingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  teethContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    overflow: "hidden",
  },
  tooth: {
    flex: 1,
    height: 10,
    backgroundColor: "#F4F0EA",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 1,
    top: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2D9CC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 22,
    marginBottom: 14,
  },
  footerNote: {
    fontSize: 12,
    color: "#888888",
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "#F0EAE1",
    paddingTop: 10,
    marginBottom: 20,
  },
  buttonsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#7A2214",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#7A2214",
  },
  secondaryButtonText: {
    color: "#7A2214",
  },
  buttonIcon: {
    marginRight: 8,
  },
});

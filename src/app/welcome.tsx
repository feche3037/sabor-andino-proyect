import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export const WELCOME_SEEN_KEY = "@sabor_andino_has_seen_welcome";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleNavigate = async (route: "/login" | "/signup") => {
    try {
      await AsyncStorage.setItem(WELCOME_SEEN_KEY, "true");
    } catch (e) {
      console.warn("Error guardando flag de bienvenida:", e);
    }
    router.replace(route);
  };

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

          {/* Botones de acción principales: Iniciar sesión y Registrarse */}
          <View style={styles.buttonsContainer}>
            {/* Botón Iniciar Sesión */}
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              onPress={() => handleNavigate("/login")}
            >
              <Ionicons
                name="log-in-outline"
                size={22}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.actionButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            {/* Botón Registrarse */}
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              activeOpacity={0.85}
              onPress={() => handleNavigate("/signup")}
            >
              <Ionicons
                name="person-add-outline"
                size={22}
                color="#7A2214"
                style={styles.buttonIcon}
              />
              <Text
                style={[styles.actionButtonText, styles.secondaryButtonText]}
              >
                Registrarse
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
    paddingBottom: 32,
  },
  header: {
    backgroundColor: "#7A2214",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 32,
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
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#F4E0C8",
    marginTop: 4,
    fontWeight: "500",
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
    marginTop: 24,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2D9CC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#555555",
    lineHeight: 24,
    marginBottom: 16,
  },
  footerNote: {
    fontSize: 13,
    color: "#888888",
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "#F0EAE1",
    paddingTop: 12,
    marginBottom: 28,
  },
  buttonsContainer: {
    gap: 14,
  },
  actionButton: {
    backgroundColor: "#7A2214",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: "#7A2214",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#7A2214",
    shadowOpacity: 0.05,
    elevation: 1,
  },
  secondaryButtonText: {
    color: "#7A2214",
  },
  buttonIcon: {
    marginRight: 8,
  },
});


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

export default function HomeScreen() {
  const router = useRouter();

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

          {/* Botón Ver Productores (Abre /productores) */}
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
        </View>
      </ScrollView>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.activeIndicator} />
          <Ionicons name="home" size={22} color="#7A2214" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Inicio</Text>
        </TouchableOpacity>

        {/* Ir a Productores desde la barra inferior */}
        <TouchableOpacity
          onPress={() => router.push("/perfil")}
          activeOpacity={0.7}
          onPress={() => router.push("/productores")}
        >
          <Ionicons name="people-outline" size={22} color="#666666" />
          <Text style={styles.navLabel}>Productores</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={22} color="#666666" />
          <Text style={styles.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 2,
  },
  teethContainer: {
    position: "absolute",
    bottom: -6,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tooth: {
    width: 10,
    height: 6,
    backgroundColor: "#7A2214",
  },
  card: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F1F1F",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
    marginBottom: 16,
  },
  footerNote: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: "#8B2613",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 32,
    height: 4,
    backgroundColor: "#E8A338",
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  activeNavLabel: {
    color: "#7A2214",
    fontWeight: "bold",
  },
});

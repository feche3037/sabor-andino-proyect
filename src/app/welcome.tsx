import { BordeAndino } from "@/components/borde-andino";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 48, 380);

const LOGO_IMG = require("@/assets/images/logo.png");
const IMG1 = require("@/assets/images/img1.png");
const IMG2 = require("@/assets/images/img2.png");
const IMG3 = require("@/assets/images/img3.png");

export default function WelcomeScreen() {
  const router = useRouter();

  const handleEntrar = () => {
    router.push("/login");
  };

  const handleRegistrarse = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Encabezado Principal Terracota (#7A2214) */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={LOGO_IMG}
              style={styles.logo}
              contentFit="contain"
              transition={200}
            />
          </View>

          <Text style={styles.title}>Sabor Andino</Text>
          <Text style={styles.subtitle}>Especias del Norte</Text>

          {/* Botón Principal: "Bienvenido" */}
          <TouchableOpacity
            style={styles.welcomeButton}
            activeOpacity={0.85}
            onPress={handleEntrar}
          >
            <Text style={styles.welcomeButtonText}>Bienvenido</Text>
            <Ionicons name="arrow-forward-outline" size={20} color="#7A2214" />
          </TouchableOpacity>

          {/* Enlace secundario para registrarse */}
          <TouchableOpacity
            style={styles.signupLink}
            activeOpacity={0.7}
            onPress={handleRegistrarse}
          >
            <Text style={styles.signupLinkText}>
              ¿No tenés cuenta? <Text style={styles.signupLinkBold}>Registrate aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Borde andino decorativo */}
        <BordeAndino teethContainer={styles.teethContainer} tooth={styles.tooth} />

        {/* Sección Inferior: Nuestra Misión y Galería de Productos */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeaderRow}>
            <View style={styles.missionBadge}>
              <Ionicons name="leaf-outline" size={16} color="#7A2214" />
              <Text style={styles.missionBadgeText}>Tradición & Calidad</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Nuestra misión</Text>
          <Text style={styles.descriptionText}>
            Llevar a cada mesa el sabor del Norte argentino. Acopiamos, secamos y molemos
            pimentón, ají y hierbas de los Valles Calchaquíes, con calidad controlada en
            cada lote y un trato justo con quienes cultivan la tierra.
          </Text>

          {/* Galería Estética de Imágenes Locales */}
          <View style={styles.galleryContainer}>
            <View style={styles.galleryMainImageWrapper}>
              <Image
                source={IMG1}
                style={styles.galleryMainImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.imageOverlayBadge}>
                <Text style={styles.imageOverlayText}>Pimentón Puro Seleccionado</Text>
              </View>
            </View>

            <View style={styles.galleryRow}>
              <View style={styles.gallerySubImageWrapper}>
                <Image
                  source={IMG2}
                  style={styles.gallerySubImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.imageOverlayBadgeSmall}>
                  <Text style={styles.imageOverlayTextSmall}>Secado al Sol</Text>
                </View>
              </View>

              <View style={styles.gallerySubImageWrapper}>
                <Image
                  source={IMG3}
                  style={styles.gallerySubImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.imageOverlayBadgeSmall}>
                  <Text style={styles.imageOverlayTextSmall}>Valles Calchaquíes</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.footerNote}>
            Desde 2009, junto a los productores de los Valles Calchaquíes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#7A2214",
  },
  scrollContent: {
    paddingBottom: 36,
    alignItems: "center",
  },
  header: {
    width: "100%",
    backgroundColor: "#7A2214",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#7A2214",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#E8A338",
  },
  logo: {
    width: 82,
    height: 82,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    color: "#F4E0C8",
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  welcomeButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    gap: 8,
    minWidth: 200,
  },
  welcomeButtonText: {
    color: "#7A2214",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  signupLink: {
    marginTop: 14,
    paddingVertical: 6,
  },
  signupLinkText: {
    color: "#F4E0C8",
    fontSize: 14,
  },
  signupLinkBold: {
    fontWeight: "bold",
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  teethContainer: {
    flexDirection: "row",
    width: "100%",
    height: 10,
    overflow: "hidden",
    backgroundColor: "#7A2214",
    marginBottom: 16,
  },
  tooth: {
    flex: 1,
    height: 10,
    backgroundColor: "#F4F0EA",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 1,
    top: 6,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2D9CC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  missionHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  missionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF3EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  missionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7A2214",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4A4A4A",
    lineHeight: 22,
    marginBottom: 18,
  },
  galleryContainer: {
    marginBottom: 16,
    gap: 10,
  },
  galleryMainImageWrapper: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F4F0EA",
  },
  galleryMainImage: {
    width: "100%",
    height: "100%",
  },
  galleryRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  gallerySubImageWrapper: {
    flex: 1,
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F4F0EA",
  },
  gallerySubImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlayBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  imageOverlayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  imageOverlayBadgeSmall: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  imageOverlayTextSmall: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  footerNote: {
    fontSize: 12,
    color: "#888888",
    fontStyle: "italic",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0EAE1",
    paddingTop: 12,
    marginTop: 4,
  },
});

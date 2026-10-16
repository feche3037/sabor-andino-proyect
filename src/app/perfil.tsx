import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "@/components/bottom-nav";

export default function PerfilScreen() {
  const router = useRouter();

  // Estados del formulario de perfil
  const [nombre, setNombre] = useState("Luciana");
  const [apellido, setApellido] = useState("Ríos");
  const [email, setEmail] = useState("luciana.rios@ejemplo.com");
  const [telefono, setTelefono] = useState("387 455-0192");
  const [puesto, setPuesto] = useState("Auxiliar administrativa");

  // Generar iniciales dinámicamente según el nombre y apellido
  const iniciales =
    `${nombre.trim()[0] || ""}${apellido.trim()[0] || ""}`.toUpperCase();

  const handleGuardarCambios = () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa al menos Nombre, Apellido y Correo.",
      );
      return;
    }
    Alert.alert(
      "Perfil actualizado",
      "Los datos de tu perfil se guardaron correctamente.",
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#7A2214" />

      {/* Encabezado Rojo Terracota */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi perfil</Text>

        {/* Borde inferior dentado andino */}
        <View style={styles.teethContainer}>
          {Array.from({ length: 16 }).map((_, index) => (
            <View key={index} style={styles.tooth} />
          ))}
        </View>
      </View>

      {/* Contenido Formulario Desplazable */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Encabezado del Perfil (Avatar + Nombre + Etiqueta de Puesto) */}
        <View style={styles.userHeaderRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userNameText}>
              {nombre} {apellido}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {puesto || "Rol no asignado"}
              </Text>
            </View>
          </View>
        </View>

        {/* Campos de Edición */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          value={apellido}
          onChangeText={setApellido}
          placeholder="Tu apellido"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          placeholderTextColor="#999999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Tu número de teléfono"
          placeholderTextColor="#999999"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Puesto</Text>
        <TextInput
          style={styles.input}
          value={puesto}
          onChangeText={setPuesto}
          placeholder="Tu puesto de trabajo"
          placeholderTextColor="#999999"
        />

        {/* Botón Guardar Cambios */}
        <TouchableOpacity
          style={styles.submitButton}
          activeOpacity={0.85}
          onPress={handleGuardarCambios}
        >
          <Text style={styles.submitButtonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra de Navegación Inferior */}
      <BottomNav currentTab="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F0EA",
  },
  header: {
    backgroundColor: "#7A2214",
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  userHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FCF0D3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#7A2214",
    fontWeight: "bold",
    fontSize: 22,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userNameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F1F1F",
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: "#E2EFE0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleBadgeText: {
    color: "#2E6930",
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2B2B2B",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333333",
  },
  submitButton: {
    backgroundColor: "#8B2613",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

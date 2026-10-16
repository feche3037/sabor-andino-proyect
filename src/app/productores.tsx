import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Modal,
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

interface Productor {
  id: string;
  nombre: string;
  localidad: string;
  producto: string;
  iniciales: string;
}

const PRODUCTORES_INICIALES: Productor[] = [
  {
    id: "1",
    nombre: "Marta Guanuco",
    localidad: "Cachi",
    producto: "Pimentón",
    iniciales: "MG",
  },
  {
    id: "2",
    nombre: "Ramón Colque",
    localidad: "Payogasta",
    producto: "Pimentón",
    iniciales: "RC",
  },
  {
    id: "3",
    nombre: "Elvira Choque",
    localidad: "Seclantás",
    producto: "Ají",
    iniciales: "EC",
  },
  {
    id: "4",
    nombre: "Julio Tolaba",
    localidad: "San Carlos",
    producto: "Pimentón y ají",
    iniciales: "JT",
  },
  {
    id: "5",
    nombre: "Aurelio Flores",
    localidad: "Molinos",
    producto: "Pimentón",
    iniciales: "AF",
  },
  {
    id: "6",
    nombre: "Carmen Guaimás",
    localidad: "Angastaco",
    producto: "Comino",
    iniciales: "CG",
  },
  {
    id: "7",
    nombre: "Lucio Condorí",
    localidad: "Cachi",
    producto: "Anís y ají",
    iniciales: "LC",
  },
  {
    id: "8",
    nombre: "Severina Mamaní",
    localidad: "Cafayate",
    producto: "Pimentón",
    iniciales: "SM",
  },
];

export default function ProductoresScreen() {
  const router = useRouter();
  const [productores, setProductores] = useState<Productor[]>(
    PRODUCTORES_INICIALES,
  );
  const [busqueda, setBusqueda] = useState("");

  // Estado para el modal de agregar nuevo productor
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState("");

  // Estado para el modal de ver detalle de productor
  const [modalVerVisible, setModalVerVisible] = useState(false);
  const [productorSeleccionado, setProductorSeleccionado] =
    useState<Productor | null>(null);

  // Filtrado en tiempo real
  const productoresFiltrados = productores.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.localidad.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // Función para abrir el modal de ver detalle
  const handleVerProductor = (productor: Productor) => {
    setProductorSeleccionado(productor);
    setModalVerVisible(true);
  };

  // Función para eliminar/desactivar productor con alerta de confirmación
  const handleEliminarProductor = (productor: Productor) => {
    Alert.alert(
      "Eliminar productor",
      `¿Estás seguro de que deseas eliminar a ${productor.nombre}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setProductores((prev) => prev.filter((p) => p.id !== productor.id));
          },
        },
      ],
    );
  };

  // Función para agregar un nuevo productor
  const handleAgregarProductor = () => {
    if (
      !nuevoNombre.trim() ||
      !nuevaLocalidad.trim() ||
      !nuevoProducto.trim()
    ) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los datos del productor.",
      );
      return;
    }

    // Generar iniciales automáticamente
    const partesNombre = nuevoNombre.trim().split(" ");
    const iniciales =
      partesNombre.length >= 2
        ? `${partesNombre[0][0]}${partesNombre[1][0]}`.toUpperCase()
        : nuevoNombre.trim().substring(0, 2).toUpperCase();

    const nuevo: Productor = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      localidad: nuevaLocalidad.trim(),
      producto: nuevoProducto.trim(),
      iniciales,
    };

    setProductores([nuevo, ...productores]);
    setNuevoNombre("");
    setNuevaLocalidad("");
    setNuevoProducto("");
    setModalAgregarVisible(false);
    Alert.alert("Éxito", "Productor guardado correctamente.");
  };

  // Función para obtener color de etiqueta según el producto
  const getBadgeStyle = (producto: string) => {
    const text = producto.toLowerCase();
    if (text.includes("pimentón") && text.includes("ají")) {
      return { bg: "#E2EFE0", color: "#2E6930" };
    } else if (text.includes("ají")) {
      return { bg: "#FCF3D7", color: "#8A6405" };
    }
    return { bg: "#F8EAE7", color: "#7A2214" };
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#7A2214" />

      {/* Encabezado Rojo Terracota */}
      <View style={styles.header}>
        <Text style={styles.title}>Productores</Text>
        <Text style={styles.subtitle}>
          Mostrando {productoresFiltrados.length} de {productores.length}
        </Text>

        {/* Borde inferior dentado andino */}
        <View style={styles.teethContainer}>
          {Array.from({ length: 16 }).map((_, index) => (
            <View key={index} style={styles.tooth} />
          ))}
        </View>
      </View>

      {/* Campo de Búsqueda */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#777777"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productor o localidad"
            placeholderTextColor="#999999"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={18} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de Productores */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.cardContainer}>
          {productoresFiltrados.map((item, index) => {
            const badge = getBadgeStyle(item.producto);
            return (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index < productoresFiltrados.length - 1 && styles.itemBorder,
                ]}
              >
                {/* Avatar con Iniciales */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.iniciales}</Text>
                </View>

                {/* Información del Productor */}
                <View style={styles.infoContainer}>
                  <View style={styles.topRow}>
                    <Text style={styles.nombreText}>{item.nombre}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>
                        {item.producto}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#777777"
                    />
                    <Text style={styles.localidadText}>{item.localidad}</Text>
                  </View>

                  {/* Acciones */}
                  <View style={styles.actionsRow}>
                    {/* Botón Ver */}
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleVerProductor(item)}
                    >
                      <Ionicons name="eye-outline" size={15} color="#7A2214" />
                      <Text style={styles.actionText}>Ver</Text>
                    </TouchableOpacity>

                    {/* Botón Editar */}
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons
                        name="pencil-outline"
                        size={15}
                        color="#7A2214"
                      />
                      <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>

                    {/* Botón Eliminar / Desactivar */}
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleEliminarProductor(item)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color="#C0392B"
                      />
                      <Text style={[styles.actionText, { color: "#C0392B" }]}>
                        Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Botón Flotante "+ Nuevo productor" */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={() => setModalAgregarVisible(true)}
      >
        <Ionicons name="add-outline" size={24} color="#1F1F1F" />
        <Text style={styles.fabText}>Nuevo productor</Text>
      </TouchableOpacity>

      {/* Modal para Ver Detalle de Productor */}
      <Modal visible={modalVerVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Productor</Text>
              <TouchableOpacity onPress={() => setModalVerVisible(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {productorSeleccionado && (
              <View style={styles.detalleContainer}>
                <View style={[styles.avatar, styles.detalleAvatar]}>
                  <Text style={styles.avatarText}>
                    {productorSeleccionado.iniciales}
                  </Text>
                </View>

                <Text style={styles.detalleNombre}>
                  {productorSeleccionado.nombre}
                </Text>

                <View style={styles.detalleRow}>
                  <Ionicons name="location" size={18} color="#7A2214" />
                  <Text style={styles.detalleLabel}>Localidad:</Text>
                  <Text style={styles.detalleValue}>
                    {productorSeleccionado.localidad}
                  </Text>
                </View>

                <View style={styles.detalleRow}>
                  <Ionicons name="leaf" size={18} color="#2E6930" />
                  <Text style={styles.detalleLabel}>Producto:</Text>
                  <Text style={styles.detalleValue}>
                    {productorSeleccionado.producto}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVerVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para Agregar Nuevo Productor */}
      <Modal
        visible={modalAgregarVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Productor</Text>
              <TouchableOpacity onPress={() => setModalAgregarVisible(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Marta Guanuco"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
            />

            <Text style={styles.inputLabel}>Localidad</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Cachi"
              value={nuevaLocalidad}
              onChangeText={setNuevaLocalidad}
            />

            <Text style={styles.inputLabel}>
              Producto (Pimentón, Ají, etc.)
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Pimentón"
              value={nuevoProducto}
              onChangeText={setNuevoProducto}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalAgregarVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleAgregarProductor}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barra de Navegación Inferior */}
      <BottomNav currentTab="productores" />
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
  subtitle: {
    fontSize: 14,
    color: "#E0C8C3",
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E1DA",
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F2E3DF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#7A2214",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nombreText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1F1F1F",
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  localidadText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7A2214",
  },
  fabButton: {
    position: "absolute",
    bottom: 72,
    right: 20,
    backgroundColor: "#E8A338",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F1F1F",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F1F1F",
  },
  detalleContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  detalleAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
  },
  detalleNombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F1F1F",
    marginBottom: 16,
  },
  detalleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },
  detalleLabel: {
    fontWeight: "bold",
    marginLeft: 8,
    marginRight: 6,
    color: "#333333",
  },
  detalleValue: {
    color: "#555555",
    fontSize: 15,
  },
  closeBtn: {
    backgroundColor: "#7A2214",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginTop: 10,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: "#666666",
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#7A2214",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

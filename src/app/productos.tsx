import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { ColorPicker, PALETA_ANDINA } from "@/components/color-picker";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  suscribirProductos,
} from "@/services/productos.service";
import { Producto } from "@/types";

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modal Crear
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoColor, setNuevoColor] = useState(PALETA_ANDINA[0]);
  const [guardando, setGuardando] = useState(false);

  // Modal Editar
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editColor, setEditColor] = useState(PALETA_ANDINA[0]);

  // Modal Eliminar
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Suscribirse a Firestore en tiempo real
  useEffect(() => {
    const unsubscribe = suscribirProductos(
      (data) => {
        setProductos(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // Crear Producto
  const handleCrear = async () => {
    if (!nuevoNombre.trim()) {
      Alert.alert("Campo obligatorio", "Por favor ingresá el nombre del producto.");
      return;
    }

    try {
      setGuardando(true);
      await crearProducto({
        nombre: nuevoNombre.trim(),
        color: nuevoColor,
      });
      setNuevoNombre("");
      setNuevoColor(PALETA_ANDINA[0]);
      setModalCrearVisible(false);
      Alert.alert("Éxito", "Producto creado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el producto. Intenta nuevamente.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Editar
  const handleAbrirEditar = (prod: Producto) => {
    setProductoAEditar(prod);
    setEditNombre(prod.nombre);
    setEditColor(prod.color || PALETA_ANDINA[0]);
    setModalEditarVisible(true);
  };

  // Guardar Edición
  const handleGuardarEditar = async () => {
    if (!productoAEditar) return;
    if (!editNombre.trim()) {
      Alert.alert("Campo obligatorio", "El nombre no puede estar vacío.");
      return;
    }

    try {
      setGuardando(true);
      await actualizarProducto(productoAEditar.id, {
        nombre: editNombre.trim(),
        color: editColor,
      });
      setModalEditarVisible(false);
      setProductoAEditar(null);
      Alert.alert("Éxito", "Producto actualizado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el producto.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Eliminar
  const handleAbrirEliminar = (prod: Producto) => {
    setProductoAEliminar(prod);
    setModalEliminarVisible(true);
  };

  // Confirmar Eliminación
  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar) return;
    try {
      setEliminando(true);
      await eliminarProducto(productoAEliminar.id);
      setModalEliminarVisible(false);
      setProductoAEliminar(null);
      Alert.alert("Éxito", "Producto eliminado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el producto.");
      console.error(error);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#7A2214" />

      {/* Encabezado Rojo Terracota con guardas andinas */}
      <View style={styles.header}>
        <Text style={styles.title}>Productos</Text>
        <Text style={styles.subtitle}>
          Mostrando {productosFiltrados.length} de {productos.length}
        </Text>

        <View style={styles.teethContainer}>
          {Array.from({ length: 16 }).map((_, index) => (
            <View key={index} style={styles.tooth} />
          ))}
        </View>
      </View>

      {/* Barra de Búsqueda */}
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
            placeholder="Buscar producto..."
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

      {/* Contenido / Lista */}
      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#7A2214" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {productosFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={48} color="#C4B8AB" />
              <Text style={styles.emptyTitle}>
                {busqueda ? "No hay coincidencias" : "No hay productos registrados"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {busqueda
                  ? "Probá con otro término de búsqueda."
                  : "Creá tu primer producto con el botón de abajo."}
              </Text>
            </View>
          ) : (
            <View style={styles.cardContainer}>
              {productosFiltrados.map((item, index) => {
                const itemColor = item.color || "#8B2613";
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.itemRow,
                      index < productosFiltrados.length - 1 && styles.itemBorder,
                    ]}
                  >
                    {/* Indicador de Color */}
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: itemColor },
                      ]}
                    />

                    {/* Información */}
                    <View style={styles.infoContainer}>
                      <View style={styles.topRow}>
                        <Text style={styles.nombreText}>{item.nombre}</Text>
                        <View
                          style={[
                            styles.hexBadge,
                            { backgroundColor: `${itemColor}20` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.hexBadgeText,
                              { color: itemColor },
                            ]}
                          >
                            {itemColor}
                          </Text>
                        </View>
                      </View>

                      {/* Acciones */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleAbrirEditar(item)}
                        >
                          <Ionicons
                            name="pencil-outline"
                            size={15}
                            color="#7A2214"
                          />
                          <Text style={styles.actionText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleAbrirEliminar(item)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={15}
                            color="#C0392B"
                          />
                          <Text
                            style={[styles.actionText, { color: "#C0392B" }]}
                          >
                            Eliminar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Botón Flotante "+ Nuevo producto" */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={() => setModalCrearVisible(true)}
      >
        <Ionicons name="add-outline" size={24} color="#1F1F1F" />
        <Text style={styles.fabText}>Nuevo producto</Text>
      </TouchableOpacity>

      {/* Modal Crear Producto */}
      <Modal visible={modalCrearVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Producto</Text>
              <TouchableOpacity
                onPress={() => setModalCrearVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre del producto</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Pimentón Dulce"
              placeholderTextColor="#999999"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              editable={!guardando}
            />

            <ColorPicker
              selectedColor={nuevoColor}
              onSelectColor={setNuevoColor}
              label="Color identificador"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalCrearVisible(false)}
                disabled={guardando}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, guardando && styles.buttonDisabled]}
                onPress={handleCrear}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Producto */}
      <Modal visible={modalEditarVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Producto</Text>
              <TouchableOpacity
                onPress={() => setModalEditarVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre del producto</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Pimentón Dulce"
              placeholderTextColor="#999999"
              value={editNombre}
              onChangeText={setEditNombre}
              editable={!guardando}
            />

            <ColorPicker
              selectedColor={editColor}
              onSelectColor={setEditColor}
              label="Color identificador"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalEditarVisible(false)}
                disabled={guardando}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, guardando && styles.buttonDisabled]}
                onPress={handleGuardarEditar}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Actualizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Eliminar Producto */}
      <Modal visible={modalEliminarVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.dangerIconContainer}>
                <Ionicons name="warning-outline" size={24} color="#C0392B" />
              </View>
              <Text style={styles.modalTitle}>Eliminar Producto</Text>
              <TouchableOpacity
                onPress={() => setModalEliminarVisible(false)}
                disabled={eliminando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteWarningText}>
              ¿Estás seguro de que deseás eliminar el producto{" "}
              <Text style={{ fontWeight: "bold", color: "#1F1F1F" }}>
                "{productoAEliminar?.nombre}"
              </Text>
              ? Esta acción no se puede deshacer.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalEliminarVisible(false)}
                disabled={eliminando}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteBtn, eliminando && styles.buttonDisabled]}
                onPress={handleConfirmarEliminar}
                disabled={eliminando}
              >
                {eliminando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barra de Navegación Inferior */}
      <BottomNav currentTab="productos" />
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
  loadingArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#777777",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E1DA",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginTop: 4,
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
    alignItems: "center",
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  colorIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
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
  hexBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  hexBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
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
  dangerIconContainer: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F1F1F",
    flex: 1,
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
    color: "#333333",
  },
  deleteWarningText: {
    fontSize: 15,
    color: "#555555",
    lineHeight: 22,
    marginVertical: 14,
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
    minWidth: 90,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  deleteBtn: {
    backgroundColor: "#C0392B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});


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
import { SelectModal, SelectOption } from "@/components/select-modal";
import { LOCALIDADES_SALTA } from "@/constants/localidades-salta";
import {
  actualizarProducto,
  crearProducto,
  suscribirProductos,
} from "@/services/productos.service";
import {
  actualizarProductor,
  crearProductor,
  eliminarProductor,
  suscribirProductores,
} from "@/services/productores.service";
import { Productor, Producto } from "@/types";

export default function ProductoresScreen() {
  const [productores, setProductores] = useState<Productor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Select Modals auxiliares
  const [selectLocalidadVisible, setSelectLocalidadVisible] = useState(false);
  const [selectProductoVisible, setSelectProductoVisible] = useState(false);
  const [targetModal, setTargetModal] = useState<"agregar" | "editar">("agregar");

  // Modal Agregar
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaLocalidad, setNuevaLocalidad] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState<Producto | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Modal Editar
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [productorAEditar, setProductorAEditar] = useState<Productor | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editLocalidad, setEditLocalidad] = useState("");
  const [editProducto, setEditProducto] = useState<Producto | null>(null);

  // Modal Ver Detalle
  const [modalVerVisible, setModalVerVisible] = useState(false);
  const [productorSeleccionado, setProductorSeleccionado] =
    useState<Productor | null>(null);

  // Modal Eliminar
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [productorAEliminar, setProductorAEliminar] = useState<Productor | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Suscribirse a Productores y Productos en Firestore
  useEffect(() => {
    const unsubProductores = suscribirProductores(
      (data) => {
        setProductores(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar productores:", error);
        setLoading(false);
      },
    );

    const unsubProductos = suscribirProductos(
      (data) => {
        setProductos(data);
      },
      (error) => {
        console.error("Error al cargar productos:", error);
      },
    );

    return () => {
      unsubProductores();
      unsubProductos();
    };
  }, []);

  // Opciones para SelectModal
  const opcionesLocalidades: SelectOption[] = LOCALIDADES_SALTA.map((loc) => ({
    id: loc,
    label: loc,
    subtitle: "Salta, Argentina",
  }));

  const opcionesProductos: SelectOption[] = productos.map((prod) => ({
    id: prod.id,
    label: prod.nombre,
    color: prod.color,
  }));

  // Filtrado de productores
  const productoresFiltrados = productores.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.localidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // Abrir Select Localidad
  const handleAbrirSelectLocalidad = (mode: "agregar" | "editar") => {
    setTargetModal(mode);
    setSelectLocalidadVisible(true);
  };

  // Abrir Select Producto
  const handleAbrirSelectProducto = (mode: "agregar" | "editar") => {
    if (productos.length === 0) {
      Alert.alert(
        "Sin productos",
        "Aún no diste de alta ningún producto. Andá a la pestaña 'Productos' para crear uno primero.",
      );
      return;
    }
    setTargetModal(mode);
    setSelectProductoVisible(true);
  };

  // Selección de Localidad
  const handleSeleccionarLocalidad = (option: SelectOption) => {
    if (targetModal === "agregar") {
      setNuevaLocalidad(option.label);
    } else {
      setEditLocalidad(option.label);
    }
  };

  // Selección de Producto
  const handleSeleccionarProducto = (option: SelectOption) => {
    const productoEncontrado = productos.find((p) => p.id === option.id) || null;
    if (targetModal === "agregar") {
      setNuevoProducto(productoEncontrado);
    } else {
      setEditProducto(productoEncontrado);
    }
  };

  // Crear Productor
  const handleAgregarProductor = async () => {
    if (!nuevoNombre.trim() || !nuevaLocalidad.trim() || !nuevoProducto) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa el nombre, localidad y selecciona un producto.",
      );
      return;
    }

    try {
      setGuardando(true);
      await crearProductor({
        nombre: nuevoNombre.trim(),
        localidad: nuevaLocalidad.trim(),
        producto: nuevoProducto,
      });

      setNuevoNombre("");
      setNuevaLocalidad("");
      setNuevoProducto(null);
      setModalAgregarVisible(false);
      Alert.alert("Éxito", "Productor guardado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el productor.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Editar
  const handleAbrirEditar = (productor: Productor) => {
    setProductorAEditar(productor);
    setEditNombre(productor.nombre);
    setEditLocalidad(productor.localidad);
    setEditProducto(productor.producto);
    setModalEditarVisible(true);
  };

  // Guardar Edición
  const handleGuardarEditar = async () => {
    if (!productorAEditar) return;
    if (!editNombre.trim() || !editLocalidad.trim() || !editProducto) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa el nombre, localidad y producto.",
      );
      return;
    }

    try {
      setGuardando(true);
      await actualizarProductor(productorAEditar.id, {
        nombre: editNombre.trim(),
        localidad: editLocalidad.trim(),
        producto: editProducto,
      });

      setModalEditarVisible(false);
      setProductorAEditar(null);
      Alert.alert("Éxito", "Productor actualizado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el productor.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Eliminar
  const handleAbrirEliminar = (productor: Productor) => {
    setProductorAEliminar(productor);
    setModalEliminarVisible(true);
  };

  // Confirmar Eliminación
  const handleConfirmarEliminar = async () => {
    if (!productorAEliminar) return;
    try {
      setEliminando(true);
      await eliminarProductor(productorAEliminar.id);
      setModalEliminarVisible(false);
      setProductorAEliminar(null);
      Alert.alert("Éxito", "Productor eliminado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar el productor.");
      console.error(error);
    } finally {
      setEliminando(false);
    }
  };

  // Abrir Modal Ver
  const handleVerProductor = (productor: Productor) => {
    setProductorSeleccionado(productor);
    setModalVerVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#7A2214" />

      {/* Encabezado Rojo Terracota con guarda andina */}
      <View style={styles.header}>
        <Text style={styles.title}>Productores</Text>
        <Text style={styles.subtitle}>
          Mostrando {productoresFiltrados.length} de {productores.length}
        </Text>

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
            placeholder="Buscar productor, localidad o producto"
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
      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color="#7A2214" />
          <Text style={styles.loadingText}>Cargando productores...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {productoresFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#C4B8AB" />
              <Text style={styles.emptyTitle}>
                {busqueda
                  ? "No hay coincidencias"
                  : "No hay productores registrados"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {busqueda
                  ? "Probá con otro término de búsqueda."
                  : "Registrá tu primer productor con el botón de abajo."}
              </Text>
            </View>
          ) : (
            <View style={styles.cardContainer}>
              {productoresFiltrados.map((item, index) => {
                const prodColor = item.producto?.color || "#8B2613";
                const prodNombre = item.producto?.nombre || "Sin producto";

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
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: `${prodColor}18` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: prodColor },
                            ]}
                          >
                            {prodNombre}
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
                          <Ionicons
                            name="eye-outline"
                            size={15}
                            color="#7A2214"
                          />
                          <Text style={styles.actionText}>Ver</Text>
                        </TouchableOpacity>

                        {/* Botón Editar */}
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

                        {/* Botón Eliminar */}
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
                    {productorSeleccionado.localidad} (Salta)
                  </Text>
                </View>

                <View style={styles.detalleRow}>
                  <Ionicons
                    name="pricetag"
                    size={18}
                    color={productorSeleccionado.producto?.color || "#7A2214"}
                  />
                  <Text style={styles.detalleLabel}>Producto:</Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: `${
                          productorSeleccionado.producto?.color || "#8B2613"
                        }18`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            productorSeleccionado.producto?.color || "#8B2613",
                        },
                      ]}
                    >
                      {productorSeleccionado.producto?.nombre}
                    </Text>
                  </View>
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
              <TouchableOpacity
                onPress={() => setModalAgregarVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Marta Guanuco"
              placeholderTextColor="#999999"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              editable={!guardando}
            />

            <Text style={styles.inputLabel}>Localidad (Salta, Arg)</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleAbrirSelectLocalidad("agregar")}
              disabled={guardando}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !nuevaLocalidad && styles.selectPlaceholder,
                ]}
              >
                {nuevaLocalidad || "Seleccionar localidad de Salta..."}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#777777" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Producto</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleAbrirSelectProducto("agregar")}
              disabled={guardando}
            >
              {nuevoProducto ? (
                <View style={styles.selectedProductRow}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: nuevoProducto.color },
                    ]}
                  />
                  <Text style={styles.selectButtonText}>
                    {nuevoProducto.nombre}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.selectButtonText, styles.selectPlaceholder]}>
                  Seleccionar producto existente...
                </Text>
              )}
              <Ionicons name="chevron-down" size={18} color="#777777" />
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalAgregarVisible(false)}
                disabled={guardando}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, guardando && styles.buttonDisabled]}
                onPress={handleAgregarProductor}
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

      {/* Modal para Editar Productor */}
      <Modal
        visible={modalEditarVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Productor</Text>
              <TouchableOpacity
                onPress={() => setModalEditarVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre completo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Marta Guanuco"
              placeholderTextColor="#999999"
              value={editNombre}
              onChangeText={setEditNombre}
              editable={!guardando}
            />

            <Text style={styles.inputLabel}>Localidad (Salta, Arg)</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleAbrirSelectLocalidad("editar")}
              disabled={guardando}
            >
              <Text style={styles.selectButtonText}>
                {editLocalidad || "Seleccionar localidad..."}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#777777" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Producto</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleAbrirSelectProducto("editar")}
              disabled={guardando}
            >
              {editProducto ? (
                <View style={styles.selectedProductRow}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: editProducto.color },
                    ]}
                  />
                  <Text style={styles.selectButtonText}>
                    {editProducto.nombre}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.selectButtonText, styles.selectPlaceholder]}>
                  Seleccionar producto...
                </Text>
              )}
              <Ionicons name="chevron-down" size={18} color="#777777" />
            </TouchableOpacity>

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

      {/* Modal Eliminar Productor */}
      <Modal
        visible={modalEliminarVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.dangerIconContainer}>
                <Ionicons name="warning-outline" size={24} color="#C0392B" />
              </View>
              <Text style={styles.modalTitle}>Eliminar Productor</Text>
              <TouchableOpacity
                onPress={() => setModalEliminarVisible(false)}
                disabled={eliminando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteWarningText}>
              ¿Estás seguro de que deseás eliminar a{" "}
              <Text style={{ fontWeight: "bold", color: "#1F1F1F" }}>
                "{productorAEliminar?.nombre}"
              </Text>
              ? Esta acción quitará al productor de la base de datos de manera
              permanente.
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

      {/* SelectModal para Localidades de Salta */}
      <SelectModal
        visible={selectLocalidadVisible}
        title="Seleccionar Localidad (Salta)"
        placeholder="Buscar municipio o localidad..."
        options={opcionesLocalidades}
        selectedId={targetModal === "agregar" ? nuevaLocalidad : editLocalidad}
        onSelect={handleSeleccionarLocalidad}
        onClose={() => setSelectLocalidadVisible(false)}
      />

      {/* SelectModal para Productos */}
      <SelectModal
        visible={selectProductoVisible}
        title="Seleccionar Producto"
        placeholder="Buscar producto..."
        options={opcionesProductos}
        selectedId={
          targetModal === "agregar" ? nuevoProducto?.id : editProducto?.id
        }
        onSelect={handleSeleccionarProducto}
        onClose={() => setSelectProductoVisible(false)}
      />

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
    fontWeight: "700",
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
  dangerIconContainer: {
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F1F1F",
    flex: 1,
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
    marginBottom: 10,
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
    marginTop: 12,
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
  selectButton: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 15,
    color: "#333333",
  },
  selectPlaceholder: {
    color: "#999999",
  },
  selectedProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
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

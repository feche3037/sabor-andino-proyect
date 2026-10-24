import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ColorPicker, PALETA_ANDINA } from "@/components/color-picker";
import { SelectModal, SelectOption } from "@/components/select-modal";
import { suscribirProductores } from "@/services/productores.service";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  suscribirProductos,
} from "@/services/productos.service";
import { subirImagen } from "@/services/storage.service";
import { Producto, Productor } from "@/types";
import { validarNombre, validarNumero } from "@/utils/validations";

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productores, setProductores] = useState<Productor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Select Modal de Productores (N:M)
  const [selectProductoresVisible, setSelectProductoresVisible] = useState(false);
  const [targetModal, setTargetModal] = useState<"crear" | "editar">("crear");

  // Modal Crear
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoColor, setNuevoColor] = useState(PALETA_ANDINA[0]);
  const [nuevoLote, setNuevoLote] = useState("");
  const [nuevoStock, setNuevoStock] = useState("");
  const [nuevaPresentacion, setNuevaPresentacion] = useState("");
  const [nuevosProductoresIds, setNuevosProductoresIds] = useState<string[]>([]);
  const [nuevaFotoUri, setNuevaFotoUri] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Modal Editar
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editColor, setEditColor] = useState(PALETA_ANDINA[0]);
  const [editLote, setEditLote] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editPresentacion, setEditPresentacion] = useState("");
  const [editProductoresIds, setEditProductoresIds] = useState<string[]>([]);
  const [editFotoUri, setEditFotoUri] = useState<string | null>(null);

  // Modal Ver Detalle
  const [modalVerVisible, setModalVerVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  // Modal Eliminar
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Suscribirse a Firestore en tiempo real
  useEffect(() => {
    const unsubProductos = suscribirProductos(
      (data) => {
        setProductos(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      },
    );

    const unsubProductores = suscribirProductores(
      (data) => {
        setProductores(data);
      },
      (error) => {
        console.error("Error al cargar productores:", error);
      },
    );

    return () => {
      unsubProductos();
      unsubProductores();
    };
  }, []);

  const opcionesProductores: SelectOption[] = productores.map((prod) => ({
    id: prod.id,
    label: prod.nombre,
    subtitle: `${prod.localidad}, Salta`,
  }));

  const getProductoresDelProducto = (prod: Producto): Productor[] => {
    return productores.filter((p) => {
      const pProdIds =
        p.productosIds || (p.producto?.id ? [p.producto.id] : []);
      const enProductor = pProdIds.includes(prod.id);
      const enProducto = (prod.productoresIds || []).includes(p.id);
      return enProductor || enProducto;
    });
  };

  const productosFiltrados = productos.filter((p) => {
    const prodsAsoc = getProductoresDelProducto(p);
    const nombresProd = prodsAsoc.map((pr) => pr.nombre.toLowerCase()).join(" ");
    const q = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.lote && p.lote.toLowerCase().includes(q)) ||
      (p.presentacion && p.presentacion.toLowerCase().includes(q)) ||
      nombresProd.includes(q)
    );
  });

  // Selector de imagen
  const handlePickImage = async (mode: "crear" | "editar") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos requeridos", "Acceso a la galería requerido.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets[0].uri) {
      if (mode === "crear") {
        setNuevaFotoUri(res.assets[0].uri);
      } else {
        setEditFotoUri(res.assets[0].uri);
      }
    }
  };

  // Crear Producto
  const handleCrear = async () => {
    const errNom = validarNombre(nuevoNombre);
    if (errNom) {
      Alert.alert("Nombre inválido", errNom);
      return;
    }

    if (nuevoStock.trim()) {
      const errStock = validarNumero(nuevoStock, "El stock");
      if (errStock) {
        Alert.alert("Stock inválido", errStock);
        return;
      }
    }

    try {
      setGuardando(true);
      let fotoUrl: string | null = null;
      if (nuevaFotoUri) {
        fotoUrl = await subirImagen(
          nuevaFotoUri,
          `productos/${Date.now()}_foto.jpg`,
        );
      }

      await crearProducto({
        nombre: nuevoNombre.trim(),
        color: nuevoColor,
        lote: nuevoLote.trim(),
        stock: nuevoStock ? Number(nuevoStock) : 0,
        presentacion: nuevaPresentacion.trim(),
        productoresIds: nuevosProductoresIds,
        fotoUrl,
      });

      // Reset
      setNuevoNombre("");
      setNuevoColor(PALETA_ANDINA[0]);
      setNuevoLote("");
      setNuevoStock("");
      setNuevaPresentacion("");
      setNuevosProductoresIds([]);
      setNuevaFotoUri(null);
      setModalCrearVisible(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el producto. Intenta nuevamente.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Editar
  const handleAbrirEditar = (prod: Producto) => {
    const asocIds = getProductoresDelProducto(prod).map((p) => p.id);
    setProductoAEditar(prod);
    setEditNombre(prod.nombre);
    setEditColor(prod.color || PALETA_ANDINA[0]);
    setEditLote(prod.lote || "");
    setEditStock(prod.stock !== undefined ? String(prod.stock) : "");
    setEditPresentacion(prod.presentacion || "");
    setEditProductoresIds(asocIds);
    setEditFotoUri(prod.fotoUrl || null);
    setModalEditarVisible(true);
  };

  // Guardar Edición
  const handleGuardarEditar = async () => {
    if (!productoAEditar) return;
    const errNom = validarNombre(editNombre);
    if (errNom) {
      Alert.alert("Nombre inválido", errNom);
      return;
    }

    if (editStock.trim()) {
      const errStock = validarNumero(editStock, "El stock");
      if (errStock) {
        Alert.alert("Stock inválido", errStock);
        return;
      }
    }

    try {
      setGuardando(true);
      let fotoUrl = productoAEditar.fotoUrl || null;
      if (editFotoUri && editFotoUri !== productoAEditar.fotoUrl) {
        fotoUrl = await subirImagen(
          editFotoUri,
          `productos/${productoAEditar.id}_foto.jpg`,
        );
      }

      await actualizarProducto(productoAEditar.id, {
        nombre: editNombre.trim(),
        color: editColor,
        lote: editLote.trim(),
        stock: editStock ? Number(editStock) : 0,
        presentacion: editPresentacion.trim(),
        productoresIds: editProductoresIds,
        fotoUrl,
      });

      setModalEditarVisible(false);
      setProductoAEditar(null);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el producto.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar Eliminar
  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar) return;
    try {
      setEliminando(true);
      await eliminarProducto(productoAEliminar.id);
      setModalEliminarVisible(false);
      setProductoAEliminar(null);
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Productos</Text>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => setModalCrearVisible(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8, opacity: 0.8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, lote o presentación..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Borde andino */}
        <View style={styles.teethContainer}>
          {Array.from({ length: 16 }).map((_, i) => (
            <View key={i} style={styles.tooth} />
          ))}
        </View>
      </View>

      {/* Listado */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A2214" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {productosFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No hay productos registrados.</Text>
            </View>
          ) : (
            productosFiltrados.map((prod) => {
              const productoresAsociados = getProductoresDelProducto(prod);
              return (
                <View key={prod.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    {/* Foto o Muestra de Color */}
                    {prod.fotoUrl ? (
                      <Image
                        source={{ uri: prod.fotoUrl }}
                        style={styles.avatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.colorSquare,
                          { backgroundColor: prod.color || "#7A2214" },
                        ]}
                      >
                        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                      </View>
                    )}

                    <View style={styles.cardInfo}>
                      <Text style={styles.prodNombre}>{prod.nombre}</Text>
                      <View style={styles.metaRow}>
                        {prod.presentacion ? (
                          <Text style={styles.prodMeta}>
                            {prod.presentacion}
                          </Text>
                        ) : null}
                        {prod.lote ? (
                          <>
                            <Text style={styles.metaDivider}>•</Text>
                            <Text style={styles.prodMeta}>
                              Lote: {prod.lote}
                            </Text>
                          </>
                        ) : null}
                      </View>
                    </View>

                    {/* Stock Badge */}
                    <View
                      style={[
                        styles.stockBadge,
                        (prod.stock || 0) < 10
                          ? styles.stockLow
                          : styles.stockOk,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stockText,
                          (prod.stock || 0) < 10
                            ? styles.stockTextLow
                            : styles.stockTextOk,
                        ]}
                      >
                        {prod.stock !== undefined ? `${prod.stock} u.` : "0 u."}
                      </Text>
                    </View>

                    {/* Acciones */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          setProductoSeleccionado(prod);
                          setModalVerVisible(true);
                        }}
                      >
                        <Ionicons name="eye-outline" size={18} color="#555555" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleAbrirEditar(prod)}
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={18}
                          color="#7A2214"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          setProductoAEliminar(prod);
                          setModalEliminarVisible(true);
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#D32F2F"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Productores asociados (N:M) */}
                  <View style={styles.productoresChipsRow}>
                    {productoresAsociados.length > 0 ? (
                      productoresAsociados.map((p) => (
                        <View key={p.id} style={styles.productorChip}>
                          <Ionicons
                            name="person-outline"
                            size={12}
                            color="#7A2214"
                          />
                          <Text style={styles.productorChipText}>
                            {p.nombre} ({p.localidad})
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.sinProductoresText}>
                        Sin productores asignados
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Select Productores Modal (N:M) */}
      <SelectModal
        visible={selectProductoresVisible}
        title="Asignar Productores"
        options={opcionesProductores}
        multiple={true}
        selectedIds={
          targetModal === "crear" ? nuevosProductoresIds : editProductoresIds
        }
        onSelectMultiple={(opts) => {
          const ids = opts.map((o) => o.id);
          if (targetModal === "crear") {
            setNuevosProductoresIds(ids);
          } else {
            setEditProductoresIds(ids);
          }
        }}
        onClose={() => setSelectProductoresVisible(false)}
      />

      {/* Modal Crear Producto */}
      <Modal
        visible={modalCrearVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalCrearVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.formModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Producto</Text>
              <TouchableOpacity
                onPress={() => setModalCrearVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Foto de Producto */}
              <View style={styles.imagePickerRow}>
                <TouchableOpacity
                  style={styles.imagePickerBtn}
                  onPress={() => handlePickImage("crear")}
                  disabled={guardando}
                >
                  {nuevaFotoUri ? (
                    <Image
                      source={{ uri: nuevaFotoUri }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons name="camera-outline" size={28} color="#7A2214" />
                      <Text style={styles.imagePickerText}>Subir Foto</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nombre del producto *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej: Pimentón de Cachi"
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Presentación</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej: Molido fino al vacío 250g"
                value={nuevaPresentacion}
                onChangeText={setNuevaPresentacion}
                editable={!guardando}
              />

              <View style={styles.twoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Lote</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Ej: L-2026-01"
                    value={nuevoLote}
                    onChangeText={setNuevoLote}
                    editable={!guardando}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Stock (unidades/kg)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Ej: 100"
                    keyboardType="numeric"
                    value={nuevoStock}
                    onChangeText={setNuevoStock}
                    editable={!guardando}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Productores vinculados (N:M)</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => {
                  setTargetModal("crear");
                  setSelectProductoresVisible(true);
                }}
              >
                <Text
                  style={
                    nuevosProductoresIds.length > 0
                      ? styles.selectText
                      : styles.selectPlaceholder
                  }
                >
                  {nuevosProductoresIds.length > 0
                    ? `${nuevosProductoresIds.length} productores asignados`
                    : "Seleccionar productores..."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#777777" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Color representativo</Text>
              <ColorPicker
                selectedColor={nuevoColor}
                onSelectColor={setNuevoColor}
              />

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  guardando && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleCrear}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Crear Producto</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Editar Producto */}
      <Modal
        visible={modalEditarVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalEditarVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.formModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Producto</Text>
              <TouchableOpacity
                onPress={() => setModalEditarVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Foto de Producto */}
              <View style={styles.imagePickerRow}>
                <TouchableOpacity
                  style={styles.imagePickerBtn}
                  onPress={() => handlePickImage("editar")}
                  disabled={guardando}
                >
                  {editFotoUri ? (
                    <Image
                      source={{ uri: editFotoUri }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons name="camera-outline" size={28} color="#7A2214" />
                      <Text style={styles.imagePickerText}>Cambiar Foto</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nombre del producto *</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editNombre}
                onChangeText={setEditNombre}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Presentación</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editPresentacion}
                onChangeText={setEditPresentacion}
                editable={!guardando}
              />

              <View style={styles.twoCols}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Lote</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editLote}
                    onChangeText={setEditLote}
                    editable={!guardando}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Stock</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    value={editStock}
                    onChangeText={setEditStock}
                    editable={!guardando}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Productores vinculados (N:M)</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => {
                  setTargetModal("editar");
                  setSelectProductoresVisible(true);
                }}
              >
                <Text style={styles.selectText}>
                  {editProductoresIds.length > 0
                    ? `${editProductoresIds.length} productores asignados`
                    : "Seleccionar productores..."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#777777" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Color representativo</Text>
              <ColorPicker
                selectedColor={editColor}
                onSelectColor={setEditColor}
              />

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  guardando && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleGuardarEditar}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Guardar Cambios</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Ver Detalle Producto */}
      <Modal
        visible={modalVerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ficha del Producto</Text>
              <TouchableOpacity onPress={() => setModalVerVisible(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {productoSeleccionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailAvatarRow}>
                  {productoSeleccionado.fotoUrl ? (
                    <Image
                      source={{ uri: productoSeleccionado.fotoUrl }}
                      style={styles.detailAvatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.detailColorSquare,
                        {
                          backgroundColor:
                            productoSeleccionado.color || "#7A2214",
                        },
                      ]}
                    >
                      <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                    </View>
                  )}
                  <Text style={styles.detailName}>
                    {productoSeleccionado.nombre}
                  </Text>
                  {productoSeleccionado.presentacion ? (
                    <Text style={styles.detailSubtitle}>
                      {productoSeleccionado.presentacion}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Inventario & Lote
                  </Text>
                  <View style={styles.detailInfoRow}>
                    <Ionicons name="cube-outline" size={16} color="#7A2214" />
                    <Text style={styles.detailInfoText}>
                      Stock disponible:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {productoSeleccionado.stock !== undefined
                          ? `${productoSeleccionado.stock} unidades`
                          : "0"}
                      </Text>
                    </Text>
                  </View>
                  {productoSeleccionado.lote ? (
                    <View style={styles.detailInfoRow}>
                      <Ionicons
                        name="barcode-outline"
                        size={16}
                        color="#7A2214"
                      />
                      <Text style={styles.detailInfoText}>
                        Número de lote: {productoSeleccionado.lote}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Productores que lo entregan
                  </Text>
                  <View style={styles.chipsWrap}>
                    {getProductoresDelProducto(productoSeleccionado).map(
                      (p) => (
                        <View key={p.id} style={styles.productorChip}>
                          <Ionicons
                            name="person-outline"
                            size={12}
                            color="#7A2214"
                          />
                          <Text style={styles.productorChipText}>
                            {p.nombre} ({p.localidad})
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Confirmar Eliminar */}
      <Modal
        visible={modalEliminarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEliminarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Ionicons name="warning-outline" size={36} color="#D32F2F" />
            <Text style={styles.confirmTitle}>¿Eliminar producto?</Text>
            <Text style={styles.confirmMsg}>
              Se eliminará &ldquo;{productoAEliminar?.nombre}&rdquo;. Esta acción no se
              puede deshacer.
            </Text>
            <View style={styles.confirmButtons}>
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
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.deleteBtnText}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    position: "relative",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8A338",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  teethContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    overflow: "hidden",
  },
  tooth: {
    flex: 1,
    height: 8,
    backgroundColor: "#F4F0EA",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 1,
    top: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 12,
  },
  emptyText: {
    color: "#888888",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2D9CC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  prodNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C2C2C",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  prodMeta: {
    fontSize: 12,
    color: "#777777",
  },
  metaDivider: {
    fontSize: 12,
    color: "#BBBBBB",
    marginHorizontal: 2,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  stockOk: {
    backgroundColor: "#E8F5E9",
  },
  stockLow: {
    backgroundColor: "#FFEBEE",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  stockTextOk: {
    color: "#2E7D32",
  },
  stockTextLow: {
    color: "#C62828",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F7F5F2",
  },
  productoresChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F4F0EA",
  },
  productorChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#F9EDE8",
    gap: 4,
  },
  productorChipText: {
    fontSize: 11,
    color: "#7A2214",
    fontWeight: "600",
  },
  sinProductoresText: {
    fontSize: 12,
    color: "#999999",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  formModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C2C2C",
  },
  imagePickerRow: {
    alignItems: "center",
    marginBottom: 14,
  },
  imagePickerBtn: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2D9CC",
    borderStyle: "dashed",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF8F5",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePickerPlaceholder: {
    alignItems: "center",
  },
  imagePickerText: {
    fontSize: 10,
    color: "#7A2214",
    fontWeight: "600",
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444444",
    marginBottom: 4,
    marginTop: 10,
  },
  modalTextInput: {
    backgroundColor: "#F9F8F6",
    borderWidth: 1,
    borderColor: "#E2DCD5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333333",
  },
  twoCols: {
    flexDirection: "row",
    gap: 12,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F8F6",
    borderWidth: 1,
    borderColor: "#E2DCD5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  selectText: {
    fontSize: 14,
    color: "#333333",
  },
  selectPlaceholder: {
    fontSize: 14,
    color: "#999999",
  },
  modalSubmitBtn: {
    backgroundColor: "#7A2214",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  modalSubmitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 40,
    maxHeight: "80%",
  },
  detailAvatarRow: {
    alignItems: "center",
    marginVertical: 12,
  },
  detailAvatarImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  detailColorSquare: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  detailName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginTop: 8,
  },
  detailSubtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 2,
  },
  detailSection: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
    marginTop: 10,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#7A2214",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  detailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  detailInfoText: {
    fontSize: 14,
    color: "#444444",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  confirmCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 40,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginTop: 8,
    marginBottom: 6,
  },
  confirmMsg: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 18,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#F4F0EA",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#555555",
    fontWeight: "600",
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#D32F2F",
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

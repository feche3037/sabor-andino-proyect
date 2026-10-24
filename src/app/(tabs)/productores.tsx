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

import { SelectModal, SelectOption } from "@/components/select-modal";
import { LOCALIDADES_SALTA } from "@/constants/localidades-salta";
import {
  actualizarProductor,
  crearProductor,
  eliminarProductor,
  suscribirProductores,
} from "@/services/productores.service";
import { suscribirProductos } from "@/services/productos.service";
import { subirImagen } from "@/services/storage.service";
import { Producto, Productor } from "@/types";
import { validarCelular, validarNombre } from "@/utils/validations";

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
  const [nuevosProductosIds, setNuevosProductosIds] = useState<string[]>([]);
  const [nuevaDireccion, setNuevaDireccion] = useState("");
  const [nuevoCelular, setNuevoCelular] = useState("");
  const [nuevoInstagram, setNuevoInstagram] = useState("");
  const [nuevoFacebook, setNuevoFacebook] = useState("");
  const [nuevaFotoUri, setNuevaFotoUri] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Modal Editar
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [productorAEditar, setProductorAEditar] = useState<Productor | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editLocalidad, setEditLocalidad] = useState("");
  const [editProductosIds, setEditProductosIds] = useState<string[]>([]);
  const [editDireccion, setEditDireccion] = useState("");
  const [editCelular, setEditCelular] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editFotoUri, setEditFotoUri] = useState<string | null>(null);

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

  const getProductosDelProductor = (p: Productor): Producto[] => {
    const ids = p.productosIds || (p.producto?.id ? [p.producto.id] : []);
    return productos.filter((prod) => ids.includes(prod.id));
  };

  // Filtrado de productores
  const productoresFiltrados = productores.filter((p) => {
    const prods = getProductosDelProductor(p);
    const nombresProds = prods.map((pr) => pr.nombre.toLowerCase()).join(" ");
    const q = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.localidad.toLowerCase().includes(q) ||
      (p.celular && p.celular.includes(q)) ||
      nombresProds.includes(q)
    );
  });

  // Selector de imagen
  const handlePickImage = async (mode: "agregar" | "editar") => {
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
      if (mode === "agregar") {
        setNuevaFotoUri(res.assets[0].uri);
      } else {
        setEditFotoUri(res.assets[0].uri);
      }
    }
  };

  // Guardar Nuevo Productor
  const handleGuardarNuevo = async () => {
    const errNom = validarNombre(nuevoNombre);
    if (errNom) {
      Alert.alert("Nombre inválido", errNom);
      return;
    }

    if (!nuevaLocalidad) {
      Alert.alert("Localidad requerida", "Por favor seleccioná una localidad.");
      return;
    }

    const errCel = validarCelular(nuevoCelular);
    if (errCel) {
      Alert.alert("Celular inválido", errCel);
      return;
    }

    try {
      setGuardando(true);
      let fotoUrl: string | null = null;
      if (nuevaFotoUri) {
        fotoUrl = await subirImagen(
          nuevaFotoUri,
          `productores/${Date.now()}_foto.jpg`,
        );
      }

      await crearProductor({
        nombre: nuevoNombre.trim(),
        localidad: nuevaLocalidad,
        productosIds: nuevosProductosIds,
        direccion: nuevaDireccion.trim(),
        celular: nuevoCelular.trim(),
        redesSociales: {
          instagram: nuevoInstagram.trim(),
          facebook: nuevoFacebook.trim(),
        },
        fotoUrl,
      });

      // Reset
      setNuevoNombre("");
      setNuevaLocalidad("");
      setNuevosProductosIds([]);
      setNuevaDireccion("");
      setNuevoCelular("");
      setNuevoInstagram("");
      setNuevoFacebook("");
      setNuevaFotoUri(null);
      setModalAgregarVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar el productor.");
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Modal Editar
  const handleAbrirEditar = (prod: Productor) => {
    setProductorAEditar(prod);
    setEditNombre(prod.nombre);
    setEditLocalidad(prod.localidad);
    setEditProductosIds(
      prod.productosIds || (prod.producto?.id ? [prod.producto.id] : []),
    );
    setEditDireccion(prod.direccion || "");
    setEditCelular(prod.celular || "");
    setEditInstagram(prod.redesSociales?.instagram || "");
    setEditFacebook(prod.redesSociales?.facebook || "");
    setEditFotoUri(prod.fotoUrl || null);
    setModalEditarVisible(true);
  };

  // Guardar Cambios Editar
  const handleGuardarEditar = async () => {
    if (!productorAEditar) return;

    const errNom = validarNombre(editNombre);
    if (errNom) {
      Alert.alert("Nombre inválido", errNom);
      return;
    }

    if (!editLocalidad) {
      Alert.alert("Localidad requerida", "Por favor seleccioná una localidad.");
      return;
    }

    const errCel = validarCelular(editCelular);
    if (errCel) {
      Alert.alert("Celular inválido", errCel);
      return;
    }

    try {
      setGuardando(true);
      let fotoUrl = productorAEditar.fotoUrl || null;
      if (editFotoUri && editFotoUri !== productorAEditar.fotoUrl) {
        fotoUrl = await subirImagen(
          editFotoUri,
          `productores/${productorAEditar.id}_foto.jpg`,
        );
      }

      await actualizarProductor(productorAEditar.id, {
        nombre: editNombre.trim(),
        localidad: editLocalidad,
        productosIds: editProductosIds,
        direccion: editDireccion.trim(),
        celular: editCelular.trim(),
        redesSociales: {
          instagram: editInstagram.trim(),
          facebook: editFacebook.trim(),
        },
        fotoUrl,
      });

      setModalEditarVisible(false);
      setProductorAEditar(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar el productor.");
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar Eliminar
  const handleConfirmarEliminar = async () => {
    if (!productorAEliminar) return;
    try {
      setEliminando(true);
      await eliminarProductor(productorAEliminar.id);
      setModalEliminarVisible(false);
      setProductorAEliminar(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar el productor.");
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
          <Text style={styles.title}>Productores</Text>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => setModalAgregarVisible(true)}
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
            placeholder="Buscar por productor, localidad o producto..."
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
          {productoresFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>No hay productores registrados.</Text>
            </View>
          ) : (
            productoresFiltrados.map((prod) => {
              const prodsAsociados = getProductosDelProductor(prod);
              return (
                <View key={prod.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    {/* Foto o Iniciales */}
                    {prod.fotoUrl ? (
                      <Image
                        source={{ uri: prod.fotoUrl }}
                        style={styles.avatarImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.avatarBadge}>
                        <Text style={styles.avatarText}>{prod.iniciales}</Text>
                      </View>
                    )}

                    <View style={styles.cardInfo}>
                      <Text style={styles.prodNombre}>{prod.nombre}</Text>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color="#777777"
                        />
                        <Text style={styles.prodMeta}>{prod.localidad}</Text>
                        {prod.celular ? (
                          <>
                            <Text style={styles.metaDivider}>•</Text>
                            <Ionicons
                              name="call-outline"
                              size={13}
                              color="#777777"
                            />
                            <Text style={styles.prodMeta}>{prod.celular}</Text>
                          </>
                        ) : null}
                      </View>
                    </View>

                    {/* Acciones */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          setProductorSeleccionado(prod);
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
                          setProductorAEliminar(prod);
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

                  {/* Badges de Productos asociados (N:M) */}
                  <View style={styles.productosChipsRow}>
                    {prodsAsociados.length > 0 ? (
                      prodsAsociados.map((pr) => (
                        <View
                          key={pr.id}
                          style={[
                            styles.productoChip,
                            { borderColor: pr.color || "#7A2214" },
                          ]}
                        >
                          <View
                            style={[
                              styles.chipDot,
                              { backgroundColor: pr.color || "#7A2214" },
                            ]}
                          />
                          <Text style={styles.chipText}>{pr.nombre}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.sinProductosText}>
                        Sin productos vinculados
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Select Localidad Modal */}
      <SelectModal
        visible={selectLocalidadVisible}
        title="Seleccionar Localidad"
        options={opcionesLocalidades}
        selectedId={
          targetModal === "agregar" ? nuevaLocalidad : editLocalidad
        }
        onSelect={(opt) => {
          if (targetModal === "agregar") {
            setNuevaLocalidad(opt.id);
          } else {
            setEditLocalidad(opt.id);
          }
        }}
        onClose={() => setSelectLocalidadVisible(false)}
      />

      {/* Select Productos Múltiples Modal (N:M) */}
      <SelectModal
        visible={selectProductoVisible}
        title="Vincular Productos"
        options={opcionesProductos}
        multiple={true}
        selectedIds={
          targetModal === "agregar" ? nuevosProductosIds : editProductosIds
        }
        onSelectMultiple={(opts) => {
          const ids = opts.map((o) => o.id);
          if (targetModal === "agregar") {
            setNuevosProductosIds(ids);
          } else {
            setEditProductosIds(ids);
          }
        }}
        onClose={() => setSelectProductoVisible(false)}
      />

      {/* Modal Agregar Productor */}
      <Modal
        visible={modalAgregarVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalAgregarVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.formModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Productor</Text>
              <TouchableOpacity
                onPress={() => setModalAgregarVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Foto de Productor */}
              <View style={styles.imagePickerRow}>
                <TouchableOpacity
                  style={styles.imagePickerBtn}
                  onPress={() => handlePickImage("agregar")}
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

              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej: Marta Guanuco"
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Localidad *</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => {
                  setTargetModal("agregar");
                  setSelectLocalidadVisible(true);
                }}
              >
                <Text
                  style={
                    nuevaLocalidad ? styles.selectText : styles.selectPlaceholder
                  }
                >
                  {nuevaLocalidad || "Seleccionar localidad..."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#777777" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Productos que cultiva (N:M)</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => {
                  setTargetModal("agregar");
                  setSelectProductoVisible(true);
                }}
              >
                <Text
                  style={
                    nuevosProductosIds.length > 0
                      ? styles.selectText
                      : styles.selectPlaceholder
                  }
                >
                  {nuevosProductosIds.length > 0
                    ? `${nuevosProductosIds.length} productos seleccionados`
                    : "Seleccionar productos..."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#777777" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Dirección / Finca</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej: Ruta 40 Km 4480"
                value={nuevaDireccion}
                onChangeText={setNuevaDireccion}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Celular / WhatsApp</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej: 387 512-3456"
                keyboardType="phone-pad"
                value={nuevoCelular}
                onChangeText={setNuevoCelular}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej: @martaguanuco_especias"
                autoCapitalize="none"
                value={nuevoInstagram}
                onChangeText={setNuevoInstagram}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Facebook</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ej: Marta Guanuco Valles"
                value={nuevoFacebook}
                onChangeText={setNuevoFacebook}
                editable={!guardando}
              />

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  guardando && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleGuardarNuevo}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Guardar Productor</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Editar Productor */}
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
              <Text style={styles.modalTitle}>Editar Productor</Text>
              <TouchableOpacity
                onPress={() => setModalEditarVisible(false)}
                disabled={guardando}
              >
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Foto de Productor */}
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

              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editNombre}
                onChangeText={setEditNombre}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Localidad *</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => {
                  setTargetModal("editar");
                  setSelectLocalidadVisible(true);
                }}
              >
                <Text style={styles.selectText}>{editLocalidad}</Text>
                <Ionicons name="chevron-down" size={18} color="#777777" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Productos que cultiva (N:M)</Text>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => {
                  setTargetModal("editar");
                  setSelectProductoVisible(true);
                }}
              >
                <Text style={styles.selectText}>
                  {editProductosIds.length > 0
                    ? `${editProductosIds.length} productos seleccionados`
                    : "Seleccionar productos..."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#777777" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Dirección / Finca</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editDireccion}
                onChangeText={setEditDireccion}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Celular / WhatsApp</Text>
              <TextInput
                style={styles.modalTextInput}
                keyboardType="phone-pad"
                value={editCelular}
                onChangeText={setEditCelular}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editInstagram}
                onChangeText={setEditInstagram}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Facebook</Text>
              <TextInput
                style={styles.modalTextInput}
                value={editFacebook}
                onChangeText={setEditFacebook}
                editable={!guardando}
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

      {/* Modal Ver Detalle */}
      <Modal
        visible={modalVerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ficha del Productor</Text>
              <TouchableOpacity onPress={() => setModalVerVisible(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {productorSeleccionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailAvatarRow}>
                  {productorSeleccionado.fotoUrl ? (
                    <Image
                      source={{ uri: productorSeleccionado.fotoUrl }}
                      style={styles.detailAvatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.detailAvatarBadge}>
                      <Text style={styles.detailAvatarText}>
                        {productorSeleccionado.iniciales}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.detailName}>
                    {productorSeleccionado.nombre}
                  </Text>
                  <Text style={styles.detailLoc}>
                    {productorSeleccionado.localidad}, Salta
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Contacto</Text>
                  {productorSeleccionado.direccion ? (
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="home-outline" size={16} color="#7A2214" />
                      <Text style={styles.detailInfoText}>
                        {productorSeleccionado.direccion}
                      </Text>
                    </View>
                  ) : null}
                  {productorSeleccionado.celular ? (
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="call-outline" size={16} color="#7A2214" />
                      <Text style={styles.detailInfoText}>
                        {productorSeleccionado.celular}
                      </Text>
                    </View>
                  ) : null}
                  {productorSeleccionado.redesSociales?.instagram ? (
                    <View style={styles.detailInfoRow}>
                      <Ionicons
                        name="logo-instagram"
                        size={16}
                        color="#7A2214"
                      />
                      <Text style={styles.detailInfoText}>
                        {productorSeleccionado.redesSociales.instagram}
                      </Text>
                    </View>
                  ) : null}
                  {productorSeleccionado.redesSociales?.facebook ? (
                    <View style={styles.detailInfoRow}>
                      <Ionicons
                        name="logo-facebook"
                        size={16}
                        color="#7A2214"
                      />
                      <Text style={styles.detailInfoText}>
                        {productorSeleccionado.redesSociales.facebook}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Productos que cultiva
                  </Text>
                  <View style={styles.chipsWrap}>
                    {getProductosDelProductor(productorSeleccionado).map(
                      (prod) => (
                        <View
                          key={prod.id}
                          style={[
                            styles.productoChip,
                            { borderColor: prod.color || "#7A2214" },
                          ]}
                        >
                          <View
                            style={[
                              styles.chipDot,
                              { backgroundColor: prod.color || "#7A2214" },
                            ]}
                          />
                          <Text style={styles.chipText}>{prod.nombre}</Text>
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

      {/* Modal Eliminar */}
      <Modal
        visible={modalEliminarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEliminarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Ionicons name="warning-outline" size={36} color="#D32F2F" />
            <Text style={styles.confirmTitle}>¿Eliminar productor?</Text>
            <Text style={styles.confirmMsg}>
              Se eliminará a &ldquo;{productorAEliminar?.nombre}&rdquo;. Esta acción no se
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
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7A2214",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
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
  actionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#F7F5F2",
  },
  productosChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F4F0EA",
  },
  productoChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#FAFAFA",
    gap: 5,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 11,
    color: "#444444",
    fontWeight: "600",
  },
  sinProductosText: {
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
    borderRadius: 40,
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
    borderRadius: 36,
  },
  detailAvatarBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#7A2214",
    alignItems: "center",
    justifyContent: "center",
  },
  detailAvatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  detailName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C2C2C",
    marginTop: 8,
  },
  detailLoc: {
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

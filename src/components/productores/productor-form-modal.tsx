import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SelectModal, SelectOption } from "@/components/select-modal";
import { LOCALIDADES_SALTA } from "@/constants/localidades-salta";
import {
  actualizarProductor,
  crearProductor,
} from "@/services/productores.service";
import { subirImagen } from "@/services/storage.service";
import { Producto, Productor } from "@/types";
import { validarCelular, validarNombre } from "@/utils/validations";

import { styles } from "./styles";

interface ProductorFormModalProps {
  visible: boolean;
  /** null = crear; con valor = editar */
  productor: Productor | null;
  productos: Producto[];
  onClose: () => void;
}

const OPCIONES_LOCALIDADES: SelectOption[] = LOCALIDADES_SALTA.map((loc) => ({
  id: loc,
  label: loc,
  subtitle: "Salta, Argentina",
}));

/**
 * Modal de alta/edición de productor. Mantiene su propio estado de formulario,
 * de modo que escribir no re-renderiza el listado. El padre debe cambiar la
 * `key` cada vez que lo abre para reiniciar el formulario.
 */
export function ProductorFormModal({
  visible,
  productor,
  productos,
  onClose,
}: ProductorFormModalProps) {
  const editando = productor !== null;

  const productosIdsIniciales = useMemo(
    () =>
      productor?.productosIds ||
      (productor?.producto?.id ? [productor.producto.id] : []),
    [productor],
  );

  const [nombre, setNombre] = useState(productor?.nombre ?? "");
  const [localidad, setLocalidad] = useState(productor?.localidad ?? "");
  const [productosIds, setProductosIds] = useState<string[]>(productosIdsIniciales);
  const [direccion, setDireccion] = useState(productor?.direccion ?? "");
  const [celular, setCelular] = useState(productor?.celular ?? "");
  const [instagram, setInstagram] = useState(
    productor?.redesSociales?.instagram ?? "",
  );
  const [facebook, setFacebook] = useState(
    productor?.redesSociales?.facebook ?? "",
  );
  const [fotoUri, setFotoUri] = useState<string | null>(
    productor?.fotoUrl || null,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectLocalidadVisible, setSelectLocalidadVisible] = useState(false);
  const [selectProductoVisible, setSelectProductoVisible] = useState(false);

  const opcionesProductos: SelectOption[] = useMemo(
    () =>
      productos.map((prod) => ({
        id: prod.id,
        label: prod.nombre,
        color: prod.color,
      })),
    [productos],
  );

  const handlePickImage = async () => {
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
      setFotoUri(res.assets[0].uri);
    }
  };

  const handleAbrirSelectLocalidad = () => {
    Keyboard.dismiss();
    setSelectLocalidadVisible(true);
  };

  const handleAbrirSelectProductos = () => {
    Keyboard.dismiss();
    setSelectProductoVisible(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const errNom = validarNombre(nombre);
    if (errNom) {
      setError(errNom);
      return;
    }

    if (!localidad) {
      setError("Por favor seleccioná una localidad.");
      return;
    }

    const errCel = validarCelular(celular, true);
    if (errCel) {
      setError(errCel);
      return;
    }

    if (!editando) {
      try {
        setGuardando(true);
        let fotoUrl: string | null = null;
        if (fotoUri) {
          fotoUrl = await subirImagen(
            fotoUri,
            `productores/${Date.now()}_foto.jpg`,
          );
        }

        await crearProductor({
          nombre: nombre.trim(),
          localidad,
          productosIds,
          direccion: direccion.trim(),
          celular: celular.trim(),
          redesSociales: {
            instagram: instagram.trim(),
            facebook: facebook.trim(),
          },
          fotoUrl,
        });

        onClose();
      } catch {
        setError("No se pudo guardar el productor. Intenta nuevamente.");
      } finally {
        setGuardando(false);
      }
      return;
    }

    // Dirty check: comparar datos originales con editados
    const hayCambios =
      nombre.trim() !== productor.nombre.trim() ||
      localidad !== productor.localidad ||
      (direccion.trim() || "") !== (productor.direccion?.trim() || "") ||
      (celular.trim() || "") !== (productor.celular?.trim() || "") ||
      (instagram.trim() || "") !==
        (productor.redesSociales?.instagram?.trim() || "") ||
      (facebook.trim() || "") !==
        (productor.redesSociales?.facebook?.trim() || "") ||
      fotoUri !== (productor.fotoUrl || null) ||
      JSON.stringify(productosIdsIniciales.slice().sort()) !==
        JSON.stringify(productosIds.slice().sort());

    if (!hayCambios) {
      onClose();
      return;
    }

    try {
      setGuardando(true);
      let fotoUrl = productor.fotoUrl || null;
      if (fotoUri && fotoUri !== productor.fotoUrl) {
        fotoUrl = await subirImagen(
          fotoUri,
          `productores/${productor.id}_foto.jpg`,
        );
      }

      await actualizarProductor(productor.id, {
        nombre: nombre.trim(),
        localidad,
        productosIds,
        direccion: direccion.trim(),
        celular: celular.trim(),
        redesSociales: {
          instagram: instagram.trim(),
          facebook: facebook.trim(),
        },
        fotoUrl,
      });

      onClose();
    } catch {
      setError("No se pudo actualizar el productor. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        if (selectLocalidadVisible) {
          setSelectLocalidadVisible(false);
        } else if (selectProductoVisible) {
          setSelectProductoVisible(false);
        } else {
          onClose();
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.formModalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editando ? "Editar Productor" : "Nuevo Productor"}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={guardando}>
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.modalErrorContainer}>
              <Ionicons name="alert-circle" size={18} color="#D32F2F" />
              <Text style={styles.modalErrorText}>{error}</Text>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Foto de Productor */}
            <View style={styles.imagePickerRow}>
              <TouchableOpacity
                style={styles.imagePickerBtn}
                onPress={handlePickImage}
                disabled={guardando}
              >
                {fotoUri ? (
                  <Image
                    source={{ uri: fotoUri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera-outline" size={28} color="#7A2214" />
                    <Text style={styles.imagePickerText}>
                      {editando ? "Cambiar Foto" : "Subir Foto"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre completo *</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder={editando ? undefined : "Ej: Marta Guanuco"}
              placeholderTextColor="#999999"
              value={nombre}
              onChangeText={setNombre}
              editable={!guardando}
            />

            <Text style={styles.inputLabel}>Localidad *</Text>
            <TouchableOpacity
              style={styles.selectTrigger}
              activeOpacity={0.7}
              onPress={handleAbrirSelectLocalidad}
            >
              <View style={styles.selectTriggerContent}>
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#7A2214"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={localidad ? styles.selectText : styles.selectPlaceholder}
                >
                  {localidad || "Seleccionar localidad..."}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#777777" />
            </TouchableOpacity>

            {/* Sección de Selección Múltiple de Productos (N:M) */}
            <View style={styles.multiSelectSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.inputLabelNoMargin}>
                  Productos que cultiva
                </Text>
                <TouchableOpacity
                  style={styles.multiActionBtn}
                  onPress={handleAbrirSelectProductos}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#7A2214" />
                  <Text style={styles.multiActionBtnText}>
                    {productosIds.length > 0 ? "Modificar" : "Vincular"}
                  </Text>
                </TouchableOpacity>
              </View>

              {productosIds.length > 0 ? (
                <View style={styles.chipsContainer}>
                  {productos
                    .filter((pr) => productosIds.includes(pr.id))
                    .map((pr) => (
                      <View
                        key={pr.id}
                        style={[
                          styles.interactiveChip,
                          { borderColor: pr.color || "#7A2214" },
                        ]}
                      >
                        <View
                          style={[
                            styles.chipDot,
                            { backgroundColor: pr.color || "#7A2214" },
                          ]}
                        />
                        <Text style={styles.interactiveChipText}>
                          {pr.nombre}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setProductosIds((prev) =>
                              prev.filter((id) => id !== pr.id),
                            )
                          }
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.chipCloseBtn}
                        >
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color="#777777"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.selectTriggerEmpty}
                  activeOpacity={0.7}
                  onPress={handleAbrirSelectProductos}
                >
                  <Ionicons
                    name="pricetag-outline"
                    size={16}
                    color="#888888"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.selectPlaceholder}>
                    Ningún producto vinculado. Tocá para asignar...
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Dirección</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder={editando ? undefined : "Ej: Ruta 40 Km 4480"}
              placeholderTextColor="#999999"
              value={direccion}
              onChangeText={setDireccion}
              editable={!guardando}
            />

            <Text style={styles.inputLabel}>Celular / WhatsApp *</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Ej: 387 512-3456 (obligatorio)"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
              value={celular}
              onChangeText={setCelular}
              editable={!guardando}
            />

            <Text style={styles.inputLabel}>Instagram</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder={editando ? undefined : "Ej: @martaguanuco_especias"}
              placeholderTextColor="#999999"
              autoCapitalize={editando ? undefined : "none"}
              value={instagram}
              onChangeText={setInstagram}
              editable={!guardando}
            />

            <Text style={styles.inputLabel}>Facebook</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder={editando ? undefined : "Ej: Marta Guanuco Valles"}
              placeholderTextColor="#999999"
              value={facebook}
              onChangeText={setFacebook}
              editable={!guardando}
            />

            <TouchableOpacity
              style={[styles.modalSubmitBtn, guardando && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>
                  {editando ? "Guardar Cambios" : "Guardar Productor"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* SELECTS DENTRO DEL MODAL (Evita que queden por detrás) */}
      <SelectModal
        visible={selectLocalidadVisible}
        inModal={true}
        title="Seleccionar Localidad"
        options={OPCIONES_LOCALIDADES}
        selectedId={localidad}
        onSelect={(opt) => setLocalidad(opt.id)}
        onClose={() => setSelectLocalidadVisible(false)}
      />

      <SelectModal
        visible={selectProductoVisible}
        inModal={true}
        title="Vincular Productos"
        options={opcionesProductos}
        multiple={true}
        selectedIds={productosIds}
        onSelectMultiple={(opts) => setProductosIds(opts.map((o) => o.id))}
        onClose={() => setSelectProductoVisible(false)}
      />
    </Modal>
  );
}

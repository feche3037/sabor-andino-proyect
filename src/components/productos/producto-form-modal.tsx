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

import { ColorPicker, PALETA_ANDINA } from "@/components/color-picker";
import { SelectModal, SelectOption } from "@/components/select-modal";
import {
  actualizarProducto,
  crearProducto,
} from "@/services/productos.service";
import { subirImagen } from "@/services/storage.service";
import { Producto, Productor } from "@/types";
import { validarNombre, validarNumero } from "@/utils/validations";

import { styles } from "./styles";

interface ProductoFormModalProps {
  visible: boolean;
  /** null = crear; con valor = editar */
  producto: Producto | null;
  /** Ids de productores asociados al producto al abrir (solo edición) */
  productoresIdsIniciales: string[];
  productores: Productor[];
  onClose: () => void;
}

/**
 * Modal de alta/edición de producto. Mantiene su propio estado de formulario,
 * de modo que escribir no re-renderiza el listado. El padre debe cambiar la
 * `key` cada vez que lo abre para reiniciar el formulario.
 */
export function ProductoFormModal({
  visible,
  producto,
  productoresIdsIniciales,
  productores,
  onClose,
}: ProductoFormModalProps) {
  const editando = producto !== null;

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [color, setColor] = useState(producto?.color || PALETA_ANDINA[0]);
  const [lote, setLote] = useState(producto?.lote ?? "");
  const [stock, setStock] = useState(
    producto?.stock !== undefined ? String(producto.stock) : "",
  );
  const [presentacion, setPresentacion] = useState(producto?.presentacion ?? "");
  const [productoresIds, setProductoresIds] = useState<string[]>(
    productoresIdsIniciales,
  );
  const [fotoUri, setFotoUri] = useState<string | null>(
    producto?.fotoUrl || null,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectVisible, setSelectVisible] = useState(false);

  const opcionesProductores: SelectOption[] = useMemo(
    () =>
      productores.map((prod) => ({
        id: prod.id,
        label: prod.nombre,
        subtitle: `${prod.localidad}, Salta`,
      })),
    [productores],
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

  const handleAbrirSelect = () => {
    Keyboard.dismiss();
    setSelectVisible(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const errNom = validarNombre(nombre);
    if (errNom) {
      setError(errNom);
      return;
    }

    if (stock.trim()) {
      const errStock = validarNumero(stock, "El stock");
      if (errStock) {
        setError(errStock);
        return;
      }
    }

    if (!editando) {
      try {
        setGuardando(true);
        let fotoUrl: string | null = null;
        if (fotoUri) {
          fotoUrl = await subirImagen(fotoUri, `productos/${Date.now()}_foto.jpg`);
        }

        await crearProducto({
          nombre: nombre.trim(),
          color,
          lote: lote.trim(),
          stock: stock ? Number(stock) : 0,
          presentacion: presentacion.trim(),
          productoresIds,
          fotoUrl,
        });

        onClose();
      } catch {
        setError("No se pudo crear el producto. Intenta nuevamente.");
      } finally {
        setGuardando(false);
      }
      return;
    }

    // Dirty check: comparar datos originales con editados
    const stockOriginal = producto.stock !== undefined ? producto.stock : 0;
    const asocOriginal = productoresIdsIniciales.slice().sort();
    const asocNuevo = productoresIds.slice().sort();

    const hayCambios =
      nombre.trim() !== producto.nombre.trim() ||
      color !== (producto.color || PALETA_ANDINA[0]) ||
      (lote.trim() || "") !== (producto.lote?.trim() || "") ||
      (stock ? Number(stock) : 0) !== stockOriginal ||
      (presentacion.trim() || "") !== (producto.presentacion?.trim() || "") ||
      fotoUri !== (producto.fotoUrl || null) ||
      JSON.stringify(asocOriginal) !== JSON.stringify(asocNuevo);

    if (!hayCambios) {
      onClose();
      return;
    }

    try {
      setGuardando(true);
      let fotoUrl = producto.fotoUrl || null;
      if (fotoUri && fotoUri !== producto.fotoUrl) {
        fotoUrl = await subirImagen(fotoUri, `productos/${producto.id}_foto.jpg`);
      }

      await actualizarProducto(producto.id, {
        nombre: nombre.trim(),
        color,
        lote: lote.trim(),
        stock: stock ? Number(stock) : 0,
        presentacion: presentacion.trim(),
        productoresIds,
        fotoUrl,
      });

      onClose();
    } catch {
      setError("No se pudo actualizar el producto. Intenta nuevamente.");
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
        if (selectVisible) {
          setSelectVisible(false);
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
              {editando ? "Editar Producto" : "Nuevo Producto"}
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
            {/* Foto de Producto */}
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

            <Text style={styles.inputLabel}>Nombre del producto *</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder={editando ? undefined : "Ej: Pimentón de Cachi"}
              value={nombre}
              onChangeText={setNombre}
              editable={!guardando}
            />

            <Text style={styles.inputLabel}>Presentación</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder={
                editando ? undefined : "Ej: Molido fino al vacío 250g"
              }
              value={presentacion}
              onChangeText={setPresentacion}
              editable={!guardando}
            />

            <View style={styles.twoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Lote</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder={editando ? undefined : "Ej: L-2026-01"}
                  value={lote}
                  onChangeText={setLote}
                  editable={!guardando}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>
                  {editando ? "Stock" : "Stock (unidades/kg)"}
                </Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder={editando ? undefined : "Ej: 100"}
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                  editable={!guardando}
                />
              </View>
            </View>

            {/* Sección Selección Múltiple de Productores (N:M) */}
            <View style={styles.multiSelectSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.inputLabelNoMargin}>
                  Productores vinculados
                </Text>
                <TouchableOpacity
                  style={styles.multiActionBtn}
                  onPress={handleAbrirSelect}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#7A2214" />
                  <Text style={styles.multiActionBtnText}>
                    {productoresIds.length > 0 ? "Modificar" : "Asignar"}
                  </Text>
                </TouchableOpacity>
              </View>

              {productoresIds.length > 0 ? (
                <View style={styles.chipsContainer}>
                  {productores
                    .filter((p) => productoresIds.includes(p.id))
                    .map((p) => (
                      <View key={p.id} style={styles.interactiveChip}>
                        <Ionicons
                          name="person-outline"
                          size={13}
                          color="#7A2214"
                        />
                        <Text style={styles.interactiveChipText}>
                          {p.nombre} ({p.localidad})
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            setProductoresIds((prev) =>
                              prev.filter((id) => id !== p.id),
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
                  onPress={handleAbrirSelect}
                >
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color="#888888"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.selectPlaceholder}>
                    Ningún productor asignado. Tocá para vincular...
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Color representativo</Text>
            <ColorPicker selectedColor={color} onSelectColor={setColor} />

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
                  {editando ? "Guardar Cambios" : "Crear Producto"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* SELECT DENTRO DEL MODAL (Evita que quede por detrás) */}
      <SelectModal
        visible={selectVisible}
        inModal={true}
        title="Asignar Productores"
        options={opcionesProductores}
        multiple={true}
        selectedIds={productoresIds}
        onSelectMultiple={(opts) => setProductoresIds(opts.map((o) => o.id))}
        onClose={() => setSelectVisible(false)}
      />
    </Modal>
  );
}

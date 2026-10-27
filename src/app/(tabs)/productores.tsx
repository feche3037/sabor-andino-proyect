import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BordeAndino } from "@/components/borde-andino";
import { ProductorCard } from "@/components/productores/productor-card";
import { ProductorFormModal } from "@/components/productores/productor-form-modal";
import { styles } from "@/components/productores/styles";
import { useData } from "@/context/data-context";
import { eliminarProductor } from "@/services/productores.service";
import { Producto, Productor } from "@/types";

interface FormState {
  visible: boolean;
  productor: Productor | null;
  /** Se incrementa en cada apertura para reiniciar el formulario */
  key: number;
}

export default function ProductoresScreen() {
  const { productores, productos, loadingProductores: loading } = useData();
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState<FormState>({
    visible: false,
    productor: null,
    key: 0,
  });

  const [modalVerVisible, setModalVerVisible] = useState(false);
  const [productorSeleccionado, setProductorSeleccionado] =
    useState<Productor | null>(null);

  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [productorAEliminar, setProductorAEliminar] = useState<Productor | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Productos asociados a cada productor (N:M), calculado una sola vez por cambio de datos
  const asociadosPorProductor = useMemo(() => {
    const map = new Map<string, Producto[]>();
    for (const p of productores) {
      const ids = p.productosIds || (p.producto?.id ? [p.producto.id] : []);
      map.set(
        p.id,
        productos.filter((prod) => ids.includes(prod.id)),
      );
    }
    return map;
  }, [productores, productos]);

  const getProductosDelProductor = (p: Productor): Producto[] =>
    asociadosPorProductor.get(p.id) ?? [];

  // Filtrado de productores exclusivamente por nombre o apellido
  const productoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productores;
    return productores.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [productores, busqueda]);

  const handleNuevo = useCallback(() => {
    setForm((f) => ({ visible: true, productor: null, key: f.key + 1 }));
  }, []);

  const handleEditar = useCallback((prod: Productor) => {
    setForm((f) => ({ visible: true, productor: prod, key: f.key + 1 }));
  }, []);

  const handleCerrarForm = useCallback(() => {
    setForm((f) => ({ ...f, visible: false }));
  }, []);

  const handleVer = useCallback((prod: Productor) => {
    setProductorSeleccionado(prod);
    setModalVerVisible(true);
  }, []);

  const handleEliminar = useCallback((prod: Productor) => {
    setProductorAEliminar(prod);
    setModalEliminarVisible(true);
  }, []);

  // Confirmar Eliminar
  const handleConfirmarEliminar = async () => {
    if (!productorAEliminar) return;
    try {
      setEliminando(true);
      await eliminarProductor(productorAEliminar.id);
      setModalEliminarVisible(false);
      setProductorAEliminar(null);
    } catch {
      Alert.alert("Error", "No se pudo eliminar el productor.");
    } finally {
      setEliminando(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Productor }) => (
      <ProductorCard
        productor={item}
        productosAsociados={asociadosPorProductor.get(item.id) ?? []}
        onVer={handleVer}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
    ),
    [asociadosPorProductor, handleVer, handleEditar, handleEliminar],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Productores</Text>
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={handleNuevo}
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
              placeholder="Buscar por nombre o apellido..."
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
          <BordeAndino />
      </View>

        {/* Listado */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7A2214" />
          </View>
        ) : (
          <FlatList
            data={productoresFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            windowSize={7}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>No hay productores registrados.</Text>
              </View>
            }
          />
        )}

        <ProductorFormModal
          key={form.key}
          visible={form.visible}
          productor={form.productor}
          productos={productos}
          onClose={handleCerrarForm}
        />

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
      </View>
    </SafeAreaView>
  );
}

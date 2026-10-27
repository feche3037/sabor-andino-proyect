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
import { ProductoCard } from "@/components/productos/producto-card";
import { ProductoFormModal } from "@/components/productos/producto-form-modal";
import { styles } from "@/components/productos/styles";
import { useData } from "@/context/data-context";
import { eliminarProducto } from "@/services/productos.service";
import { Producto, Productor } from "@/types";

interface FormState {
  visible: boolean;
  producto: Producto | null;
  /** Se incrementa en cada apertura para reiniciar el formulario */
  key: number;
}

export default function ProductosScreen() {
  const { productos, productores, loadingProductos: loading } = useData();
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState<FormState>({
    visible: false,
    producto: null,
    key: 0,
  });

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [modalVerVisible, setModalVerVisible] = useState(false);

  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Productores asociados a cada producto (N:M), calculado una sola vez por cambio de datos
  const asociadosPorProducto = useMemo(() => {
    const map = new Map<string, Productor[]>();
    for (const prod of productos) {
      map.set(
        prod.id,
        productores.filter((p) => {
          const pProdIds =
            p.productosIds || (p.producto?.id ? [p.producto.id] : []);
          return (
            pProdIds.includes(prod.id) ||
            (prod.productoresIds || []).includes(p.id)
          );
        }),
      );
    }
    return map;
  }, [productos, productores]);

  const getProductoresDelProducto = useCallback(
    (prod: Producto): Productor[] => asociadosPorProducto.get(prod.id) ?? [],
    [asociadosPorProducto],
  );

  // Filtrado de productos exclusivamente por nombre
  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [productos, busqueda]);

  const handleNuevo = useCallback(() => {
    setForm((f) => ({ visible: true, producto: null, key: f.key + 1 }));
  }, []);

  const handleEditar = useCallback((prod: Producto) => {
    setForm((f) => ({ visible: true, producto: prod, key: f.key + 1 }));
  }, []);

  const handleCerrarForm = useCallback(() => {
    setForm((f) => ({ ...f, visible: false }));
  }, []);

  const handleVer = useCallback((prod: Producto) => {
    setProductoSeleccionado(prod);
    setModalVerVisible(true);
  }, []);

  const handleEliminar = useCallback((prod: Producto) => {
    setProductoAEliminar(prod);
    setModalEliminarVisible(true);
  }, []);

  // Confirmar Eliminar
  const handleConfirmarEliminar = async () => {
    if (!productoAEliminar) return;
    try {
      setEliminando(true);
      await eliminarProducto(productoAEliminar.id);
      setModalEliminarVisible(false);
      setProductoAEliminar(null);
    } catch {
      Alert.alert("Error", "No se pudo eliminar el producto.");
    } finally {
      setEliminando(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Producto }) => (
      <ProductoCard
        producto={item}
        productoresAsociados={asociadosPorProducto.get(item.id) ?? []}
        onVer={handleVer}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
    ),
    [asociadosPorProducto, handleVer, handleEditar, handleEliminar],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Productos</Text>
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
              placeholder="Buscar por nombre de producto..."
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
            data={productosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={8}
            windowSize={7}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="pricetag-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>No hay productos registrados.</Text>
              </View>
            }
          />
        )}

        <ProductoFormModal
          key={form.key}
          visible={form.visible}
          producto={form.producto}
          productoresIdsIniciales={
            form.producto
              ? getProductoresDelProducto(form.producto).map((p) => p.id)
              : []
          }
          productores={productores}
          onClose={handleCerrarForm}
        />

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
      </View>
    </SafeAreaView>
  );
}

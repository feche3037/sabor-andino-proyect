import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Producto, Productor } from "@/types";

import { styles } from "./styles";

interface ProductoCardProps {
  producto: Producto;
  productoresAsociados: Productor[];
  onVer: (producto: Producto) => void;
  onEditar: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
}

function ProductoCardBase({
  producto: prod,
  productoresAsociados,
  onVer,
  onEditar,
  onEliminar,
}: ProductoCardProps) {
  return (
    <View style={styles.card}>
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
          <Text style={styles.prodNombre} numberOfLines={2}>
            {prod.nombre}
          </Text>
          <View style={styles.metaRow}>
            {prod.presentacion ? (
              <Text style={styles.prodMeta}>{prod.presentacion}</Text>
            ) : null}
            {prod.lote ? (
              <>
                <Text style={styles.metaDivider}>•</Text>
                <Text style={styles.prodMeta}>Lote: {prod.lote}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Stock Badge */}
        <View
          style={[
            styles.stockBadge,
            (prod.stock || 0) < 10 ? styles.stockLow : styles.stockOk,
          ]}
        >
          <Text
            style={[
              styles.stockText,
              (prod.stock || 0) < 10 ? styles.stockTextLow : styles.stockTextOk,
            ]}
          >
            {prod.stock !== undefined ? `${prod.stock} u.` : "0 u."}
          </Text>
        </View>

        {/* Acciones */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onVer(prod)}>
            <Ionicons name="eye-outline" size={18} color="#555555" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEditar(prod)}
          >
            <Ionicons name="pencil-outline" size={18} color="#7A2214" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onEliminar(prod)}
          >
            <Ionicons name="trash-outline" size={18} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Productores asociados (N:M) */}
      <View style={styles.productoresChipsRow}>
        {productoresAsociados.length > 0 ? (
          productoresAsociados.map((p) => (
            <View key={p.id} style={styles.productorChip}>
              <Ionicons name="person-outline" size={12} color="#7A2214" />
              <Text style={styles.productorChipText}>
                {p.nombre} ({p.localidad})
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.sinProductoresText}>Sin productores asignados</Text>
        )}
      </View>
    </View>
  );
}

export const ProductoCard = memo(ProductoCardBase);

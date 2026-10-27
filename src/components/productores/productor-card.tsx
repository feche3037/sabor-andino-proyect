import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Producto, Productor } from "@/types";

import { styles } from "./styles";

interface ProductorCardProps {
  productor: Productor;
  productosAsociados: Producto[];
  onVer: (productor: Productor) => void;
  onEditar: (productor: Productor) => void;
  onEliminar: (productor: Productor) => void;
}

function ProductorCardBase({
  productor: prod,
  productosAsociados,
  onVer,
  onEditar,
  onEliminar,
}: ProductorCardProps) {
  return (
    <View style={styles.card}>
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
            <Ionicons name="location-outline" size={14} color="#777777" />
            <Text style={styles.prodMeta}>{prod.localidad}</Text>
            {prod.celular ? (
              <>
                <Text style={styles.metaDivider}>•</Text>
                <Ionicons name="call-outline" size={13} color="#777777" />
                <Text style={styles.prodMeta}>{prod.celular}</Text>
              </>
            ) : null}
          </View>
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

      {/* Badges de Productos asociados (N:M) */}
      <View style={styles.productosChipsRow}>
        {productosAsociados.length > 0 ? (
          productosAsociados.map((pr) => (
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
          <Text style={styles.sinProductosText}>Sin productos vinculados</Text>
        )}
      </View>
    </View>
  );
}

export const ProductorCard = memo(ProductorCardBase);

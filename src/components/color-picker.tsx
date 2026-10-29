import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Paleta inspirada en especias, tierra y tintes andinos
export const PALETA_ANDINA = [
  "#8B2613", // Terracota clásico
  "#C0392B", // Ají rojo brillante
  "#D9534F", // Pimentón dulce
  "#E8A338", // Ocre / Dorado maíz
  "#D4AC0D", // Mostaza andina
  "#2E6930", // Romero / Laurel
  "#27AE60", // Verde valle
  "#7D6608", // Comino
  "#A04000", // Canela
  "#6E2C00", // Tierra quemada
  "#2C3E50", // Gris noche
  "#884EA0", // Maíz morado
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  label?: string;
}

export function ColorPicker({
  selectedColor,
  onSelectColor,
  label = "Color identificador",
}: ColorPickerProps) {
  const [customHex, setCustomHex] = useState(selectedColor);

  const handleCustomChange = (text: string) => {
    let clean = text.trim();
    if (!clean.startsWith("#") && clean.length > 0) {
      clean = `#${clean}`;
    }
    setCustomHex(clean);
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(clean)) {
      onSelectColor(clean);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.previewContainer}>
          <View style={[styles.previewColor, { backgroundColor: selectedColor || "#8B2613" }]} />
          <Text style={styles.hexText}>{selectedColor || "#8B2613"}</Text>
        </View>
      </View>

      {/* Cuadrícula de colores predefinidos */}
      <View style={styles.paletteGrid}>
        {PALETA_ANDINA.map((color) => {
          const isSelected = selectedColor?.toUpperCase() === color.toUpperCase();
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.swatch,
                { backgroundColor: color },
                isSelected && styles.swatchSelected,
              ]}
              onPress={() => {
                setCustomHex(color);
                onSelectColor(color);
              }}
              activeOpacity={0.8}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Campo para código hexadecimal personalizado */}
      <View style={styles.customRow}>
        <Text style={styles.customLabel}>Hex:</Text>
        <TextInput
          style={styles.customInput}
          placeholder="#8B2613"
          placeholderTextColor="#999999"
          value={customHex}
          onChangeText={handleCustomChange}
          maxLength={7}
          autoCapitalize="characters"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2B2B",
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2DCD5",
    gap: 6,
  },
  previewColor: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  hexText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333333",
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.1 }],
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  customLabel: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "600",
  },
  customInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2DCD5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: "#333333",
  },
});


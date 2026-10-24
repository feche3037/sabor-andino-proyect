import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface SelectOption {
  id: string;
  label: string;
  subtitle?: string;
  color?: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  options: SelectOption[];
  selectedId?: string;
  selectedIds?: string[];
  multiple?: boolean;
  onSelect?: (option: SelectOption) => void;
  onSelectMultiple?: (selected: SelectOption[]) => void;
  onClose: () => void;
}

function SelectModalContent({
  title,
  placeholder = "Buscar...",
  options,
  selectedId,
  selectedIds = [],
  multiple = false,
  onSelect,
  onSelectMultiple,
  onClose,
}: Omit<SelectModalProps, "visible">) {
  const [busqueda, setBusqueda] = useState("");
  const [currentSelectedIds, setCurrentSelectedIds] = useState<string[]>(
    () => selectedIds || [],
  );

  const opcionesFiltradas = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(busqueda.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(busqueda.toLowerCase())),
  );

  const handleSingleSelect = (option: SelectOption) => {
    if (onSelect) {
      onSelect(option);
    }
    onClose();
  };

  const handleToggleMultiple = (option: SelectOption) => {
    setCurrentSelectedIds((prev) => {
      if (prev.includes(option.id)) {
        return prev.filter((id) => id !== option.id);
      } else {
        return [...prev, option.id];
      }
    });
  };

  const handleConfirmMultiple = () => {
    if (onSelectMultiple) {
      const selectedOpts = options.filter((opt) =>
        currentSelectedIds.includes(opt.id),
      );
      onSelectMultiple(selectedOpts);
    }
    onClose();
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.modalCard} edges={["bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#777777"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCorrect={false}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={18} color="#999999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de opciones */}
        <FlatList
          data={opcionesFiltradas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron resultados.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = multiple
              ? currentSelectedIds.includes(item.id)
              : item.id === selectedId;

            return (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                ]}
                onPress={() =>
                  multiple
                    ? handleToggleMultiple(item)
                    : handleSingleSelect(item)
                }
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  {item.color && (
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle ? (
                      <Text style={styles.optionSubtitle}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <Ionicons
                  name={
                    isSelected
                      ? "checkmark-circle"
                      : multiple
                      ? "ellipse-outline"
                      : undefined
                  }
                  size={20}
                  color={isSelected ? "#7A2214" : "#CCCCCC"}
                />
              </TouchableOpacity>
            );
          }}
        />

        {/* Botón de Confirmación para Selección Múltiple */}
        {multiple && (
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.85}
              onPress={handleConfirmMultiple}
            >
              <Text style={styles.confirmButtonText}>
                Confirmar selección ({currentSelectedIds.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

export function SelectModal(props: SelectModalProps) {
  return (
    <Modal visible={props.visible} animationType="slide" transparent={true}>
      {props.visible ? <SelectModalContent {...props} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    minHeight: "55%",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F1F1F",
  },
  closeBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F0EA",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: "#F9EDE8",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  optionLabel: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
  },
  optionLabelSelected: {
    color: "#7A2214",
    fontWeight: "bold",
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    color: "#888888",
    fontSize: 14,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  confirmButton: {
    backgroundColor: "#7A2214",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});

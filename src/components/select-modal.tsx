import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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

export interface SelectModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  options: SelectOption[];
  selectedId?: string;
  selectedIds?: string[];
  multiple?: boolean;
  inModal?: boolean; // Si se renderiza dentro de otro Modal para evitar conflictos de apilamiento nativo
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
  inModal = false,
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
    <View style={inModal ? styles.overlayInModal : styles.overlay}>
      {/* Fondo semitransparente táctil para cerrar tocando afuera */}
      <TouchableOpacity
        style={styles.backdropPressable}
        activeOpacity={1}
        onPress={onClose}
      />

      <SafeAreaView style={styles.modalCard} edges={["bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
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
          keyboardShouldPersistTaps="handled"
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
  if (!props.visible) return null;

  if (props.inModal) {
    return <SelectModalContent {...props} />;
  }

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      transparent={true}
      onRequestClose={props.onClose}
    >
      <SelectModalContent {...props} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayInModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
    zIndex: 99999,
    elevation: 99999,
  },
  backdropPressable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    minHeight: "55%",
    paddingTop: 16,
    zIndex: 100000,
    elevation: 100000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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

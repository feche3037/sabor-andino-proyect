import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type BottomNavTab = "home" | "productores" | "perfil";

export interface BottomNavProps {
  currentTab?: BottomNavTab;
}

interface TabConfig {
  key: BottomNavTab;
  label: string;
  route: "/home" | "/productores" | "/perfil";
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  {
    key: "home",
    label: "Inicio",
    route: "/home",
    activeIcon: "home",
    inactiveIcon: "home-outline",
  },
  {
    key: "productores",
    label: "Productores",
    route: "/productores",
    activeIcon: "people",
    inactiveIcon: "people-outline",
  },
  {
    key: "perfil",
    label: "Perfil",
    route: "/perfil",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
];

export function BottomNav({ currentTab }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const activeTab: BottomNavTab =
    currentTab ??
    (pathname.includes("productores")
      ? "productores"
      : pathname.includes("perfil")
      ? "perfil"
      : "home");

  const handleTabPress = (tab: TabConfig) => {
    if (activeTab === tab.key) return;
    router.replace(tab.route);
  };

  return (
    <View
      style={[
        styles.bottomNav,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const iconName = isActive ? tab.activeIcon : tab.inactiveIcon;
        const iconColor = isActive ? "#7A2214" : "#666666";

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => handleTabPress(tab)}
          >
            {isActive && <View style={styles.activeIndicator} />}
            <Ionicons name={iconName} size={22} color={iconColor} />
            <Text
              style={[
                styles.navLabel,
                isActive && styles.activeNavLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 8,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 32,
    height: 4,
    backgroundColor: "#E8A338",
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  activeNavLabel: {
    color: "#7A2214",
    fontWeight: "bold",
  },
});

export default BottomNav;


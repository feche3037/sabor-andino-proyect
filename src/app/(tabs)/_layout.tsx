import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Precarga todas las pestañas en segundo plano para que no se vean en blanco al abrirlas
        lazy: false,
        tabBarActiveTintColor: "#7A2214",
        tabBarInactiveTintColor: "#666666",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          height: 60 + (Platform.OS === "ios" ? insets.bottom : 8),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarLabel: ({ children, focused }) => (
          <Text
            style={[
              styles.navLabel,
              focused && styles.activeNavLabel,
            ]}
            numberOfLines={1}
          >
            {children}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={focused ? "#7A2214" : "#666666"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="productores"
        options={{
          title: "Productores",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={22}
                color={focused ? "#7A2214" : "#666666"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          title: "Productos",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons
                name={focused ? "pricetag" : "pricetag-outline"}
                size={22}
                color={focused ? "#7A2214" : "#666666"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={focused ? "#7A2214" : "#666666"}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: 32,
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 28,
    height: 3,
    backgroundColor: "#E8A338",
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 11,
    color: "#666666",
    marginTop: 2,
  },
  activeNavLabel: {
    color: "#7A2214",
    fontWeight: "bold",
  },
});


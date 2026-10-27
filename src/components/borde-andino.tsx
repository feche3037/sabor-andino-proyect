import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

export type BorderAndinoProps = {
  teethContainer?: StyleProp<ViewStyle>;
  tooth?: StyleProp<ViewStyle>;
};

export function BordeAndino({ teethContainer, tooth }: BorderAndinoProps = {}) {
  return (
    <View style={teethContainer ? teethContainer : styles.teethContainer}>
      {Array.from({ length: 16 }).map((_, i) => (
        <View key={i} style={tooth ? tooth : styles.tooth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  teethContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    overflow: "hidden",
  },
  tooth: {
    flex: 1,
    height: 10,
    backgroundColor: "#F4F0EA",
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 1,
    top: 6,
  },
});

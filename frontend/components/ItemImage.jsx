import React, { useState } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Shows an item's picture. If there's no picture or it fails to load,
// shows a basket icon instead. If a name is given, it's shown along the bottom.
export default function ItemImage({ uri, name, style }) {
  const [failed, setFailed] = useState(false);
  const showImage = uri && !failed;

  return (
    <View style={[styles.container, style]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={styles.image}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="basket-outline" size={48} color="#BCABAB" />
        </View>
      )}
      {name ? (
        <View style={styles.nameBar}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: "100%", overflow: "hidden" },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  nameBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(55, 48, 48, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  nameText: { fontFamily: "Montaga", color: "#FFFFFF", fontSize: 16 },
});
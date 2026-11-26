import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// A centered popup card used by every item popup and the add-item form.
// - Fits any screen: full width minus a margin on phones, at most `maxWidth` on big screens.
// - Long content scrolls inside the card instead of running off the screen.
// - Closes with the × button, by tapping the dark background, or the Android back button.
// With a `title`, the × sits next to it; without one, it floats over the top-right corner.
export default function PopupCard({ visible, onClose, title, maxWidth = 400, children }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* The dark background: tapping it closes the popup */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={[styles.card, { maxWidth }]}>
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <CloseButton onPress={onClose} />
            </View>
          ) : null}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, title && styles.contentUnderTitle]}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {title ? null : <CloseButton onPress={onClose} floating />}
        </View>
      </View>
    </Modal>
  );
}

function CloseButton({ onPress, floating }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Close"
      style={({ pressed }) => [
        styles.closeButton,
        floating && styles.closeButtonFloating,
        pressed && styles.closeButtonPressed,
      ]}
    >
      <Ionicons name="close" size={22} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16, // keeps the card off the screen edges on phones
  },
  card: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#373030",
    borderRadius: 20,
    overflow: "hidden",
  },
  scroll: {
    flexGrow: 0, // only as tall as the content, up to the card's max height
  },
  content: {
    padding: 20,
  },
  contentUnderTitle: {
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Montaga",
    fontSize: 22,
    color: "#FFFFFF",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonFloating: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.55)", // readable on top of any picture
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
});

// Shared style for the picture at the top of an item popup: full card width, 4:3.
export const popupImageStyle = {
  width: "100%",
  height: "auto", // let aspectRatio set the height (overrides ItemImage's 100%)
  aspectRatio: 4 / 3,
  borderRadius: 14,
  marginBottom: 16,
  backgroundColor: "#2B2424",
};

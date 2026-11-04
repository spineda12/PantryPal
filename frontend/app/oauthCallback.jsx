// The backend redirects here after a successful Google/GitHub login
// (only used once GOOGLE_LOGIN_ENABLED is turned on).
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OAuthCallback() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      if (userId) {
        await AsyncStorage.setItem("userId", String(userId));
        router.replace("/(tabs)");
      } else {
        router.replace("/logIn");
      }
    };
    finish();
  }, [userId]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#524242" }}>
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

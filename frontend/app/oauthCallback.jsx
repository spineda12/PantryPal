// The backend redirects here after a successful Google/GitHub login
// (only used once GOOGLE_LOGIN_ENABLED is turned on).
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { saveLogin } from "../constants/api";

export default function OAuthCallback() {
  const { token, userId, username } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      if (token && userId) {
        await saveLogin({ token, userId, username });
        router.replace("/(tabs)");
      } else {
        router.replace("/logIn");
      }
    };
    finish();
  }, [token, userId]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#524242" }}>
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}

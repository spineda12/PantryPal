import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// The backend address. Set EXPO_PUBLIC_API_URL in a .env file (see .env.example).
// - Expo web / iOS simulator on the same computer: http://localhost:8080
// - Android emulator: http://10.0.2.2:8080
// - Real phone with Expo Go: http://YOUR-COMPUTER-IP:8080 (same Wi-Fi network)
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

// Google login goes through the backend's OAuth flow (web only for now).
// Leave this false until you've created your own Google OAuth app and turned
// OAuth back on in the backend (see the README).
export const GOOGLE_LOGIN_ENABLED = false;

// Saves what /api/auth/login (or Google login) sends back.
export const saveLogin = async ({ token, userId, username }) => {
  await AsyncStorage.setItem("token", String(token));
  await AsyncStorage.setItem("userId", String(userId));
  await AsyncStorage.setItem("username", String(username ?? ""));
};

// Forgets the logged-in user on this device.
export const clearLogin = async () => {
  await AsyncStorage.multiRemove(["token", "userId", "username"]);
};

// Use this instead of fetch() for every backend call except sign up and log in.
// It adds the login token; if the backend says the token is missing or expired
// (401), it logs out and goes to the login screen.
export const authFetch = async (url, options = {}) => {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (response.status === 401) {
    await clearLogin();
    router.replace("/logIn");
  }
  return response;
};

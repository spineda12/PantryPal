// The backend address. Set EXPO_PUBLIC_API_URL in a .env file (see .env.example).
// - Expo web / iOS simulator on the same computer: http://localhost:8080
// - Android emulator: http://10.0.2.2:8080
// - Real phone with Expo Go: http://YOUR-COMPUTER-IP:8080 (same Wi-Fi network)
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

// Google login goes through the backend's OAuth flow (web only for now).
// Leave this false until you've created your own Google OAuth app and turned
// OAuth back on in the backend (see the README).
export const GOOGLE_LOGIN_ENABLED = false;

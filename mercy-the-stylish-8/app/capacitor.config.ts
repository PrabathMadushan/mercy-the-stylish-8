import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mercythestylish.app",
  appName: "Mercy the Stylish",
  webDir: "dist",
  bundledWebRuntime: false,
  plugins: {
    GoogleAuth: {
      // Replace with your OAuth Web Client ID from Google Cloud Console
      // (APIs & Services > Credentials > OAuth 2.0 Client IDs > Web client)
      scopes: ["profile", "email"],
      serverClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  },
  android: {
    allowMixedContent: false
  },
  server: {
    androidScheme: "https"
  }
};

export default config;

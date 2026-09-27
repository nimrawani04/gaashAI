import type { CapacitorConfig } from "@capacitor/cli";

/**
 * KashmirBot native shell (version 1).
 *
 * The app is a server-rendered TanStack Start site, so the native shell loads
 * the live deployment instead of a folder of static files.
 */
const config: CapacitorConfig = {
  appId: "app.lovable.f10d8ce1204b4d419dbb3725d39495e3",
  appName: "KashmirBot",
  webDir: "dist/client",
  server: {
    // Use the immutable production hostname. Some Android emulator DNS
    // configurations fail to resolve renamed *.lovable.app aliases.
    url: "https://gaash-ai.lovable.app",
    cleartext: false,
    androidScheme: "https",
    // Sign-in and the backend live on other hosts; without these the WebView
    // blocks the redirect and the app looks frozen on a blank screen.
    allowNavigation: [
      "project--f10d8ce1-204b-4d41-9dbb-3725d39495e3.lovable.app",
      "gaash-ai.lovable.app",
      "*.lovable.app",
      "*.supabase.co",
      "accounts.google.com",
      "*.googleusercontent.com",
    ],
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    Keyboard: {
      resize: "native",
    },
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#0f5132",
    },
    SplashScreen: {
      // Hide the static launch image immediately so the app opens straight
      // into the animated chinar ⇄ bot startup screen.
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: "#0f5132",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
  },
};

export default config;

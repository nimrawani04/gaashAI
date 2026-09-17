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
    url: "https://gaash-ai.lovable.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
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
      launchAutoHide: true,
      launchShowDuration: 1200,
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

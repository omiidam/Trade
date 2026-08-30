import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.qali.tradefinex",
  appName: "TradeFinex",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0f",
    },
    Keyboard: {
      resize: "body",
    },
  },
};

export default config;

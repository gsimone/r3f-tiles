import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

import EnvironmentPlugin from "vite-plugin-environment";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(), 
    // EnvironmentPlugin(["CODESANDBOX_HOST"])
  ],
 
});

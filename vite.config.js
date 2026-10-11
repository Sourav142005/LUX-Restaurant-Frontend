import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Dev Tunnels expose Vite through a generated public hostname. Listening on
  // every interface and allowing that hostname keeps HTTPS mobile AR testing
  // working without Vite rejecting requests from the tunnel.
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

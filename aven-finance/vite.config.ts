
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Aven Finance",
        short_name: "Aven",
        description: "Manage your money with clarity.",
        theme_color: "#176B4D",
        background_color: "#F5F8F5",
        display: "standalone",
        start_url: "/",
        scope: "/",
        
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/pwa-512x512-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],

      
screenshots: [
  {
    src: "/screenshots/desktop-dashboard.png",
    sizes: "3840x2226",
    type: "image/png",
    form_factor: "wide",
    label: "Aven Finance desktop dashboard",
  },
  {
    src: "/screenshots/mobile-dashboard.png",
    sizes: "826x1836",
    type: "image/png",
    label: "Aven Finance mobile dashboard",
  },
],



      },
    }),
  ],
});

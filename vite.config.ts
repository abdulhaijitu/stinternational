 import { defineConfig, splitVendorChunkPlugin } from "vite";
 import react from "@vitejs/plugin-react-swc";
 import path from "path";
 
 // ST International - Vite Configuration
 export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable minification and tree shaking
    minify: "esbuild",
    target: "esnext",
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize sourcemaps for production
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI library chunks
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          // Animation library
          "vendor-animation": ["framer-motion"],
          // Data fetching
          "vendor-query": ["@tanstack/react-query"],
          // Supabase
          "vendor-supabase": ["@supabase/supabase-js"],
        },
        // Optimize chunk file names
        chunkFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
}));

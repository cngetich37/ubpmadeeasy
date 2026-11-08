import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // Only env vars starting with UBP_ are exposed to the app (import.meta.env.UBP_*).
  // Never put secrets in them: they are inlined into the public bundle.
  envPrefix: "UBP_",
  // Tests don't read .env (it isn't committed); give them fixed placeholder values.
  test: {
    env: {
      UBP_API_URL: "https://api.example.test",
      UBP_SITE_URL: "https://site.example.test",
      UBP_NAIROBI_PAY_URL: "https://pay.example.test/",
      UBP_FINANCE_ACT_URL: "https://finance-act.example.test/download/act/",
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Libraries that rarely change get their own long-cached chunks, so a
        // deploy that only touches app code doesn't make users re-download them.
        // (Pages are split separately via lazyPage() in App.jsx.)
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg'],
      manifest: {
        name: 'UBPMadeEasy',
        short_name: 'UBPMadeEasy',
        start_url: '/',
        display: 'standalone',
        background_color: '#064E3B',
        theme_color: '#064E3B',
        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^\/assets\/.*\.(png|jpg|jpeg|svg|gif|webp)$/, 
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^\/public\/.*\.(png|jpg|jpeg|svg|gif|webp)$/, 
            handler: 'CacheFirst',
            options: {
              cacheName: 'public-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        globPatterns: ['**/*.{png,jpg,jpeg,svg,gif,webp}'], // Ensures all images are pre-cached
      },
    }),
  ],
});

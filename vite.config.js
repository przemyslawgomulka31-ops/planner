import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'plans/*.json'],
    manifest: {
      name: 'Planner — Twój plan', short_name: 'Planner',
      description: 'Prosty planner z zadaniami, podzadaniami i archiwum.',
      theme_color: '#101114', background_color: '#090a0c',
      display: 'standalone', orientation: 'any', start_url: '/',
      icons: [
        { src: '/pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
        { src: '/pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    }
  })],
})

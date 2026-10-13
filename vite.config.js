import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  base: '/',
  plugins: [
    tailwindcss(),
    react(),
    sitemap({
      hostname: 'https://theorchardengine.com',
      exclude: [
        '/404',
        '/user/deleteaccount',
        '/google662049138711fad3',
      ],
      dynamicRoutes: [
        '/',
        '/user/product',
        '/user/categories',
        '/user/blog',
        '/user/about',
        '/user/contect',
        '/user/termcondition',
        '/user/privacy',
        '/forgot-password',
      ]
    })
  ],
})
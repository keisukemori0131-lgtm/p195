import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// envPrefix: パターン B セット 2（UPNOTE_API_KEY）後方互換のため 'UPNOTE_' も公開対象にする
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'UPNOTE_'],
  base: process.env.VITE_BASE || '/',
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/*
  Content Security Policy: halaman hanya boleh memuat skrip dari situs ini sendiri, sehingga skrip
  sisipan (XSS) tidak bisa berjalan. Font dari Google Fonts diizinkan. Disisipkan saat build saja,
  karena `npm run dev` memakai skrip inline untuk hot reload.
*/
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

// Header keamanan dasar untuk server pengembangan & pratinjau
const HEADER_KEAMANAN = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()',
}

/*
  Data yang sudah pindah ke MySQL diambil dari backend Laravel (folder ../laravel). Permintaan /api
  diteruskan ke Laravel, sehingga Laravel cukup mendengar di 127.0.0.1 dan HP di jaringan yang
  sama tetap terlayani. Jalankan Laravel dengan: php artisan serve --host=127.0.0.1 --port=8000
*/
const PROXY_API = { '/api': { target: process.env.API_LARAVEL ?? 'http://127.0.0.1:8000', xfwd: true } }

function sisipkanCsp() {
  return {
    name: 'sisipkan-csp',
    apply: 'build',
    transformIndexHtml: (html) => html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sisipkanCsp()],
  // Tanpa larangan iframe saat pengembangan agar pratinjau di editor tetap bisa dipakai
  server: { headers: HEADER_KEAMANAN, proxy: PROXY_API },
  // Pratinjau hasil build memakai header yang sama dengan produksi (lihat public/_headers)
  preview: {
    proxy: PROXY_API,
    headers: {
      ...HEADER_KEAMANAN,
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': `${CSP}; frame-ancestors 'self'`,
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})

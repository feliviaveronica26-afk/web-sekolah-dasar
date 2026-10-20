import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const AKAR = path.dirname(fileURLToPath(import.meta.url))

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

/*
  Saat build, buang aturan CSS untuk kelas yang tidak pernah ditulis di kode. Utilitas Bootstrap dibuat
  untuk semua nilai × semua breakpoint (mis. mx-sm-n7), padahal hanya sebagian kecil yang dipakai.
  Sebuah kelas dianggap dipakai bila namanya muncul sebagai kata di src/ atau index.html — semua nama
  kelas di proyek ini ditulis utuh (tidak dirakit seperti `kolom-${n}`), jadi pemeriksaan ini aman.
  Selektor yang memuat :where()/:is()/:not() dibiarkan utuh.
*/
function pangkasCssTakTerpakai() {
  let kata = null
  const kumpulKata = () => {
    const set = new Set()
    const baca = (f) => {
      for (const m of fs.readFileSync(f, 'utf8').matchAll(/[\w-]+/g)) set.add(m[0])
    }
    const jalan = (d) => {
      for (const n of fs.readdirSync(d, { withFileTypes: true })) {
        const f = path.join(d, n.name)
        if (n.isDirectory()) jalan(f)
        else if (/\.(jsx?|html)$/.test(n.name)) baca(f)
      }
    }
    jalan(path.join(AKAR, 'src'))
    baca(path.join(AKAR, 'index.html'))
    return set
  }
  return {
    postcssPlugin: 'pangkas-css-tak-terpakai',
    Once(root) {
      kata ??= kumpulKata()
      root.walkRules((rule) => {
        if (/keyframes$/.test(rule.parent?.name ?? '')) return
        const tetap = rule.selectors.filter((s) => {
          if (s.includes('(')) return true
          const kelas = s.match(/\.[\w-]+/g)
          return !kelas || kelas.every((k) => kata.has(k.slice(1)))
        })
        if (!tetap.length) rule.remove()
        else if (tetap.length !== rule.selectors.length) rule.selectors = tetap
      })
      // @media / @container yang isinya habis ikut dibuang (diulang untuk yang bersarang)
      let ada = true
      while (ada) {
        ada = false
        root.walkAtRules((at) => {
          if (at.nodes && at.nodes.length === 0) {
            at.remove()
            ada = true
          }
        })
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [react(), sisipkanCsp()],
  // Bootstrap 5.3 masih memakai @import & fungsi Sass lama: peringatan dari Bootstrap disenyapkan
  css: {
    postcss: { plugins: command === 'build' ? [pangkasCssTakTerpakai()] : [] },
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
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
}))

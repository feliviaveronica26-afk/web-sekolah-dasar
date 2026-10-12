// Membuat hash password untuk akun sungguhan (mis. Kepala Sekolah) dan menyimpannya di .env.local.
// Pakai:  npm run hash-password            → mengisi VITE_HASH_KEPSEK
//         npm run hash-password -- NAMA_VAR → mengisi variabel lain
// Password diketik tersembunyi dan TIDAK disimpan di mana pun; yang disimpan hanya hash PBKDF2
// (format dijelaskan di src/utils/keamanan.js). Setelah itu jalankan ulang `npm run dev`.
import { createHash, pbkdf2Sync, randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { stdin, stdout } from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const ITERASI = 310000
const FILE_ENV = fileURLToPath(new URL('../.env.local', import.meta.url))

export function buatHash(password, iterasi = ITERASI) {
  const garam = randomBytes(16)
  const token = pbkdf2Sync(password, garam, iterasi, 32, 'sha256').toString('hex')
  const pemeriksa = createHash('sha256').update(token).digest('hex')
  return `pbkdf2-sha256:${iterasi}:${garam.toString('hex')}:${pemeriksa}`
}

// Ganti (atau tambahkan) satu variabel di isi file .env, lalu hapus password teks biasa yang lama
export function setelVariabel(isi, nama, nilai, hapus = []) {
  const baris = isi.split(/\r?\n/).filter((b) => !hapus.some((h) => b.startsWith(`${h}=`)))
  const i = baris.findIndex((b) => b.startsWith(`${nama}=`))
  if (i >= 0) baris[i] = `${nama}=${nilai}`
  else baris.splice(baris.at(-1) === '' ? baris.length - 1 : baris.length, 0, `${nama}=${nilai}`)
  return baris.join('\n').replace(/\n*$/, '\n')
}

function tanyaTersembunyi(pertanyaan) {
  return new Promise((selesai) => {
    stdout.write(pertanyaan)
    let isi = ''
    stdin.setRawMode?.(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    const baca = (potongan) => {
      for (const ch of potongan) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {
          stdin.setRawMode?.(false)
          stdin.pause()
          stdin.off('data', baca)
          stdout.write('\n')
          return selesai(isi)
        }
        if (ch === '\u0003') {
          stdout.write('\nDibatalkan.\n')
          process.exit(1)
        }
        if (ch === '\u007f' || ch === '\b') isi = isi.slice(0, -1)
        else isi += ch
      }
    }
    stdin.on('data', baca)
  })
}

async function utama() {
  const nama = process.argv[2] ?? 'VITE_HASH_KEPSEK'
  const password = await tanyaTersembunyi('Password baru: ')
  if (password.length < 10) {
    console.log('Password minimal 10 karakter. Gunakan gabungan huruf, angka, dan simbol.')
    process.exit(1)
  }
  if ((await tanyaTersembunyi('Ulangi password: ')) !== password) {
    console.log('Password tidak sama. Tidak ada yang diubah.')
    process.exit(1)
  }
  const isi = existsSync(FILE_ENV) ? readFileSync(FILE_ENV, 'utf8') : ''
  writeFileSync(FILE_ENV, setelVariabel(isi, nama, buatHash(password), ['VITE_PASSWORD_KEPSEK']))
  console.log(`Hash tersimpan di .env.local sebagai ${nama}. Jalankan ulang "npm run dev" agar berlaku.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) utama()

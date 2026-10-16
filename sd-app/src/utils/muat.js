/*
  Pelacak permintaan jaringan yang sedang berjalan, untuk bilah muat berlogo (components/BilahMuat.jsx).
  Permintaan yang ditunggu pengguna (memuat data, menyimpan, masuk) dihitung; pemeriksaan berkala di
  latar belakang (versi data, chat, sesi) tidak, agar bilah tidak muncul tiba-tiba tanpa sebab.
*/
let jumlah = 0
const pendengar = new Set()

const kabari = () => pendengar.forEach((fn) => fn(jumlah))

/** Dengarkan perubahan jumlah permintaan berjalan. Mengembalikan fungsi untuk berhenti mendengar. */
export function dengarMuat(fn) {
  pendengar.add(fn)
  fn(jumlah)
  return () => pendengar.delete(fn)
}

/** Hitung sebuah Promise (permintaan, impor halaman) sebagai pemuatan yang ditunggu pengguna. */
export async function lacak(janji) {
  jumlah++
  kabari()
  try {
    return await janji
  } finally {
    jumlah = Math.max(0, jumlah - 1)
    kabari()
  }
}

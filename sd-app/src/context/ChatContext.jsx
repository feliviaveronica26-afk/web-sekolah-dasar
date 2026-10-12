import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAkses } from './akses'
import { useAuth } from './AuthContext'
import { useData } from './DataContext'
import { hapusBerkas, hapusSemuaBerkas } from '../utils/berkasChat'
import { ID_GRUP_STAF, anggota, daftarPercakapan, idChatDari, idGrupKelas, idGrupOrtu, idGuru, idOrtu, idPribadi, idSiswa } from '../utils/chat'
import { uid } from '../utils/format'

/*
  Data chat disimpan terpisah dari data sekolah (kunci 'sdhg-chat-v1'), agar mengirim pesan tidak
  menulis ulang seluruh data sekolah. Isi berkas ada di IndexedDB (src/utils/berkasChat.js).
  state = {
    pesan:      { [id percakapan]: [{ id, dari, waktu, teks?, lampiran?, dihapus? }] },
    dibaca:     { [id pengguna]: { [id percakapan]: waktu terakhir dibaca } },
    pengaturan: { [id grup]: { hanyaAdmin, oleh, waktu } },
  }
*/
const STORAGE_KEY = 'sdhg-chat-v1'
const MAKS_PESAN = 500 // per percakapan; yang lebih lama dihapus beserta berkasnya

const ChatContext = createContext(null)

const lalu = (hari, jam, menit = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - hari)
  d.setHours(jam, menit, 0, 0)
  return d.toISOString()
}

// Percakapan contoh + pesan lama dari fitur "Pesan Wali Kelas" (data.pesan) agar tidak hilang
function buatChatContoh(data) {
  const wali = (kelas) => data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === kelas)
  const kelasDari = (nis) => data.siswa.find((s) => s.nis === nis)?.kelas
  const kepsek = data.guru.find((g) => g.jabatan === 'Kepala Sekolah')
  const pesan = {}
  const dibaca = {}
  const tambah = (pid, dari, waktu, teks) => (pesan[pid] ??= []).push({ id: uid(), dari, waktu, teks })

  // Pesan wali kelas lama: dari data tersimpan bila ada, selain itu contoh bawaan
  const lama = data.pesan ?? [
    { nis: '230401', dari: 'guru', isi: 'Selamat pagi Bu Dewi. Rafa hari ini aktif sekali saat diskusi IPAS tentang siklus air. 👍', waktu: lalu(3, 9, 15), dibacaOrtu: true, dibacaGuru: true },
    { nis: '230401', dari: 'ortu', isi: 'Terima kasih infonya, Pak Andi. Di rumah dia juga semangat bercerita soal itu.', waktu: lalu(3, 12, 15), dibacaOrtu: true, dibacaGuru: true },
    { nis: '230401', dari: 'ortu', isi: 'Pak, minggu depan ada field trip ke Museum Nasional ya? Apakah anak perlu membawa bekal sendiri?', waktu: lalu(1, 19, 15), dibacaOrtu: true, dibacaGuru: true },
    { nis: '230401', dari: 'guru', isi: 'Betul, Bu. Mohon dibawakan bekal makan siang dan botol minum. Formulir persetujuannya dikumpulkan paling lambat 16 Oktober ya.', waktu: lalu(0, 7, 15), dibacaOrtu: false, dibacaGuru: true },
    { nis: '230405', dari: 'ortu', isi: 'Selamat pagi Pak, Dimas sudah sembuh dan besok masuk sekolah. Apakah ada tugas yang perlu dikejar?', waktu: lalu(0, 6, 15), dibacaOrtu: true, dibacaGuru: false },
  ]
  const terbaca = [] // [pid, id pembaca, waktu] untuk pesan lama yang sudah dibaca
  for (const p of [...lama].sort((a, b) => a.waktu.localeCompare(b.waktu))) {
    const w = wali(kelasDari(p.nis))
    if (!w) continue
    const [o, g] = [idOrtu(p.nis), idGuru(w.id)]
    const pid = idPribadi(o, g)
    tambah(pid, p.dari === 'guru' ? g : o, p.waktu, p.isi)
    if (p.dibacaOrtu) terbaca.push([pid, o, p.waktu])
    if (p.dibacaGuru) terbaca.push([pid, g, p.waktu])
  }

  const andi = wali('4A')
  const maria = data.guru.find((g) => g.nama.startsWith('Maria Natalia'))
  const tu = data.guru.find((g) => g.peran?.includes('tata_usaha'))
  const rina = wali('1A')
  if (andi) {
    const k = idGrupKelas('4A')
    tambah(k, idGuru(andi.id), lalu(2, 7, 10), 'Selamat pagi anak-anak kelas 4A! 🌞 Besok jangan lupa membawa buku gambar untuk pelajaran Seni Budaya ya.')
    tambah(k, idSiswa('230401'), lalu(2, 7, 25), 'Baik, Pak! Krayon juga dibawa, Pak?')
    tambah(k, idGuru(andi.id), lalu(2, 7, 31), 'Boleh, Rafa. Krayon atau pensil warna, dua-duanya boleh.')
    if (maria) tambah(k, idGuru(maria.id), lalu(1, 13, 5), 'Good afternoon, class 4A! Untuk Bahasa Inggris, hafalkan 10 kosakata tentang hewan ya. See you! 🐘🦒')
    tambah(k, idSiswa('230402'), lalu(1, 15, 40), 'Siap, Miss Maria! 😊')

    const o = idGrupOrtu('4A')
    tambah(o, idGuru(andi.id), lalu(2, 16, 0), 'Selamat sore Bapak/Ibu. Rapat orang tua kelas 4A diadakan Sabtu depan pukul 09.00 di ruang kelas 4A. Mohon kehadirannya 🙏')
    tambah(o, idOrtu('230402'), lalu(2, 16, 20), 'Baik, Pak. Terima kasih infonya.')
    tambah(o, idOrtu('230401'), lalu(2, 18, 45), 'Siap hadir, Pak Andi.')
    if (maria) {
      const pid = idPribadi(idGuru(andi.id), idGuru(maria.id))
      tambah(pid, idGuru(andi.id), lalu(1, 10, 2), 'Miss Maria, minggu ini ada pengambilan nilai speaking untuk kelas 4A?')
      tambah(pid, idGuru(maria.id), lalu(1, 10, 9), 'Iya, Pak. Hari Selasa di jam pelajaran saya. Nanti nilainya langsung saya input.')
    }
  }
  if (kepsek) tambah(ID_GRUP_STAF, idGuru(kepsek.id), lalu(1, 12, 30), 'Bapak/Ibu, rapat evaluasi tengah semester hari Jumat pukul 13.00 di ruang guru. Mohon membawa rekap nilai PTS kelas masing-masing.')
  if (tu) tambah(ID_GRUP_STAF, idGuru(tu.id), lalu(1, 14, 5), 'Info: pembayaran SPP bulan ini sudah masuk 82%. Rekap lengkap ada di menu Keuangan SPP.')
  if (rina) tambah(ID_GRUP_STAF, idGuru(rina.id), lalu(0, 7, 5), 'Baik, Bu. Rekap nilai kelas 1A sudah siap.')

  // Pesan grup contoh dianggap sudah dibaca, kecuali pesan terakhir bagi akun demo agar notifikasinya terlihat
  const tandai = (pid, siapa, waktu) => ((dibaca[siapa] ??= {})[pid] = waktu)
  for (const [pid, daftar] of Object.entries(pesan)) {
    if (!pid.startsWith('grup:')) continue
    const terakhir = daftar.at(-1).waktu
    const sebelum = daftar.at(-2)?.waktu ?? terakhir
    for (const a of anggota(data, pid)) tandai(pid, a, ['g:g2', 's:230401', 'o:230401'].includes(a) ? sebelum : terakhir)
  }
  for (const [pid, siapa, waktu] of terbaca) if ((dibaca[siapa]?.[pid] ?? '') < waktu) tandai(pid, siapa, waktu)
  // Pengirim pasti sudah membaca percakapan sampai pesannya sendiri
  for (const [pid, daftar] of Object.entries(pesan)) for (const p of daftar) if ((dibaca[p.dari]?.[pid] ?? '') < p.waktu) tandai(pid, p.dari, p.waktu)
  return { pesan, dibaca, pengaturan: {} }
}

function bacaChat(data) {
  try {
    const tersimpan = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (tersimpan?.pesan) return { dibaca: {}, pengaturan: {}, ...tersimpan }
  } catch {
    /* data rusak: buat ulang */
  }
  return buatChatContoh(data)
}

export function ChatProvider({ children }) {
  const { data } = useData()
  const [state, setState] = useState(() => bacaChat(data))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* penyimpanan penuh: pesan tetap tampil sampai halaman dimuat ulang */
    }
  }, [state])

  // Sinkron antartab: pesan dari tab lain langsung muncul
  useEffect(() => {
    const sinkron = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        setState(JSON.parse(e.newValue))
      } catch {
        /* abaikan */
      }
    }
    window.addEventListener('storage', sinkron)
    return () => window.removeEventListener('storage', sinkron)
  }, [])

  const kirim = useCallback((pid, dari, isi) => {
    const p = { id: uid() + uid(), dari, waktu: new Date().toISOString(), ...isi }
    setState((s) => {
      const daftar = [...(s.pesan[pid] ?? []), p]
      // Batasi panjang riwayat; berkas pesan yang terbuang ikut dihapus
      const buang = daftar.length > MAKS_PESAN ? daftar.splice(0, daftar.length - MAKS_PESAN) : []
      buang.forEach((x) => x.lampiran && hapusBerkas(x.lampiran.id).catch(() => {}))
      return { ...s, pesan: { ...s.pesan, [pid]: daftar }, dibaca: { ...s.dibaca, [dari]: { ...s.dibaca[dari], [pid]: p.waktu } } }
    })
    return p
  }, [])

  // Hapus pesan (milik sendiri, atau oleh pengelola grup). Isi & berkasnya ikut dihapus.
  const hapus = useCallback((pid, idPesan, oleh) => {
    setState((s) => {
      const p = s.pesan[pid]?.find((x) => x.id === idPesan)
      if (!p || p.dihapus) return s
      if (p.lampiran) hapusBerkas(p.lampiran.id).catch(() => {})
      const baru = { id: p.id, dari: p.dari, waktu: p.waktu, dihapus: { oleh, waktu: new Date().toISOString() } }
      return { ...s, pesan: { ...s.pesan, [pid]: s.pesan[pid].map((x) => (x.id === idPesan ? baru : x)) } }
    })
  }, [])

  const tandaiDibaca = useCallback((siapa, pid) => {
    setState((s) => {
      const terakhir = s.pesan[pid]?.at(-1)?.waktu
      if (!terakhir || (s.dibaca[siapa]?.[pid] ?? '') >= terakhir) return s
      return { ...s, dibaca: { ...s.dibaca, [siapa]: { ...s.dibaca[siapa], [pid]: terakhir } } }
    })
  }, [])

  const aturGrup = useCallback((pid, pengaturan, oleh) => {
    setState((s) => ({ ...s, pengaturan: { ...s.pengaturan, [pid]: { ...s.pengaturan[pid], ...pengaturan, oleh, waktu: new Date().toISOString() } } }))
  }, [])

  const resetChat = useCallback(() => {
    hapusSemuaBerkas().catch(() => {})
    setState(buatChatContoh({ ...data, pesan: undefined }))
  }, [data])

  const nilai = useMemo(() => ({ state, kirim, hapus, tandaiDibaca, aturGrup, resetChat }), [state, kirim, hapus, tandaiDibaca, aturGrup, resetChat])
  return <ChatContext.Provider value={nilai}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)

// ID chat pengguna yang login + daftar percakapannya (untuk menu, notifikasi, dan halaman chat)
export function useChatSaya() {
  const { user } = useAuth()
  const akses = useAkses()
  const { data } = useData()
  const { state } = useChat()
  const saya = idChatDari(user, akses)
  const percakapan = useMemo(() => daftarPercakapan(data, state, saya), [data, state, saya])
  const belum = percakapan.reduce((n, p) => n + p.belum, 0)
  return { saya, percakapan, belum }
}

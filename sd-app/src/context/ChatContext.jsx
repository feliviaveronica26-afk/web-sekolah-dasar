import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAkses } from './akses'
import { useAuth } from './AuthContext'
import { useData } from './DataContext'
import { api } from '../utils/api'
import { daftarPercakapan, idChatDari } from '../utils/chat'

/*
  Chat tersimpan di server Laravel (tabel chat_pesan, chat_dibaca, chat_grup; berkas di storage).
  Website memuat percakapan milik pengguna, lalu hanya mengambil pesan baru/berubah setiap kali
  penanda versi "chat" berubah (lihat DataContext).
  state = {
    pesan:      { [id percakapan]: [{ id, dari, waktu, teks?, lampiran?, dihapus? }] },
    dibaca:     { [id pengguna]: { [id percakapan]: waktu terakhir dibaca } },
    pengaturan: { [id grup]: { hanyaAdmin, oleh, waktu } },
  }
*/
export const CHAT_KOSONG = { pesan: {}, dibaca: {}, pengaturan: {} }

const ChatContext = createContext(null)

// Gabungkan pesan baru/berubah per id, tetap urut waktu
function gabungPesan(lama, baru) {
  const hasil = { ...lama }
  for (const [pid, daftar] of Object.entries(baru)) {
    const perId = new Map((hasil[pid] ?? []).map((p) => [p.id, p]))
    for (const p of daftar) perId.set(p.id, p)
    hasil[pid] = [...perId.values()].sort((a, b) => a.waktu.localeCompare(b.waktu))
  }
  return hasil
}

const gabungDibaca = (lama, baru) => {
  const hasil = { ...lama }
  for (const [siapa, perPid] of Object.entries(baru)) {
    hasil[siapa] = { ...hasil[siapa] }
    for (const [pid, waktu] of Object.entries(perPid)) if (waktu && (hasil[siapa][pid] ?? '') < waktu) hasil[siapa][pid] = waktu
  }
  return hasil
}

export function ChatProvider({ children, awal }) {
  const { user } = useAuth()
  const { versiChat, beritahu } = useData()
  const [state, setState] = useState(() => awal ?? CHAT_KOSONG)
  const waktuServer = useRef(null)
  const generasi = useRef(0)
  const akun = user ? `${user.role}:${user.username}` : ''

  const muatChat = useCallback(async (lengkap = false) => {
    const gen = generasi.current
    try {
      const sejak = !lengkap && waktuServer.current ? `?sejak=${encodeURIComponent(waktuServer.current)}` : ''
      const hasil = await api(`/chat${sejak}`, { latar: true })
      if (gen !== generasi.current) return
      waktuServer.current = hasil.waktu
      setState((s) => ({
        pesan: gabungPesan(hasil.lengkap ? {} : s.pesan, hasil.pesan),
        dibaca: gabungDibaca(hasil.lengkap ? {} : s.dibaca, hasil.dibaca),
        pengaturan: hasil.pengaturan,
      }))
    } catch {
      /* dicoba lagi saat penanda versi chat berubah */
    }
  }, [])

  // Pengguna berganti: kosongkan chat pengguna sebelumnya lalu muat milik pengguna baru
  const awalPertama = useRef(!!awal)
  useEffect(() => {
    if (awalPertama.current) {
      awalPertama.current = false
      return
    }
    generasi.current++
    waktuServer.current = null
    setState(CHAT_KOSONG)
    if (akun) muatChat(true)
  }, [akun, muatChat])

  // Ada pesan baru dari perangkat lain
  useEffect(() => {
    if (akun && versiChat && waktuServer.current) muatChat()
  }, [akun, versiChat, muatChat])

  // Kirim pesan: { teks?, berkas?: { blob, jenis, nama, durasi? } }. Hasil: null atau pesan galat.
  const kirim = useCallback(async (pid, { teks, berkas }) => {
    const isian = new FormData()
    isian.append('percakapan', pid)
    if (teks) isian.append('teks', teks)
    if (berkas) {
      isian.append('berkas', berkas.blob, berkas.nama)
      isian.append('jenis', berkas.jenis)
      isian.append('nama', berkas.nama)
      if (berkas.durasi) isian.append('durasi', String(berkas.durasi))
    }
    try {
      const hasil = await api('/chat/pesan', { method: 'POST', body: isian })
      setState((s) => ({ ...s, pesan: gabungPesan(s.pesan, { [pid]: [hasil.pesan] }), dibaca: gabungDibaca(s.dibaca, hasil.dibaca) }))
      return null
    } catch (e) {
      return e.message
    }
  }, [])

  // Hapus pesan (milik sendiri, atau oleh pengelola grup). Isi & berkasnya ikut dihapus di server.
  const hapus = useCallback(
    async (pid, idPesan) => {
      try {
        const hasil = await api(`/chat/pesan/${encodeURIComponent(idPesan)}`, { method: 'DELETE' })
        setState((s) => ({ ...s, pesan: gabungPesan(s.pesan, { [pid]: [hasil.pesan] }) }))
      } catch (e) {
        beritahu(e.message)
      }
    },
    [beritahu],
  )

  // Tandai sudah dibaca sampai pesan terakhir; dikirim ke server hanya jika ada yang baru
  const sedangDitandai = useRef(new Set())
  const tandaiDibaca = useCallback(
    (siapa, pid) => {
      const terakhir = state.pesan[pid]?.at(-1)?.waktu
      if (!terakhir || (state.dibaca[siapa]?.[pid] ?? '') >= terakhir || sedangDitandai.current.has(pid)) return
      sedangDitandai.current.add(pid)
      setState((s) => ({ ...s, dibaca: gabungDibaca(s.dibaca, { [siapa]: { [pid]: terakhir } }) }))
      api('/chat/dibaca', { method: 'POST', body: { percakapan: pid }, latar: true })
        .then((hasil) => setState((s) => ({ ...s, dibaca: gabungDibaca(s.dibaca, hasil.dibaca) })))
        .catch(() => {})
        .finally(() => sedangDitandai.current.delete(pid))
    },
    [state.pesan, state.dibaca],
  )

  const aturGrup = useCallback(
    async (pid, pengaturan) => {
      try {
        const hasil = await api('/chat/grup', { method: 'PUT', body: { percakapan: pid, ...pengaturan } })
        setState((s) => ({ ...s, pengaturan: { ...s.pengaturan, ...hasil.pengaturan } }))
      } catch (e) {
        beritahu(e.message)
      }
    },
    [beritahu],
  )

  const nilai = useMemo(() => ({ state, kirim, hapus, tandaiDibaca, aturGrup, muatChat }), [state, kirim, hapus, tandaiDibaca, aturGrup, muatChat])
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

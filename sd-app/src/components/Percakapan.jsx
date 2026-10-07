import { useEffect, useRef, useState } from 'react'
import { CheckCheck, Send } from 'lucide-react'
import { Avatar } from './ui'
import { useData } from '../context/DataContext'
import { formatTanggal, todayKey } from '../utils/format'

const jam = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
const tanggalDari = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Templat pesan cepat agar orang tua/guru tidak perlu mengetik dari awal
const TEMPLAT = {
  ortu: ['Mohon info tugas hari ini, Bu/Pak.', 'Anak saya akan datang terlambat hari ini.', 'Terima kasih atas informasinya 🙏'],
  guru: ['Terima kasih, Bu/Pak. Informasinya sudah saya terima.', 'Baik, akan saya sampaikan kepada ananda.', 'Mohon diajukan lewat menu Izin di portal ya.'],
}

// Percakapan satu siswa antara orang tua dan wali kelas. `pihak` = 'ortu' atau 'guru' (yang sedang membuka)
export default function Percakapan({ nis, pihak, namaPengirim, namaLawan }) {
  const { data, kirimPesan, bacaPesan } = useData()
  const [teks, setTeks] = useState('')
  const akhirRef = useRef(null)
  const pesan = data.pesan.filter((p) => p.nis === nis).sort((a, b) => a.waktu.localeCompare(b.waktu))
  const belumDibaca = pesan.filter((p) => !(pihak === 'ortu' ? p.dibacaOrtu : p.dibacaGuru)).length

  // Tandai pesan sudah dibaca saat percakapan dibuka / ada pesan baru
  useEffect(() => {
    if (belumDibaca) bacaPesan(nis, pihak)
  }, [nis, pihak, belumDibaca, bacaPesan])

  useEffect(() => {
    akhirRef.current?.scrollIntoView({ block: 'nearest' })
  }, [pesan.length, nis])

  const kirim = (isi) => {
    const bersih = isi.trim()
    if (!bersih) return
    kirimPesan({ nis, dari: pihak, pengirim: namaPengirim, isi: bersih })
    setTeks('')
  }

  let tanggalSebelum = null
  return (
    <div className="flex h-[32rem] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:p-5">
        {pesan.length === 0 && <p className="py-16 text-center text-sm text-slate-500">Belum ada pesan. Mulai percakapan dengan {namaLawan}.</p>}
        {pesan.map((p) => {
          const milikSaya = p.dari === pihak
          const tgl = tanggalDari(p.waktu)
          const pemisah = tgl !== tanggalSebelum
          tanggalSebelum = tgl
          return (
            <div key={p.id}>
              {pemisah && (
                <p className="my-3 text-center">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{tgl === todayKey() ? 'Hari ini' : formatTanggal(tgl)}</span>
                </p>
              )}
              <div className={`flex items-end gap-2 ${milikSaya ? 'justify-end' : ''}`}>
                {!milikSaya && <Avatar nama={p.pengirim} size="xs" />}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    milikSaya ? 'rounded-br-md bg-primary-600 text-white' : 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-100'
                  }`}
                >
                  {!milikSaya && <p className="mb-0.5 text-xs font-bold text-primary-700">{p.pengirim}</p>}
                  <p className="whitespace-pre-line">{p.isi}</p>
                  <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${milikSaya ? 'text-primary-100' : 'text-slate-400'}`}>
                    {jam(p.waktu)}
                    {milikSaya && <CheckCheck className={`h-3.5 w-3.5 ${(pihak === 'ortu' ? p.dibacaGuru : p.dibacaOrtu) ? 'text-sky-200' : ''}`} />}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={akhirRef} />
      </div>

      <div className="border-t border-slate-100 bg-white p-3">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {TEMPLAT[pihak].map((t) => (
            <button key={t} onClick={() => kirim(t)} className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary-700">
              {t}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            kirim(teks)
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                kirim(teks)
              }
            }}
            rows={1}
            placeholder={`Tulis pesan untuk ${namaLawan}...`}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
          />
          <button type="submit" disabled={!teks.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-40" aria-label="Kirim">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

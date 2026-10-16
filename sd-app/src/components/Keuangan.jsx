import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CloudOff, Landmark, LoaderCircle, RefreshCw } from 'lucide-react'
import { Card, JudulKartu } from './ui'
import { useData } from '../context/DataContext'
import { api } from '../utils/api'
import { JENIS_KAS, kasDariSpp, ringkasBulan, rupiahRingkas, rupiahTanda, urutKas } from '../utils/keuangan'
import { bulanIni, namaBulan } from '../utils/spp'

/*
  Buku kas sekolah dari server (hanya Kepala Sekolah) digabung dengan pembayaran SPP.
  Sengaja tidak disimpan di localStorage: data keuangan tidak perlu tertinggal di browser.
*/
export function useKasSekolah() {
  const { data } = useData()
  const [manual, setManual] = useState(null) // null = belum dimuat
  const [galat, setGalat] = useState('')

  const muat = useCallback(async () => {
    setGalat('')
    try {
      setManual(await api('/keuangan'))
    } catch (e) {
      setGalat(e.message)
    }
  }, [])

  useEffect(() => {
    muat()
  }, [muat])

  const spp = useMemo(() => kasDariSpp(data.spp), [data.spp])
  const kas = useMemo(() => (manual ? [...manual, ...spp].sort(urutKas) : null), [manual, spp])

  // Hasil: null jika berhasil, atau pesan galat untuk ditampilkan
  const simpan = async (item, id = null) => {
    try {
      const hasil = await api(id ? `/keuangan/${id}` : '/keuangan', { method: id ? 'PUT' : 'POST', body: item })
      setManual((m) => (id ? m.map((t) => (t.id === id ? hasil : t)) : [...m, hasil]))
      return null
    } catch (e) {
      return e.message
    }
  }

  const hapus = async (id) => {
    try {
      await api(`/keuangan/${id}`, { method: 'DELETE' })
      setManual((m) => m.filter((t) => t.id !== id))
      return null
    } catch (e) {
      return e.message
    }
  }

  return { kas, galat, muat, simpan, hapus }
}

// Keterangan saat data keuangan sedang dimuat atau server tidak bisa dihubungi
export function StatusKas({ galat, muat }) {
  if (!galat) {
    return (
      <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
        <LoaderCircle className="h-4 w-4 animate-spin" /> Memuat data keuangan…
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center">
      <p className="flex flex-1 items-start gap-2">
        <CloudOff className="mt-0.5 h-4 w-4 shrink-0" /> {galat}
      </p>
      <button onClick={muat} className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-semibold ring-1 ring-amber-200 hover:bg-amber-100">
        <RefreshCw className="h-3.5 w-3.5" /> Coba lagi
      </button>
    </div>
  )
}

// Kartu ringkas untuk beranda Kepala Sekolah
export function KartuKas({ ke }) {
  const { kas, galat, muat } = useKasSekolah()
  const bulan = bulanIni()
  const r = kas && ringkasBulan(kas, bulan)
  const namaB = namaBulan(bulan, { month: 'long' })

  return (
    <Card className="p-6">
      <JudulKartu icon={Landmark} judul="Kas sekolah">
        <Link to={ke} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
          Detail <ArrowRight className="h-4 w-4" />
        </Link>
      </JudulKartu>
      {!r ? (
        <StatusKas galat={galat} muat={muat} />
      ) : (
        <>
          <p className="text-sm text-slate-500">Saldo kas saat ini</p>
          <p className="text-3xl font-extrabold text-slate-900">{rupiahTanda(r.saldoAkhir)}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {['masuk', 'keluar'].map((j) => (
              <div key={j} className="rounded-xl bg-slate-50 p-4">
                <p className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 rounded-sm" style={{ background: JENIS_KAS[j].warna }} />
                  {JENIS_KAS[j].label} {namaB}
                </p>
                <p className="mt-0.5 text-lg font-extrabold text-slate-900">{rupiahRingkas(r[j])}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

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
      <p className="d-flex align-items-center gap-2 py-6 fs-sm text-tinta-3">
        <LoaderCircle className="h-4 w-4 berputar" /> Memuat data keuangan…
      </p>
    )
  }
  return (
    <div className="d-flex flex-column gap-3 rounded-2 border border-warning-subtle bg-warning-subtle px-4 py-3 fs-sm text-warning-emphasis flex-sm-row align-items-sm-center">
      <p className="d-flex flex-1 align-items-start gap-2">
        <CloudOff className="mt-0-5 h-4 w-4 flex-shrink-0" /> {galat}
      </p>
      <button onClick={muat} className="d-flex flex-shrink-0 align-items-center justify-content-center gap-1-5 rounded-1 bg-white px-3 py-1-5 fw-semibold border border-warning-subtle hover-redup">
        <RefreshCw className="h-3-5 w-3-5" /> Coba lagi
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
        <Link to={ke} className="d-flex align-items-center gap-1 fs-sm fw-semibold text-primary">
          Detail <ArrowRight className="h-4 w-4" />
        </Link>
      </JudulKartu>
      {!r ? (
        <StatusKas galat={galat} muat={muat} />
      ) : (
        <>
          <p className="fs-sm text-tinta-3">Saldo kas saat ini</p>
          <p className="fs-3xl fw-extrabold text-tinta">{rupiahTanda(r.saldoAkhir)}</p>
          <div className="mt-4 d-grid kolom-2 gap-3">
            {['masuk', 'keluar'].map((j) => (
              <div key={j} className="rounded-2 bg-abu-50 p-4">
                <p className="d-flex align-items-center gap-1-5 fs-xs text-tinta-2">
                  <span className="h-2 w-2 rounded-1" style={{ background: JENIS_KAS[j].warna }} />
                  {JENIS_KAS[j].label} {namaB}
                </p>
                <p className="mt-0-5 fs-lg fw-extrabold text-tinta">{rupiahRingkas(r[j])}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

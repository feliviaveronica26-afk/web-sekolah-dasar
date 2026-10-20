import { useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react'
import { Building2, Cake, Hash, IdCard, Layers, ShieldCheck, Tent, User, X } from 'lucide-react'
import { Avatar, btn } from './ui'
import { EKSKUL, GEDUNG_KELAS, lantaiKelas } from '../data/dummy'
import { bolehIkutEkskul } from '../utils/prestasi'
import { kurangiGerak } from '../utils/gerak'
import { namaJk, teksUlangTahun, ulangTahunHariIni } from '../utils/siswa'

/*
  Kartu data diri teman sekelas yang "terbang" dari kotak nama yang diklik ke tengah layar (FLIP:
  kartu dirender di tengah, lalu dianimasikan dari posisi & ukuran kotak asal). Saat ditutup kartu
  kembali ke kotak asalnya. Hanya transform & opacity; mati bila "kurangi gerakan" aktif.

  Data yang ditampilkan hanya yang akurat & wajar dikenal antar teman. Absensi, nilai, poin sikap,
  ekskul pilihan, dan biodata pribadi teman (NISN, kelahiran, agama, kesehatan) memang tidak dikirim
  server ke akun siswa (privasi); dari tanggal lahir hanya tanggal & bulan ulang tahunnya. Alamat
  rumah & kontak orang tua juga tidak ditampilkan.
*/

const MASUK = 520 // ms: kartu terbang ke tengah (lintasannya cukup lama untuk terlihat)
const KELUAR = 300 // ms: sekitar 60% durasi masuk, agar terasa sigap
const PEGAS = 'cubic-bezier(0.34, 1.2, 0.64, 1)' // melaju, sedikit melewati tujuan, lalu mendarat
const PERGI = 'cubic-bezier(0.4, 0, 1, 1)'

const faseKelas = (kelas) => {
  const n = parseInt(kelas, 10)
  return n <= 2 ? 'Fase A' : n <= 4 ? 'Fase B' : 'Fase C'
}

// Transformasi yang menempatkan kartu (pada ukuran aslinya) tepat di atas kotak nama asal
function keAsal(kartu, asal) {
  const a = kartu.getBoundingClientRect()
  const b = asal.getBoundingClientRect()
  const skala = Math.max(0.15, b.width / a.width)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  return `translate(${dx}px, ${dy}px) scale(${skala})`
}

function Info({ icon: Icon, label, children, lebar = false }) {
  return (
    <div className={`rounded-3 bg-abu-50 px-3-5 py-3 ${lebar ? 'rentang-2' : ''}`}>
      <dt className="d-flex align-items-center gap-1-5 fs-xs fw-medium text-tinta-3">
        <Icon className="h-3-5 w-3-5 flex-shrink-0" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 fw-semibold lh-snug text-tinta">{children}</dd>
    </div>
  )
}

const Chip = ({ children }) => (
  <span className="d-inline-flex align-items-center rounded-pill bg-white bg-opacity-15 px-2-5 py-1 fs-xs fw-bold border border-white border-opacity-20">{children}</span>
)

export default function KartuTeman({ teman, asal, nomorAbsen, data, onTutup }) {
  const kartuRef = useRef(null)
  const latarRef = useRef(null)
  const tombolTutupRef = useRef(null)
  const masukRef = useRef(null)
  const menutupRef = useRef(false)
  const idJudul = useId()

  const wali = data.guru.find((g) => g.peran?.includes('wali_kelas') && g.kelas === teman.kelas)
  const lantai = lantaiKelas(teman.kelas)
  const sisi = GEDUNG_KELAS.find((l) => l.lantai === lantai)?.utara.includes(teman.kelas) ? 'sisi utara' : 'sisi selatan'
  const kegiatanWajib = EKSKUL.filter((e) => e.wajib && bolehIkutEkskul(e, teman.kelas))

  // Masuk: dari kotak nama ke tengah (atau naik lembut bila kotak asal tidak ada)
  useLayoutEffect(() => {
    tombolTutupRef.current?.focus({ preventScroll: true })
    const kartu = kartuRef.current
    if (!kartu || kurangiGerak()) return
    const latar = latarRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' })
    masukRef.current = asal?.isConnected
      ? kartu.animate([{ transform: keAsal(kartu, asal), opacity: 0.35 }, { transform: 'none', opacity: 1 }], { duration: MASUK, easing: PEGAS })
      : kartu.animate([{ transform: 'translateY(16px) scale(0.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
    return () => {
      latar?.cancel()
      masukRef.current?.cancel()
    }
  }, [asal])

  // Keluar: kembali ke kotak asal, lebih cepat dari masuk. Bisa disela saat kartu masih terbang.
  const tutup = useCallback(() => {
    if (menutupRef.current) return
    menutupRef.current = true
    const kartu = kartuRef.current
    let beres = false
    const akhiri = () => {
      if (beres) return
      beres = true
      if (kartuRef.current) kartuRef.current.style.visibility = 'hidden' // cegah kartu sekilas tampil di tengah
      onTutup()
    }
    if (!kartu || kurangiGerak()) return akhiri()
    setTimeout(akhiri, KELUAR + 150) // jaring pengaman: tetap tertutup walau event animasi tidak datang
    latarRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: KELUAR, easing: 'ease-in', fill: 'forwards' })
    const masuk = masukRef.current
    if (masuk?.playState === 'running') {
      masuk.updatePlaybackRate(-1.8) // putar balik dari posisi sekarang
      masuk.finished.then(akhiri, akhiri)
      return
    }
    const tujuan = asal?.isConnected ? keAsal(kartu, asal) : 'translateY(16px) scale(0.96)'
    kartu
      .animate([{ transform: 'none', opacity: 1 }, { transform: tujuan, opacity: 0 }], { duration: KELUAR, easing: PERGI, fill: 'forwards' })
      .finished.then(akhiri, akhiri)
  }, [asal, onTutup])

  // Esc menutup, Tab berputar di dalam kartu, gulir halaman dikunci; fokus kembali ke kotak nama
  const tutupTerbaru = useRef(tutup)
  tutupTerbaru.current = tutup
  useEffect(() => {
    const overflowAwal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const tombol = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        tutupTerbaru.current()
      } else if (e.key === 'Tab') {
        const fokus = kartuRef.current?.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
        if (!fokus?.length) return
        const pertama = fokus[0]
        const terakhir = fokus[fokus.length - 1]
        if (e.shiftKey && document.activeElement === pertama) {
          e.preventDefault()
          terakhir.focus()
        } else if (!e.shiftKey && document.activeElement === terakhir) {
          e.preventDefault()
          pertama.focus()
        }
      }
    }
    document.addEventListener('keydown', tombol)
    return () => {
      document.removeEventListener('keydown', tombol)
      document.body.style.overflow = overflowAwal
      asal?.focus?.({ preventScroll: true })
    }
  }, [asal])

  return (
    <div className="position-fixed inset-0 z-50 d-flex align-items-center justify-content-center p-4">
      <div ref={latarRef} className="position-absolute inset-0 latar-redup buram-sm" onClick={tutup} aria-hidden="true" />

      <article
        ref={kartuRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idJudul}
        className="position-relative d-flex mh-kartu-teman w-100 mw-md flex-column overflow-hidden rounded-kartu bg-white shadow-lg"
      >
        {/* Kepala bergaya kartu pelajar */}
        <div className="position-relative isolate overflow-hidden gradasi-merah px-6 pb-6 pt-5 text-white">
          <span aria-hidden="true" className="pola-titik position-absolute inset-0 z-n1 opacity-60" />
          <span aria-hidden="true" className="kartu-teman__cincin" />
          <div className="d-flex align-items-start justify-content-between gap-3">
            <p className="d-inline-flex align-items-center gap-1-5 pt-1 fs-2xs fw-bold text-uppercase ls-widest text-merah-100">
              <IdCard className="h-4 w-4" aria-hidden="true" /> Kartu Data Diri
            </p>
            <button
              ref={tombolTutupRef}
              type="button"
              onClick={tutup}
              aria-label="Tutup kartu data diri"
              className="me-n2 mt-n1 d-flex h-10 w-10 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-white bg-opacity-15 text-white border border-white border-opacity-25 transisi hover-terang"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 d-flex align-items-center gap-4">
            <Avatar nama={teman.nama} size="xl" className="bg-white text-merah-700 cincin-putih-tebal" />
            <div className="min-w-0">
              <h2 id={idJudul} className="fs-xl lh-tight text-white">
                {teman.nama}
              </h2>
              <p className="mt-1 fs-sm text-merah-100">
                Siswa Kelas {teman.kelas} · {faseKelas(teman.kelas)}
              </p>
              <div className="mt-2-5 d-flex flex-wrap gap-1-5">
                <Chip>No. absen {nomorAbsen}</Chip>
                <Chip>{namaJk(teman.jk)}</Chip>
                {ulangTahunHariIni(teman) && <Chip>Berulang tahun hari ini</Chip>}
              </div>
            </div>
          </div>
        </div>

        {/* Isi: muncul berurutan setelah kartu tiba (lihat .isi-bertahap) */}
        <div className="isi-bertahap antara-y-5 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="mb-2-5 fs-sm fw-bold text-tinta">Identitas siswa</h3>
            <dl className="d-grid kolom-2 gap-2-5 fs-sm">
              <Info icon={Hash} label="NIS">
                {teman.nis}
              </Info>
              <Info icon={User} label="Jenis kelamin">
                {namaJk(teman.jk)}
              </Info>
              <Info icon={Layers} label="Kelas">
                {teman.kelas} · {faseKelas(teman.kelas)}
              </Info>
              {teman.ulangTahun && (
                <Info icon={Cake} label="Ulang tahun">
                  {teksUlangTahun(teman.ulangTahun)}
                </Info>
              )}
            </dl>
          </section>

          <section>
            <h3 className="mb-2-5 fs-sm fw-bold text-tinta">Kelas & ruang belajar</h3>
            <div className="antara-y-2-5">
              {wali && (
                <div className="d-flex align-items-center gap-3 rounded-3 bg-abu-50 px-3-5 py-3">
                  <Avatar nama={wali.nama} size="sm" />
                  <div className="min-w-0 fs-sm">
                    <p className="fs-xs fw-medium text-tinta-3">Wali kelas {teman.kelas}</p>
                    <p className="text-truncate fw-semibold text-tinta">{wali.nama}</p>
                  </div>
                </div>
              )}
              {lantai && (
                <div className="d-flex align-items-center gap-3 rounded-3 bg-abu-50 px-3-5 py-3">
                  <span className="d-flex h-9 w-9 flex-shrink-0 align-items-center justify-content-center rounded-pill bg-merah-50 text-primary">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 fs-sm">
                    <p className="fs-xs fw-medium text-tinta-3">Ruang kelas</p>
                    <p className="fw-semibold text-tinta">
                      Gedung Utama · Lantai {lantai} · {sisi}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {kegiatanWajib.length > 0 && (
            <section>
              <h3 className="mb-2-5 fs-sm fw-bold text-tinta">Kegiatan wajib kelas</h3>
              <ul className="antara-y-2">
                {kegiatanWajib.map((e) => (
                  <li key={e.id} className="d-flex align-items-center gap-3 rounded-3 bg-abu-50 px-3-5 py-3 fs-sm">
                    <span className={`d-flex h-9 w-9 flex-shrink-0 align-items-center justify-content-center rounded-pill ${e.warna}`}>
                      <Tent className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="fw-semibold text-tinta">{e.nama}</p>
                      <p className="fs-xs text-tinta-3">
                        Setiap {e.hari}, {e.jam}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="d-flex align-items-start gap-2 fs-xs lh-relaxed text-tinta-3">
            <ShieldCheck className="mt-0-5 h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
            Alamat rumah dan kontak orang tua tidak ditampilkan untuk menjaga privasi setiap siswa.
          </p>
        </div>

        <div className="d-flex justify-content-end border-top border-abu-100 px-6 py-4">
          <button type="button" onClick={tutup} className={`${btn.secondary} w-100 w-sm-auto`}>
            Tutup
          </button>
        </div>
      </article>
    </div>
  )
}

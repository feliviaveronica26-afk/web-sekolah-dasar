import { useState } from 'react'
import { CalendarClock, DoorOpen, LogIn, LogOut, Plus, UserCheck, Users } from 'lucide-react'
import { Alert, Badge, Card, DashHeader, EmptyState, Modal, StatCard, btn, inputCls, labelCls } from '../../components/ui'
import { useGayaSitus } from '../../context/akses'
import { useData } from '../../context/DataContext'
import { KEPERLUAN_TAMU } from '../../data/dummy'
import { formatHari, jamSekarang, todayKey } from '../../utils/format'

const KOSONG = { nama: '', instansi: '', keperluan: '', bertemu: '', whatsapp: '', jumlah: 1 }

export default function BukuTamu() {
  const { data, tambah, ubah } = useData()
  const hariIni = todayKey()
  const [tanggal, setTanggal] = useState(hariIni)
  const [form, setForm] = useState(null) // null = modal tertutup
  const [pesan, setPesan] = useState('')
  // Portal satpam: kartu angka bergaya bento beranda situs (Kepala Sekolah tetap tampilan portal biasa)
  const situs = useGayaSitus()

  const tamuHariIni = data.bukuTamu.filter((t) => t.tanggal === hariIni)
  const diDalam = tamuHariIni.filter((t) => !t.keluar)
  const daftar = data.bukuTamu.filter((t) => t.tanggal === tanggal).sort((a, b) => b.masuk.localeCompare(a.masuk))
  const terjadwal = data.kunjungan
    .filter((k) => k.status === 'Dikonfirmasi' && k.tanggal === hariIni)
    .sort((a, b) => a.sesi.localeCompare(b.sesi))
  const sudahDatang = (k) => data.bukuTamu.some((t) => t.kodeKunjungan === k.kode)

  // Tanggal & jam masuk dicatat server
  const catatMasuk = async (tamu) => {
    if (await tambah('bukuTamu', tamu)) return false
    setPesan(`${tamu.nama} tercatat masuk pukul ${jamSekarang()}.`)
    return true
  }

  const simpan = async (e) => {
    e.preventDefault()
    if (!(await catatMasuk({ ...form, jumlah: Number(form.jumlah) || 1 }))) return
    setForm(null)
    setTanggal(hariIni)
  }

  const datangTerjadwal = (k) =>
    catatMasuk({
      nama: k.nama,
      instansi: k.keperluan,
      keperluan: 'Kunjungan sekolah terjadwal',
      bertemu: 'Tata Usaha',
      whatsapp: k.whatsapp,
      jumlah: k.jumlah,
      kodeKunjungan: k.kode,
    })

  const isi = (nama) => ({ value: form[nama], onChange: (e) => setForm({ ...form, [nama]: e.target.value }) })

  return (
    <>
      <DashHeader
        title="Buku Tamu"
        desc="Catat setiap tamu yang masuk dan keluar lingkungan sekolah."
        action={
          <button onClick={() => setForm({ ...KOSONG })} className={btn.primary}>
            <Plus className="h-4 w-4" /> Catat Tamu Masuk
          </button>
        }
      />

      {pesan && (
        <div className="mb-4">
          <Alert>{pesan}</Alert>
        </div>
      )}

      <div className="d-grid kolom-2 gap-4 kolom-lg-3">
        <StatCard
          icon={Users}
          label="Tamu hari ini"
          value={tamuHariIni.length}
          hint={`${tamuHariIni.reduce((a, t) => a + Number(t.jumlah), 0)} orang`}
          tone="sky"
          nada={situs ? 'merah' : undefined}
        />
        <StatCard icon={DoorOpen} label="Masih di dalam" value={diDalam.length} hint="belum tercatat keluar" tone="amber" nada={situs ? 'stabilo' : undefined} />
        <StatCard icon={CalendarClock} label="Kunjungan terjadwal" value={terjadwal.length} hint="hari ini" tone="emerald" nada={situs ? 'gelap' : undefined} />
      </div>

      {terjadwal.length > 0 && (
        <Card className="mt-6 p-5">
          <h2 className="fw-bold text-tinta">Kunjungan Terjadwal Hari Ini</h2>
          <p className="fs-sm text-tinta-3">Sudah dikonfirmasi Tata Usaha. Cocokkan kode booking saat tamu tiba.</p>
          <ul className="mt-4 antara-y-2">
            {terjadwal.map((k) => (
              <li key={k.id} className="ui-ubin d-flex flex-wrap align-items-center gap-3 rounded-2 bg-abu-50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="fw-semibold text-tinta">
                    {k.nama} <span className="font-monospace fs-xs text-abu-400">{k.kode}</span>
                  </p>
                  <p className="fs-xs text-tinta-3">
                    Pukul {k.sesi} · {k.jumlah} orang · {k.keperluan}
                  </p>
                </div>
                {sudahDatang(k) ? (
                  <Badge className="bg-success-subtle text-success">Sudah datang</Badge>
                ) : (
                  <button onClick={() => datangTerjadwal(k)} className={btn.secondary}>
                    <UserCheck className="h-4 w-4" /> Tandai Datang
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-6 overflow-hidden">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom border-abu-100 p-4">
          <h2 className="fw-bold text-tinta">{formatHari(tanggal)}</h2>
          <input type="date" value={tanggal} max={hariIni} onChange={(e) => setTanggal(e.target.value || hariIni)} className={`${inputCls} w-auto`} />
        </div>

        {daftar.length === 0 ? (
          <EmptyState icon={Users} title="Belum ada tamu" desc="Tamu yang dicatat pada tanggal ini akan muncul di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-100 min-w-720 text-start fs-sm">
              <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3 fw-semibold">Tamu</th>
                  <th className="px-5 py-3 fw-semibold">Keperluan</th>
                  <th className="px-5 py-3 fw-semibold">Masuk</th>
                  <th className="px-5 py-3 fw-semibold">Keluar</th>
                </tr>
              </thead>
              <tbody className="pembatas-y pembatas-abu">
                {daftar.map((t) => (
                  <tr key={t.id} className="hover-latar">
                    <td className="px-5 py-3">
                      <span className="d-block fw-semibold text-tinta">
                        {t.nama}
                        {t.jumlah > 1 && <span className="fw-normal text-tinta-3"> (+{t.jumlah - 1} orang)</span>}
                      </span>
                      <span className="d-block fs-xs text-tinta-3">{[t.instansi, t.whatsapp].filter(Boolean).join(' · ') || '–'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="d-block text-tinta-2">{t.keperluan}</span>
                      {t.bertemu && <span className="d-block fs-xs text-tinta-3">Bertemu: {t.bertemu}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="d-inline-flex align-items-center gap-1-5 fw-semibold text-tinta-2">
                        <LogIn className="h-4 w-4 teks-terang-emerald" /> {t.masuk}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {t.keluar ? (
                        <span className="d-inline-flex align-items-center gap-1-5 fw-semibold text-tinta-2">
                          <LogOut className="h-4 w-4 text-abu-400" /> {t.keluar}
                        </span>
                      ) : t.tanggal === hariIni ? (
                        <button
                          onClick={() => ubah('bukuTamu', t.id, { keluar: jamSekarang() })}
                          className={`d-inline-flex align-items-center gap-1-5 fs-xs ${
                            situs
                              ? 'min-h-9 rounded-pill bg-stabilo px-3-5 fw-bold text-tinta hover-redup'
                              : 'rounded-1 bg-warning-subtle px-3 py-1-5 fw-semibold text-warning-emphasis hover-redup'
                          }`}
                        >
                          <LogOut className="h-3-5 w-3-5" /> Catat Keluar
                        </button>
                      ) : (
                        <span className="text-abu-400">Tidak tercatat</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title="Catat Tamu Masuk"
        footer={
          <>
            <button type="button" onClick={() => setForm(null)} className={btn.secondary}>
              Batal
            </button>
            <button type="submit" form="form-tamu" className={btn.primary}>
              <LogIn className="h-4 w-4" /> Catat Masuk
            </button>
          </>
        }
      >
        {form && (
          <form id="form-tamu" onSubmit={simpan} className="d-grid gap-4 kolom-sm-2">
            <div className="rentang-sm-2">
              <label htmlFor="nama" className={labelCls}>Nama tamu</label>
              <input id="nama" required className={inputCls} placeholder="Nama lengkap" {...isi('nama')} />
            </div>
            <div>
              <label htmlFor="instansi" className={labelCls}>Instansi / hubungan</label>
              <input id="instansi" className={inputCls} placeholder="Contoh: Orang tua siswa 3A" {...isi('instansi')} />
            </div>
            <div>
              <label htmlFor="whatsapp" className={labelCls}>No. HP</label>
              <input id="whatsapp" type="tel" className={inputCls} placeholder="Opsional" {...isi('whatsapp')} />
            </div>
            <div>
              <label htmlFor="keperluan" className={labelCls}>Keperluan</label>
              <select id="keperluan" required className={inputCls} {...isi('keperluan')}>
                <option value="">Pilih keperluan</option>
                {KEPERLUAN_TAMU.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="jumlah" className={labelCls}>Jumlah orang</label>
              <input id="jumlah" type="number" min={1} required className={inputCls} {...isi('jumlah')} />
            </div>
            <div className="rentang-sm-2">
              <label htmlFor="bertemu" className={labelCls}>Bertemu dengan</label>
              <input id="bertemu" list="daftar-staf" className={inputCls} placeholder="Nama guru/staf yang dituju" {...isi('bertemu')} />
              <datalist id="daftar-staf">
                {data.guru.map((g) => (
                  <option key={g.id} value={g.nama} />
                ))}
              </datalist>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}

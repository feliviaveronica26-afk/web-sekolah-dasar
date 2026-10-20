import { useState } from 'react'
import { FileText, HeartPulse, Paperclip, Send } from 'lucide-react'
import { Alert, Card, DashHeader, EmptyState, IzinBadge, btn, inputCls, labelCls } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { formatTanggal, todayKey } from '../../utils/format'

const formAwal = () => ({ jenis: 'Sakit', tanggalMulai: todayKey(), tanggalSelesai: todayKey(), alasan: '', lampiran: '' })

export default function OrtuIzin() {
  const { user } = useAuth()
  const { data, ajukanIzin } = useData()
  const [form, setForm] = useState(formAwal)
  const [pesan, setPesan] = useState(null)

  const anak = data.siswa.find((s) => s.nis === user.anakNis)
  const riwayat = data.izin.filter((i) => i.nis === user.anakNis)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const [mengirim, setMengirim] = useState(false)

  const kirim = async (e) => {
    e.preventDefault()
    if (mengirim) return
    if (form.tanggalSelesai < form.tanggalMulai) {
      return setPesan({ tone: 'error', teks: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' })
    }
    const formulir = e.target
    setMengirim(true)
    const galat = await ajukanIzin(form, { diam: true })
    setMengirim(false)
    if (galat) return setPesan({ tone: 'error', teks: galat })
    setForm(formAwal())
    formulir.reset()
    setPesan({ tone: 'success', teks: 'Pengajuan izin terkirim. Wali kelas akan segera meninjaunya.' })
  }

  return (
    <>
      <DashHeader title="Izin Tidak Masuk" desc="Ajukan izin atau sakit untuk ananda tanpa perlu mengirim surat ke sekolah." />

      <div className="d-grid gap-6 kolom-lg-10-12">
        <Card className="h-auto p-6">
          <h2 className="fw-bold text-tinta">Form Pengajuan</h2>
          <p className="mt-1 fs-sm text-tinta-3">
            Untuk: <span className="fw-semibold text-tinta-2">{anak?.nama}</span> · Kelas {anak?.kelas}
          </p>

          <form onSubmit={kirim} className="mt-5 antara-y-4">
            {pesan && <Alert tone={pesan.tone}>{pesan.teks}</Alert>}

            <div>
              <span className={labelCls}>Jenis</span>
              <div className="d-grid kolom-2 gap-3">
                {[
                  ['Sakit', HeartPulse],
                  ['Izin', FileText],
                ].map(([j, Icon]) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setForm({ ...form, jenis: j })}
                    className={`d-flex align-items-center justify-content-center gap-2 rounded-2 border border-2 px-4 py-3 fs-sm fw-semibold transisi ${
                      form.jenis === j ? 'border-merah-500 bg-merah-50 text-merah-700' : 'border-abu-200 text-tinta-2 hover-garis-abu'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {j}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-grid kolom-2 gap-3">
              <div>
                <label htmlFor="mulai" className={labelCls}>Dari tanggal</label>
                <input id="mulai" type="date" required value={form.tanggalMulai} onChange={set('tanggalMulai')} className={inputCls} />
              </div>
              <div>
                <label htmlFor="selesai" className={labelCls}>Sampai tanggal</label>
                <input id="selesai" type="date" required value={form.tanggalSelesai} onChange={set('tanggalSelesai')} className={inputCls} />
              </div>
            </div>

            <div>
              <label htmlFor="alasan" className={labelCls}>Keterangan</label>
              <textarea
                id="alasan"
                required
                rows={4}
                value={form.alasan}
                onChange={set('alasan')}
                className={inputCls}
                placeholder={form.jenis === 'Sakit' ? 'Contoh: Demam dan batuk sejak kemarin malam.' : 'Contoh: Acara keluarga di luar kota.'}
              />
            </div>

            <div>
              <label htmlFor="lampiran" className={labelCls}>Lampiran (opsional)</label>
              <input
                id="lampiran"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setForm({ ...form, lampiran: e.target.files[0]?.name ?? '' })}
                className="isian-berkas d-block w-100 fs-sm text-tinta-3"
              />
              <p className="mt-1 fs-xs text-tinta-3">Foto surat dokter atau surat izin (JPG, PNG, PDF).</p>
            </div>

            <button type="submit" disabled={mengirim} className={`${btn.primary} w-100`}>
              <Send className="h-4 w-4" /> Kirim Pengajuan
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="fw-bold text-tinta">Riwayat Pengajuan</h2>
          {riwayat.length === 0 ? (
            <EmptyState icon={FileText} title="Belum ada pengajuan" desc="Pengajuan izin yang Anda kirim akan muncul di sini." />
          ) : (
            <div className="mt-4 antara-y-3">
              {riwayat.map((i) => (
                <div key={i.id} className="rounded-2 border border-abu-100 p-4">
                  <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                    <div>
                      <p className="fw-semibold text-tinta">{i.jenis}</p>
                      <p className="fs-sm text-tinta-3">
                        {formatTanggal(i.tanggalMulai)}
                        {i.tanggalSelesai !== i.tanggalMulai && ` – ${formatTanggal(i.tanggalSelesai)}`}
                      </p>
                    </div>
                    <IzinBadge status={i.status} />
                  </div>
                  <p className="mt-2 fs-sm text-tinta-2">{i.alasan}</p>
                  {i.lampiran && (
                    <p className="mt-2 d-flex align-items-center gap-1-5 fs-xs text-tinta-3">
                      <Paperclip className="h-3-5 w-3-5" /> {i.lampiran}
                    </p>
                  )}
                  {i.catatanGuru && (
                    <p className="mt-3 rounded-1 bg-abu-50 px-3 py-2 fs-sm text-tinta-2">
                      <span className="fw-semibold">Catatan wali kelas:</span> {i.catatanGuru}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

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

  const kirim = (e) => {
    e.preventDefault()
    if (form.tanggalSelesai < form.tanggalMulai) {
      return setPesan({ tone: 'error', teks: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' })
    }
    ajukanIzin({ ...form, nis: anak.nis, namaSiswa: anak.nama, kelas: anak.kelas })
    setForm(formAwal())
    e.target.reset()
    setPesan({ tone: 'success', teks: 'Pengajuan izin terkirim. Wali kelas akan segera meninjaunya.' })
  }

  return (
    <>
      <DashHeader title="Izin Tidak Masuk" desc="Ajukan izin atau sakit untuk ananda tanpa perlu mengirim surat ke sekolah." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="h-fit p-6">
          <h2 className="font-bold text-slate-900">Form Pengajuan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Untuk: <span className="font-semibold text-slate-700">{anak?.nama}</span> · Kelas {anak?.kelas}
          </p>

          <form onSubmit={kirim} className="mt-5 space-y-4">
            {pesan && <Alert tone={pesan.tone}>{pesan.teks}</Alert>}

            <div>
              <span className={labelCls}>Jenis</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Sakit', HeartPulse],
                  ['Izin', FileText],
                ].map(([j, Icon]) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setForm({ ...form, jenis: j })}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      form.jenis === j ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {j}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="mt-1 text-xs text-slate-500">Foto surat dokter atau surat izin (JPG, PNG, PDF).</p>
            </div>

            <button type="submit" className={`${btn.primary} w-full`}>
              <Send className="h-4 w-4" /> Kirim Pengajuan
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-slate-900">Riwayat Pengajuan</h2>
          {riwayat.length === 0 ? (
            <EmptyState icon={FileText} title="Belum ada pengajuan" desc="Pengajuan izin yang Anda kirim akan muncul di sini." />
          ) : (
            <div className="mt-4 space-y-3">
              {riwayat.map((i) => (
                <div key={i.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{i.jenis}</p>
                      <p className="text-sm text-slate-500">
                        {formatTanggal(i.tanggalMulai)}
                        {i.tanggalSelesai !== i.tanggalMulai && ` – ${formatTanggal(i.tanggalSelesai)}`}
                      </p>
                    </div>
                    <IzinBadge status={i.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{i.alasan}</p>
                  {i.lampiran && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Paperclip className="h-3.5 w-3.5" /> {i.lampiran}
                    </p>
                  )}
                  {i.catatanGuru && (
                    <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <span className="font-semibold">Catatan wali kelas:</span> {i.catatanGuru}
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

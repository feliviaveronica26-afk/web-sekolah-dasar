import { useState } from 'react'
import { Inbox, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Alert, Card, DashHeader, EmptyState, Modal, btn, inputCls, labelCls } from './ui'
import { useData } from '../context/DataContext'

/*
  Halaman kelola data generik (tambah, ubah, hapus, cari).
  fields:  [{ name, label, type: 'text'|'number'|'select'|'textarea'|'date'|'email'|'tel'|'checkboxes'|'judul', options, required, full, placeholder, hint, tampil?(form) }]
           type 'judul' = judul bagian formulir (tanpa isian); tampil(form) = false menyembunyikan isian itu
  columns: [{ key, label, render?(item) }]
  aksiBaris: fungsi (item) => tombol tambahan di kolom Aksi (sebelum Ubah & Hapus)
  cariTambahan: fungsi (item) => teks lain yang ikut dicari (mis. nama anak pada data orang tua)
  namaItem: fungsi (item) => nama yang tampil di konfirmasi hapus (bawaan: item.nama / item.judul)
  tanpaHeader: sembunyikan judul halaman (untuk ditanam di dalam tab)
  ringkasan: elemen tambahan di antara judul dan tabel (mis. kartu statistik)
  saring:   fungsi (item) => boolean untuk membatasi data yang boleh dilihat pengguna
  tambahAwal: objek isian awal; setiap objek baru langsung membuka formulir tambah (mis. dari pintasan beranda)
  onTersimpan: fungsi (form, baru) setelah data tersimpan di server
*/
export default function CrudPage({ title, desc, koleksi, itemLabel, fields, columns, searchKeys, filter, kosong, urutkan, validasi, tanpaHeader, ringkasan, saring, aksiBaris, cariTambahan, namaItem, tambahAwal, onTersimpan }) {
  const { data, tambah, ubah, hapus } = useData()
  const [cari, setCari] = useState('')
  const [nilaiFilter, setNilaiFilter] = useState('')
  const [form, setForm] = useState(null) // null = modal tertutup
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [hapusItem, setHapusItem] = useState(null)
  const [galatHapus, setGalatHapus] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [awalDibuka, setAwalDibuka] = useState(null)

  // Buka formulir tambah berisi isian awal (disesuaikan saat render, tanpa efek)
  if (tambahAwal && tambahAwal !== awalDibuka) {
    setAwalDibuka(tambahAwal)
    setForm({ ...kosong, ...tambahAwal })
    setEditId(null)
    setError('')
  }

  const q = cari.trim().toLowerCase()
  // Koleksi yang belum dimuat (mis. data lama di browser) dianggap kosong
  const semua = data[koleksi] ?? []
  const milik = saring ? semua.filter(saring) : semua
  let daftar = milik.filter(
    (item) =>
      (!q || searchKeys.some((k) => String(item[k] ?? '').toLowerCase().includes(q)) || cariTambahan?.(item).toLowerCase().includes(q)) &&
      (!filter || !nilaiFilter || item[filter.key] === nilaiFilter),
  )
  if (urutkan) daftar = [...daftar].sort(urutkan)

  const bukaTambah = () => {
    setForm({ ...kosong })
    setEditId(null)
    setError('')
  }

  const bukaUbah = (item) => {
    setForm({ ...item })
    setEditId(item.id)
    setError('')
  }

  const tutup = () => setForm(null)

  // Data disimpan di server: tunggu jawabannya, galat dari server ditampilkan di formulir
  const simpan = async (e) => {
    e.preventDefault()
    if (menyimpan) return
    const pesanError = validasi?.(form, semua, editId)
    if (pesanError) return setError(pesanError)
    setMenyimpan(true)
    const galat = await (editId ? ubah(koleksi, editId, form, { diam: true }) : tambah(koleksi, form, { diam: true }))
    setMenyimpan(false)
    if (galat) return setError(galat)
    onTersimpan?.(form, !editId)
    tutup()
  }

  const bukaHapus = (item) => {
    setHapusItem(item)
    setGalatHapus('')
  }

  const konfirmasiHapus = async () => {
    if (menyimpan) return
    setMenyimpan(true)
    const galat = await hapus(koleksi, hapusItem.id, { diam: true })
    setMenyimpan(false)
    if (galat) return setGalatHapus(galat)
    setHapusItem(null)
  }

  const tombolTambah = (
    <button onClick={bukaTambah} className={`${btn.primary} flex-shrink-0 text-nowrap`}>
      <Plus className="h-4 w-4" /> Tambah {itemLabel}
    </button>
  )

  return (
    <>
      {!tanpaHeader && <DashHeader title={title} desc={desc} action={tombolTambah} />}
      {ringkasan}

      <Card className="overflow-hidden">
        <div className="d-flex flex-column gap-3 border-bottom border-abu-100 p-4 flex-sm-row">
          {tanpaHeader && tombolTambah}
          <div className="position-relative flex-1">
            <Search className="pe-none position-absolute start-3-5 top-50 h-4 w-4 translate-middle-y text-abu-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari..." className={`${inputCls} ps-10`} />
          </div>
          {filter && (
            <select value={nilaiFilter} onChange={(e) => setNilaiFilter(e.target.value)} className={`${inputCls} w-sm-48`}>
              <option value="">Semua {filter.label}</option>
              {filter.options.map((o) => (
                <option key={o} value={o}>
                  {filter.label} {o}
                </option>
              ))}
            </select>
          )}
        </div>

        {daftar.length === 0 ? (
          <EmptyState icon={Inbox} title="Data tidak ditemukan" desc="Coba ubah kata kunci pencarian atau tambahkan data baru." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-100 min-w-640 text-start fs-sm">
              <thead className="bg-abu-50 fs-xs text-uppercase ls-wider text-tinta-3">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="px-5 py-3 fw-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-end fw-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="pembatas-y pembatas-abu">
                {daftar.map((item) => (
                  <tr key={item.id} className="hover-latar">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-3 text-tinta-2">
                        {c.render ? c.render(item) : item[c.key]}
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      <div className="d-flex justify-content-end gap-1">
                        {aksiBaris?.(item)}
                        <button onClick={() => bukaUbah(item)} className="rounded-1 p-2 text-tinta-3 hover-latar-abu hover-teks-tinta" aria-label="Ubah">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => bukaHapus(item)} className="rounded-1 p-2 text-tinta-3 hover-latar-merah hover-teks-merah" aria-label="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-top border-abu-100 px-5 py-3 fs-xs text-tinta-3">
          Menampilkan {daftar.length} dari {milik.length} data
        </div>
      </Card>

      {/* Modal tambah/ubah */}
      <Modal open={!!form} onClose={tutup} title={`${editId ? 'Ubah' : 'Tambah'} ${itemLabel}`}>
        {form && (
          <form id="crud-form" onSubmit={simpan} className="d-grid gap-4 kolom-sm-2">
            {error && (
              // Gulir ke pesan galat (formulir panjang bisa sedang tergulir ke bawah)
              <div key={error} ref={(el) => el?.scrollIntoView({ block: 'nearest' })} className="rentang-sm-2">
                <Alert tone="error">{error}</Alert>
              </div>
            )}
            {fields.map((f) => {
              if (f.tampil && !f.tampil(form)) return null
              if (f.type === 'judul') {
                return (
                  <p key={f.name} className="border-top border-abu-100 pt-4 fs-xs fw-bold text-uppercase ls-wider text-tinta-3 pertama-tanpa-garis pertama-pt-0 rentang-sm-2">
                    {f.label}
                  </p>
                )
              }
              const props = {
                id: f.name,
                value: form[f.name] ?? '',
                onChange: (e) => setForm({ ...form, [f.name]: e.target.value }),
                required: f.required,
                placeholder: f.placeholder,
                className: inputCls,
              }
              if (f.type === 'checkboxes') {
                const nilai = form[f.name] ?? []
                const toggle = (v) =>
                  setForm({ ...form, [f.name]: nilai.includes(v) ? nilai.filter((x) => x !== v) : [...nilai, v] })
                return (
                  <fieldset key={f.name} className="rentang-sm-2">
                    <legend className={labelCls}>{f.label}</legend>
                    <div className="d-grid gap-2 kolom-sm-2">
                      {f.options.map((o) => (
                        <label
                          key={o.value}
                          className={`d-flex cursor-pointer align-items-center gap-2-5 rounded-2 border px-3 py-2-5 fs-sm transisi ${
                            nilai.includes(o.value) ? 'border-merah-400 bg-merah-50 fw-semibold text-merah-800' : 'border-abu-200 text-tinta-2'
                          }`}
                        >
                          <input type="checkbox" checked={nilai.includes(o.value)} onChange={() => toggle(o.value)} className="h-4 w-4 aksen-merah" />
                          {o.label}
                        </label>
                      ))}
                    </div>
                    {f.hint && <p className="mt-1-5 fs-xs text-tinta-3">{f.hint}</p>}
                  </fieldset>
                )
              }
              return (
                <div key={f.name} className={f.full || f.type === 'textarea' ? 'rentang-sm-2' : ''}>
                  <label htmlFor={f.name} className={labelCls}>
                    {f.label}
                  </label>
                  {f.type === 'select' ? (
                    <select {...props}>
                      <option value="">Pilih {f.label.toLowerCase()}</option>
                      {f.options.map((o) => (
                        <option key={o.value ?? o} value={o.value ?? o}>
                          {o.label ?? o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea rows={5} {...props} />
                  ) : (
                    <input type={f.type || 'text'} {...props} />
                  )}
                  {f.hint && <p className="mt-1-5 fs-xs text-tinta-3">{f.hint}</p>}
                </div>
              )
            })}
          </form>
        )}
        <div className="mt-6 d-flex flex-wrap justify-content-end gap-2">
          <button type="button" onClick={tutup} className={btn.secondary}>
            Batal
          </button>
          <button type="submit" form="crud-form" disabled={menyimpan} className={`${btn.primary}`}>
            {menyimpan ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </Modal>

      {/* Konfirmasi hapus */}
      <Modal
        open={!!hapusItem}
        onClose={() => setHapusItem(null)}
        title={`Hapus ${itemLabel}?`}
        size="max-w-md"
        footer={
          <>
            <button onClick={() => setHapusItem(null)} className={btn.secondary}>
              Batal
            </button>
            <button onClick={konfirmasiHapus} disabled={menyimpan} className="btn btn-danger">
              <Trash2 className="h-4 w-4" /> {menyimpan ? 'Menghapus…' : 'Hapus'}
            </button>
          </>
        }
      >
        {galatHapus && (
          <div className="mb-3">
            <Alert tone="error">{galatHapus}</Alert>
          </div>
        )}
        <p className="text-tinta-2">
          Data <span className="fw-semibold text-tinta">{hapusItem && (namaItem?.(hapusItem) ?? (hapusItem.nama || hapusItem.judul))}</span> akan dihapus permanen.
        </p>
      </Modal>
    </>
  )
}

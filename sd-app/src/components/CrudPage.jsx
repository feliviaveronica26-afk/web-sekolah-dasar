import { useState } from 'react'
import { Inbox, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Alert, Card, DashHeader, EmptyState, Modal, btn, inputCls, labelCls } from './ui'
import { useData } from '../context/DataContext'

/*
  Halaman kelola data generik (tambah, ubah, hapus, cari).
  fields:  [{ name, label, type: 'text'|'number'|'select'|'textarea'|'date'|'checkboxes', options, required, full, placeholder, hint }]
  columns: [{ key, label, render?(item) }]
  tanpaHeader: sembunyikan judul halaman (untuk ditanam di dalam tab)
  ringkasan: elemen tambahan di antara judul dan tabel (mis. kartu statistik)
*/
export default function CrudPage({ title, desc, koleksi, itemLabel, fields, columns, searchKeys, filter, kosong, urutkan, validasi, tanpaHeader, ringkasan }) {
  const { data, tambah, ubah, hapus } = useData()
  const [cari, setCari] = useState('')
  const [nilaiFilter, setNilaiFilter] = useState('')
  const [form, setForm] = useState(null) // null = modal tertutup
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [hapusItem, setHapusItem] = useState(null)

  const q = cari.trim().toLowerCase()
  let daftar = data[koleksi].filter(
    (item) =>
      (!q || searchKeys.some((k) => String(item[k] ?? '').toLowerCase().includes(q))) &&
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

  const simpan = (e) => {
    e.preventDefault()
    const pesanError = validasi?.(form, data[koleksi], editId)
    if (pesanError) return setError(pesanError)
    if (editId) ubah(koleksi, editId, form)
    else tambah(koleksi, form)
    tutup()
  }

  const tombolTambah = (
    <button onClick={bukaTambah} className={btn.primary}>
      <Plus className="h-4 w-4" /> Tambah {itemLabel}
    </button>
  )

  return (
    <>
      {!tanpaHeader && <DashHeader title={title} desc={desc} action={tombolTambah} />}
      {ringkasan}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          {tanpaHeader && tombolTambah}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari..." className={`${inputCls} pl-10`} />
          </div>
          {filter && (
            <select value={nilaiFilter} onChange={(e) => setNilaiFilter(e.target.value)} className={`${inputCls} sm:w-48`}>
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
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="px-5 py-3 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftar.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-3 text-slate-700">
                        {c.render ? c.render(item) : item[c.key]}
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => bukaUbah(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Ubah">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setHapusItem(item)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Hapus">
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
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          Menampilkan {daftar.length} dari {data[koleksi].length} data
        </div>
      </Card>

      {/* Modal tambah/ubah */}
      <Modal open={!!form} onClose={tutup} title={`${editId ? 'Ubah' : 'Tambah'} ${itemLabel}`}>
        {form && (
          <form id="crud-form" onSubmit={simpan} className="grid gap-4 sm:grid-cols-2">
            {error && (
              <div className="sm:col-span-2">
                <Alert tone="error">{error}</Alert>
              </div>
            )}
            {fields.map((f) => {
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
                  <fieldset key={f.name} className="sm:col-span-2">
                    <legend className={labelCls}>{f.label}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {f.options.map((o) => (
                        <label
                          key={o.value}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition ${
                            nilai.includes(o.value) ? 'border-primary-400 bg-primary-50 font-semibold text-primary-800' : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          <input type="checkbox" checked={nilai.includes(o.value)} onChange={() => toggle(o.value)} className="h-4 w-4 accent-primary-600" />
                          {o.label}
                        </label>
                      ))}
                    </div>
                    {f.hint && <p className="mt-1.5 text-xs text-slate-500">{f.hint}</p>}
                  </fieldset>
                )
              }
              return (
                <div key={f.name} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
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
                  {f.hint && <p className="mt-1.5 text-xs text-slate-500">{f.hint}</p>}
                </div>
              )
            })}
          </form>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={tutup} className={btn.secondary}>
            Batal
          </button>
          <button type="submit" form="crud-form" className={btn.primary}>
            Simpan
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
            <button
              onClick={() => {
                hapus(koleksi, hapusItem.id)
                setHapusItem(null)
              }}
              className={`${btn.primary} bg-rose-600 hover:bg-rose-700`}
            >
              <Trash2 className="h-4 w-4" /> Hapus
            </button>
          </>
        }
      >
        <p className="text-slate-600">
          Data <span className="font-semibold text-slate-900">{hapusItem?.nama || hapusItem?.judul}</span> akan dihapus permanen.
        </p>
      </Modal>
    </>
  )
}

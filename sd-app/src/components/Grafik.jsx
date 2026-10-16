import { useEffect, useId, useRef, useState } from 'react'
import { TriangleAlert } from 'lucide-react'

/*
  Grafik sederhana tanpa pustaka, mengikuti aturan visualisasi:
  satu seri = satu warna (biru data), batang tipis berujung bulat, garis bantu tipis,
  label nilai di ujung batang, dan tooltip saat hover/fokus. Warna teks tetap abu-abu.
*/
const WARNA_DATA = '#0284c7' // sky-600 — lolos uji kontras terhadap latar putih

// Batang horizontal untuk membandingkan besaran, mis. nilai per mapel atau kehadiran per kelas.
// data: [{ label, nilai, ket? }]. `acuan`: { nilai, label } untuk garis batas (mis. KKTP).
export function GrafikBatang({ data, maks = 100, acuan, satuan = '', judul }) {
  const [aktif, setAktif] = useState(null)
  const persen = (n) => `${Math.max(0, Math.min(100, (n / maks) * 100))}%`

  return (
    <figure aria-label={judul}>
      <div className="relative space-y-2.5">
        {data.map((d, i) => {
          const kurang = acuan && d.nilai !== null && d.nilai < acuan.nilai
          return (
            <div
              key={d.label}
              tabIndex={0}
              onPointerEnter={() => setAktif(i)}
              onPointerLeave={() => setAktif(null)}
              onFocus={() => setAktif(i)}
              onBlur={() => setAktif(null)}
              className="relative flex items-center gap-3 rounded-lg py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <span className="w-[6.75rem] shrink-0 truncate text-sm text-slate-600 sm:w-[9.25rem]" title={d.label}>
                {d.label}
              </span>
              <span className="relative h-5 flex-1">
                <span
                  className="absolute inset-y-0 left-0 rounded-r-[4px] transition-all duration-700"
                  style={{ width: d.nilai === null ? 0 : persen(d.nilai), background: WARNA_DATA, opacity: aktif === null || aktif === i ? 1 : 0.55 }}
                />
                {/* Garis acuan digambar per baris agar selalu sejajar dengan lintasan batang */}
                {acuan && <span className="absolute -inset-y-1.5 w-px bg-slate-400" style={{ left: persen(acuan.nilai) }} aria-hidden="true" />}
              </span>
              <span className="flex w-9 shrink-0 items-center justify-end gap-1 text-sm font-semibold tabular-nums text-slate-800">
                {d.nilai ?? '–'}
                {satuan}
              </span>
              {acuan && (
                <span className="-ml-1.5 w-4 shrink-0">{kurang && <TriangleAlert className="h-4 w-4 text-amber-500" aria-label="di bawah batas" />}</span>
              )}
              {aktif === i && (
                <span role="tooltip" className="absolute -top-9 left-28 z-10 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg sm:left-40">
                  <span className="font-bold">
                    {d.nilai ?? '–'}
                    {satuan}
                  </span>{' '}
                  <span className="text-slate-300">· {d.label}</span>
                  {d.ket && <span className="text-slate-300"> · {d.ket}</span>}
                  {kurang && <span className="text-amber-300"> · di bawah {acuan.label}</span>}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {acuan && (
        <figcaption className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-3 w-px bg-slate-400" /> Garis = {acuan.label} ({acuan.nilai}
          {satuan})
          <span className="ml-2 inline-flex items-center gap-1">
            <TriangleAlert className="h-3.5 w-3.5 text-amber-500" /> di bawah batas
          </span>
        </figcaption>
      )}
    </figure>
  )
}

// Kelipatan "bulat" untuk garis bantu (1, 2, 2,5, 5 × 10^n) sehingga paling banyak 4 garis di atas nol
function langkahBulat(maks) {
  const pangkat = 10 ** Math.floor(Math.log10(maks || 1))
  return [1, 2, 2.5, 5, 10].map((k) => k * pangkat).find((k) => maks / k <= 4)
}

/*
  Kolom berpasangan per periode, mis. pemasukan vs pengeluaran per bulan.
  data: [{ kunci, label, labelPanjang, nilai: { [seri.kunci]: angka } }]
  seri: [{ kunci, label, warna }] (2 seri, warna dari palet kategori yang sudah divalidasi)
  Klik/Enter pada satu periode memanggil onPilih(kunci); periode terpilih diberi latar & label nilai.
*/
export function GrafikKolomGanda({ data, seri, format = String, formatSingkat = format, judul, pilih, onPilih, tinggi = 240 }) {
  const id = useId()
  const wadahRef = useRef(null)
  const [aktif, setAktif] = useState(null)
  // Lebar gambar mengikuti lebar wadah (1 satuan = 1 piksel), agar teks tetap terbaca di HP
  const [L, setL] = useState(600)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setL(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(wadahRef.current)
    return () => ro.disconnect()
  }, [])
  const pad = { kiri: 54, kanan: 8, atas: 22, bawah: 26 }
  const lebarPlot = L - pad.kiri - pad.kanan
  const tinggiPlot = tinggi - pad.atas - pad.bawah
  const tertinggi = Math.max(1, ...data.flatMap((d) => seri.map((s) => d.nilai[s.kunci] ?? 0)))
  const langkah = langkahBulat(tertinggi)
  const maks = Math.ceil(tertinggi / langkah) * langkah
  const ticks = Array.from({ length: Math.round(maks / langkah) + 1 }, (_, i) => i * langkah)
  const y = (n) => pad.atas + (1 - n / maks) * tinggiPlot
  const pita = lebarPlot / data.length
  const lebarBatang = Math.min(24, (pita * 0.62 - 2) / 2)
  const xPita = (i) => pad.kiri + i * pita
  const xBatang = (i, j) => xPita(i) + pita / 2 - lebarBatang - 1 + j * (lebarBatang + 2)

  // Ujung atas membulat 4px, alas tetap rata di garis nol
  const batang = (x, nilai) => {
    const atas = y(nilai)
    const dasar = y(0)
    const r = Math.min(4, dasar - atas, lebarBatang / 2)
    return `M${x},${dasar} V${atas + r} Q${x},${atas} ${x + r},${atas} H${x + lebarBatang - r} Q${x + lebarBatang},${atas} ${x + lebarBatang},${atas + r} V${dasar} Z`
  }

  const d = aktif === null ? null : data[aktif]
  const posisiTooltip = aktif === 0 ? 'translate-x-0' : aktif === data.length - 1 ? '-translate-x-full' : '-translate-x-1/2'
  const kiriTooltip = aktif === null ? 0 : aktif === 0 ? xPita(0) : aktif === data.length - 1 ? xPita(aktif) + pita : xPita(aktif) + pita / 2

  return (
    <figure ref={wadahRef} aria-label={judul} className="relative">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        {seri.map((s) => (
          <span key={s.kunci} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.warna }} /> {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${L} ${tinggi}`} className="w-full" role="img" aria-describedby={`${id}-ket`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.kiri} x2={L - pad.kanan} y1={y(t)} y2={y(t)} stroke={t ? '#e2e8f0' : '#94a3b8'} strokeWidth="1" />
            <text x={pad.kiri - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {formatSingkat(t)}
            </text>
          </g>
        ))}
        {data.map((p, i) => {
          const dipilih = p.kunci === pilih
          return (
            <g key={p.kunci}>
              {dipilih && <rect x={xPita(i) + 3} y={pad.atas - 18} width={pita - 6} height={tinggiPlot + 18} rx="8" fill="#f1f5f9" />}
              {seri.map((s, j) => {
                const nilai = p.nilai[s.kunci] ?? 0
                return (
                  <g key={s.kunci}>
                    {nilai > 0 && <path d={batang(xBatang(i, j), nilai)} fill={s.warna} opacity={aktif === null || aktif === i ? 1 : 0.55} />}
                    {/* Label kiri rata kanan & label kanan rata kiri, agar tidak saling menimpa */}
                    {dipilih && (
                      <text
                        x={xPita(i) + pita / 2 + (j ? 3 : -3)}
                        y={y(nilai) - 5}
                        textAnchor={j ? 'start' : 'end'}
                        fontSize="10"
                        fontWeight="700"
                        fill="#334155"
                      >
                        {formatSingkat(nilai)}
                      </text>
                    )}
                  </g>
                )
              })}
              <text x={xPita(i) + pita / 2} y={tinggi - 7} textAnchor="middle" fontSize="11" fontWeight={dipilih ? 700 : 400} fill={dipilih ? '#0f172a' : '#64748b'}>
                {p.label}
              </text>
              {/* Area sentuh selebar pita, lebih besar dari batangnya */}
              <rect
                x={xPita(i)}
                y={pad.atas - 18}
                width={pita}
                height={tinggi - pad.atas + 18}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${p.labelPanjang ?? p.label}: ${seri.map((s) => `${s.label} ${format(p.nilai[s.kunci] ?? 0)}`).join(', ')}`}
                aria-pressed={dipilih}
                className="cursor-pointer outline-none focus-visible:stroke-sky-400"
                strokeWidth="2"
                onPointerEnter={() => setAktif(i)}
                onPointerLeave={() => setAktif(null)}
                onFocus={() => setAktif(i)}
                onBlur={() => setAktif(null)}
                onClick={() => onPilih?.(p.kunci)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onPilih?.(p.kunci)
                  }
                }}
              />
            </g>
          )
        })}
      </svg>
      {d && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute top-6 z-10 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg ${posisiTooltip}`}
          style={{ left: `${(kiriTooltip / L) * 100}%` }}
        >
          <p className="mb-1 font-bold">{d.labelPanjang ?? d.label}</p>
          {seri.map((s) => (
            <p key={s.kunci} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.warna }} />
              <span className="text-slate-300">{s.label}</span>
              <span className="ml-auto pl-3 font-semibold">{format(d.nilai[s.kunci] ?? 0)}</span>
            </p>
          ))}
        </div>
      )}
      <figcaption id={`${id}-ket`} className="sr-only">
        {judul}: {data.map((p) => `${p.labelPanjang ?? p.label} ${seri.map((s) => `${s.label} ${format(p.nilai[s.kunci] ?? 0)}`).join(', ')}`).join('; ')}
      </figcaption>
    </figure>
  )
}

// Garis tren satu seri, mis. persentase kehadiran harian. data: [{ label, nilai }]
export function GrafikGaris({ data, min = 0, maks = 100, satuan = '', judul, tinggi = 200 }) {
  const id = useId()
  const wadahRef = useRef(null)
  const svgRef = useRef(null)
  const [aktif, setAktif] = useState(null)
  // Lebar gambar mengikuti lebar wadah (1 satuan = 1 piksel): teks tetap 11px, tidak mengecil di HP
  // atau membesar di layar lebar
  const [L, setL] = useState(600)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setL(Math.max(240, Math.round(e.contentRect.width))))
    ro.observe(wadahRef.current)
    return () => ro.disconnect()
  }, [])
  const pad = { kiri: 36, kanan: 44, atas: 14, bawah: 26 }
  const lebarPlot = L - pad.kiri - pad.kanan
  const tinggiPlot = tinggi - pad.atas - pad.bawah
  const x = (i) => pad.kiri + (data.length === 1 ? lebarPlot / 2 : (i / (data.length - 1)) * lebarPlot)
  const y = (n) => pad.atas + (1 - (n - min) / (maks - min)) * tinggiPlot
  const garis = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.nilai).toFixed(1)}`).join(' ')
  const area = `${garis} L${x(data.length - 1).toFixed(1)},${y(min)} L${x(0).toFixed(1)},${y(min)} Z`
  // Garis bantu di angka bulat: pilih kelipatan terkecil yang menghasilkan paling banyak 5 garis
  const langkah = [1, 2, 5, 10, 20, 25, 50, 100].find((k) => (maks - min) / k <= 4) ?? (maks - min) / 4
  const ticks = []
  for (let t = Math.ceil(min / langkah) * langkah; t <= maks; t += langkah) ticks.push(t)
  const terakhir = data.length - 1

  const dariPointer = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * L
    const i = Math.round(((px - pad.kiri) / lebarPlot) * (data.length - 1))
    setAktif(Math.max(0, Math.min(terakhir, i)))
  }

  const tombol = (e) => {
    if (e.key === 'ArrowRight') setAktif((a) => Math.min(terakhir, (a ?? -1) + 1))
    if (e.key === 'ArrowLeft') setAktif((a) => Math.max(0, (a ?? terakhir + 1) - 1))
  }

  return (
    <figure ref={wadahRef} aria-label={judul} className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${L} ${tinggi}`}
        className="w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        tabIndex={0}
        role="img"
        aria-describedby={`${id}-ket`}
        onPointerMove={dariPointer}
        onPointerLeave={() => setAktif(null)}
        onKeyDown={tombol}
        onBlur={() => setAktif(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.kiri} x2={L - pad.kanan} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pad.kiri - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b" className="tabular-nums">
              {t}
            </text>
          </g>
        ))}
        <path d={area} fill={WARNA_DATA} opacity="0.1" />
        <path d={garis} fill="none" stroke={WARNA_DATA} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* Label sumbu X: awal, tengah, akhir */}
        {[0, Math.floor(terakhir / 2), terakhir].map((i) => (
          <text key={i} x={x(i)} y={tinggi - 6} textAnchor={i === 0 ? 'start' : i === terakhir ? 'end' : 'middle'} fontSize="11" fill="#64748b">
            {data[i]?.label}
          </text>
        ))}
        {/* Titik & nilai akhir */}
        <circle cx={x(terakhir)} cy={y(data[terakhir].nilai)} r="4.5" fill={WARNA_DATA} stroke="#fff" strokeWidth="2" />
        <text x={x(terakhir) + 9} y={y(data[terakhir].nilai) + 4} fontSize="12" fontWeight="700" fill="#0f172a">
          {data[terakhir].nilai}
          {satuan}
        </text>
        {aktif !== null && (
          <g>
            <line x1={x(aktif)} x2={x(aktif)} y1={pad.atas} y2={y(min)} stroke="#94a3b8" strokeWidth="1" />
            <circle cx={x(aktif)} cy={y(data[aktif].nilai)} r="5" fill={WARNA_DATA} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>
      {aktif !== null && (
        <div
          role="tooltip"
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${(x(aktif) / L) * 100}%` }}
        >
          <span className="font-bold">
            {data[aktif].nilai}
            {satuan}
          </span>{' '}
          <span className="text-slate-300">· {data[aktif].label}</span>
        </div>
      )}
      <figcaption id={`${id}-ket`} className="sr-only">
        {judul}: {data.map((d) => `${d.label} ${d.nilai}${satuan}`).join(', ')}
      </figcaption>
    </figure>
  )
}

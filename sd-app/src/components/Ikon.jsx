import {
  Apple,
  BookOpen,
  BookOpenCheck,
  Bot,
  Feather,
  HeartHandshake,
  Languages,
  Lightbulb,
  Mic,
  Music,
  Palette,
  Puzzle,
  ShieldCheck,
  Sun,
  Tent,
  UsersRound,
  Volleyball,
} from 'lucide-react'

// Peta kunci `ikon` di data (dummy.js) ke komponen ikon
export const IKON = {
  kelas: UsersRound,
  kurikulum: BookOpenCheck,
  bahasa: Languages,
  robot: Bot,
  hati: HeartHandshake,
  perisai: ShieldCheck,
  matahari: Sun,
  buku: BookOpen,
  ide: Lightbulb,
  apel: Apple,
  puzzle: Puzzle,
  bola: Volleyball,
  tenda: Tent,
  musik: Music,
  mik: Mic,
  kuas: Palette,
  raket: Feather,
}

export function Ikon({ nama, className = 'h-5 w-5' }) {
  const Komponen = IKON[nama] ?? BookOpen
  return <Komponen className={className} />
}

// Warna lembut bergiliran untuk kartu berikon agar halaman terasa ceria
export const WARNA_CERIA = [
  { bg: 'bg-primary-50', ikon: 'bg-primary-600 text-white', teks: 'text-primary-700', ring: 'ring-primary-100' },
  { bg: 'bg-amber-50', ikon: 'bg-amber-400 text-amber-950', teks: 'text-amber-800', ring: 'ring-amber-100' },
  { bg: 'bg-sky-50', ikon: 'bg-sky-500 text-white', teks: 'text-sky-700', ring: 'ring-sky-100' },
  { bg: 'bg-emerald-50', ikon: 'bg-emerald-500 text-white', teks: 'text-emerald-700', ring: 'ring-emerald-100' },
  { bg: 'bg-violet-50', ikon: 'bg-violet-500 text-white', teks: 'text-violet-700', ring: 'ring-violet-100' },
  { bg: 'bg-orange-50', ikon: 'bg-orange-500 text-white', teks: 'text-orange-700', ring: 'ring-orange-100' },
]

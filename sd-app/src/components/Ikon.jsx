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

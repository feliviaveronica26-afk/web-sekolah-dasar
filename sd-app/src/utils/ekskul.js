// Jadwal ekskul dalam menit: hari 'Senin & Kamis' → ['Senin', 'Kamis'], jam '13.00 – 14.30' → [780, 870]
const hariEkskul = (e) => e.hari.split(/\s*[&,]\s*/)
const jamEkskul = (e) =>
  e.jam.split(/\s*[–-]\s*/).map((j) => {
    const [h, m] = j.split('.').map(Number)
    return h * 60 + m
  })

/*
  Ekskul (dari `diikuti`) yang jadwalnya bertabrakan dengan `e`: hari sama dan jamnya tumpang tindih.
  Jam yang hanya bersambung (mis. selesai 13.00, berikutnya mulai 13.00) tidak dianggap bentrok.
  Siswa boleh ikut ekskul sebanyak apa pun selama tidak ada yang bentrok.
*/
export function ekskulBentrok(e, diikuti) {
  const [mulai, selesai] = jamEkskul(e)
  return (
    diikuti.find((x) => {
      if (x.id === e.id || !hariEkskul(x).some((h) => hariEkskul(e).includes(h))) return false
      const [m, s] = jamEkskul(x)
      return mulai < s && m < selesai
    }) ?? null
  )
}

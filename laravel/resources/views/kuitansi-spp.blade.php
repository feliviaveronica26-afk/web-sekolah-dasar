<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>Kuitansi SPP {{ $no }}</title>
<style>
    @page { margin: 14mm 12mm; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9.5pt; color: #1e293b; }
    .kepala { width: 100%; border-bottom: 2px solid #c81e2b; padding-bottom: 8px; }
    .kepala td { vertical-align: middle; }
    .logo { width: 48px; height: 48px; }
    .nama-sekolah { font-size: 13pt; font-weight: bold; color: #0f172a; }
    .redup { font-size: 7.5pt; color: #64748b; }
    h1 { text-align: center; font-size: 11pt; letter-spacing: 2px; margin: 18px 0 2px; color: #0f172a; }
    .nomor { text-align: center; font-size: 8pt; color: #64748b; margin: 0; }
    table.info { margin-top: 16px; width: 100%; border-collapse: collapse; }
    table.info td { padding: 2.5px 0; vertical-align: top; }
    table.info td.label { color: #64748b; width: 34%; }
    table.info td.isi { font-weight: bold; }
    table.rincian { width: 100%; margin-top: 16px; border-collapse: collapse; }
    table.rincian th { text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 5px 0; }
    table.rincian td { padding: 5px 0; border-bottom: 1px solid #eef2f6; }
    table.rincian .kanan { text-align: right; }
    table.rincian tr.total td { font-weight: bold; font-size: 11pt; border-bottom: none; padding-top: 9px; }
    .cap { position: absolute; top: 158px; right: 6px; border: 3px solid #10b981; border-radius: 6px; color: #10b981; font-size: 15pt; font-weight: bold; letter-spacing: 3px; padding: 2px 10px; transform: rotate(-12deg); }
    .catatan { margin-top: 18px; font-size: 8pt; color: #334155; background: #f8fafc; border-left: 3px solid #c81e2b; padding: 7px 9px; }
    .kaki { margin-top: 16px; text-align: center; font-size: 7pt; color: #94a3b8; }
</style>
</head>
<body>
    <table class="kepala">
        <tr>
            <td style="width: 58px;"><img class="logo" src="{{ $logo }}" alt=""></td>
            <td>
                <div class="nama-sekolah">{{ $sekolah['nama'] }}</div>
                <div class="redup">{{ $sekolah['alamat'] }}</div>
                <div class="redup">{{ collect([$sekolah['telepon'], $sekolah['email']])->filter()->implode(' · ') }}</div>
            </td>
        </tr>
    </table>

    <h1>KUITANSI PEMBAYARAN SPP</h1>
    <p class="nomor">No. {{ $no }}</p>

    <div class="cap">LUNAS</div>

    <table class="info">
        <tr><td class="label">Tanggal bayar</td><td class="isi">{{ $tanggal }}</td></tr>
        <tr><td class="label">Nama siswa</td><td class="isi">{{ $siswa->nama }}</td></tr>
        <tr><td class="label">NIS / Kelas</td><td class="isi">{{ $siswa->nis }} / {{ $siswa->kelas }}</td></tr>
        <tr><td class="label">Metode</td><td class="isi">{{ $metode }}</td></tr>
    </table>

    <table class="rincian">
        <thead>
            <tr><th>Keterangan</th><th class="kanan">Jumlah</th></tr>
        </thead>
        <tbody>
            @foreach ($rincian as $r)
                <tr><td>{{ $r['keterangan'] }}</td><td class="kanan">{{ $r['jumlah'] }}</td></tr>
            @endforeach
            <tr class="total"><td>Total</td><td class="kanan">{{ $total }}</td></tr>
        </tbody>
    </table>

    <div class="catatan">
        @if ($tunai)
            Pembayaran tunai diterima dan dicatat oleh Tata Usaha.
        @else
            Pembayaran {{ $metode }} dikonfirmasi otomatis oleh payment gateway.
        @endif
    </div>

    <p class="kaki">
        Kuitansi ini dibuat sistem {{ $sekolah['nama'] }} dari data pembayaran yang tercatat dan sah tanpa tanda tangan.<br>
        Diunduh {{ $dibuat }} WIB.
    </p>
</body>
</html>

<?php

namespace App\Support;

use App\Models\Siswa;
use App\Models\SppPembayaran;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/*
  Kuitansi pembayaran SPP dalam bentuk PDF (ukuran A5), dibuat dari baris spp_pembayaran satu nomor
  transaksi. Gambar hanya dari data URI; dompdf tidak boleh mengambil berkas/alamat lain. Logo
  berupa JPEG karena gambar PNG di dompdf membutuhkan ekstensi GD PHP, yang tidak selalu terpasang.
*/
final class KuitansiSpp
{
    /** @param  Collection<int, SppPembayaran>  $baris */
    public static function pdf(Siswa $siswa, Collection $baris): string
    {
        $opsi = new Options;
        $opsi->set('isRemoteEnabled', false);
        $opsi->set('isPhpEnabled', false);
        $opsi->set('defaultFont', 'DejaVu Sans');
        $opsi->set('tempDir', sys_get_temp_dir());

        $pertama = $baris->first();
        $no = $pertama->no_transaksi;
        $sekolah = Referensi::get('sekolah', []) + [
            'nama' => 'SD Harapan Gemilang', 'alamat' => '', 'telepon' => '', 'email' => '',
        ];

        $html = view('kuitansi-spp', [
            'sekolah' => $sekolah,
            'logo' => 'data:image/jpeg;base64,'.base64_encode((string) file_get_contents(resource_path('images/logo-sekolah.jpg'))),
            'no' => $no,
            'siswa' => $siswa,
            'tanggal' => Carbon::parse($pertama->tanggal)->locale('id')->translatedFormat('j F Y'),
            'metode' => $pertama->metode,
            'tunai' => $pertama->metode === 'Tunai',
            'rincian' => $baris->map(fn (SppPembayaran $b) => [
                'keterangan' => 'SPP '.Carbon::createFromFormat('Y-m-d', "{$b->bulan}-01")->locale('id')->translatedFormat('F Y'),
                'jumlah' => self::rupiah($b->jumlah),
            ])->all(),
            'total' => self::rupiah((int) $baris->sum('jumlah')),
            'dibuat' => Waktu::sekarang()->locale('id')->translatedFormat('j F Y, H.i'),
        ])->render();

        $pdf = new Dompdf($opsi);
        $pdf->loadHtml($html, 'UTF-8');
        $pdf->setPaper('A5', 'portrait');
        $pdf->addInfo('Title', "Kuitansi SPP {$no}");
        $pdf->addInfo('Author', $sekolah['nama']);
        $pdf->render();

        return (string) $pdf->output();
    }

    private static function rupiah(int $nilai): string
    {
        return 'Rp '.number_format($nilai, 0, ',', '.');
    }
}

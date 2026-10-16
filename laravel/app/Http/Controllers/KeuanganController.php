<?php

namespace App\Http\Controllers;

use App\Models\TransaksiKas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

/*
  Buku kas sekolah. Seluruhnya dijaga middleware "peran:kepsek": data keuangan tidak terbuka untuk umum.
  Daftar dikirim utuh (urut tanggal); ringkasan per bulan dihitung di website.
*/
class KeuanganController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(TransaksiKas::orderBy('tanggal')->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $transaksi = new TransaksiKas($this->validasi($request));
        $transaksi->pencatat = $request->user()->profil()['nama'];
        $transaksi->save();

        return response()->json($transaksi, 201);
    }

    public function update(Request $request, TransaksiKas $transaksi): JsonResponse
    {
        $transaksi->fill($this->validasi($request));
        $transaksi->pencatat = $request->user()->profil()['nama'];
        $transaksi->save();

        return response()->json($transaksi);
    }

    public function destroy(TransaksiKas $transaksi): Response
    {
        $transaksi->delete();

        return response()->noContent();
    }

    private function validasi(Request $request): array
    {
        $jenis = $request->input('jenis');
        $data = $request->validate([
            'tanggal' => ['required', 'date_format:Y-m-d', 'after_or_equal:2000-01-01', 'before_or_equal:'.now('Asia/Jakarta')->toDateString()],
            'jenis' => ['required', Rule::in(array_keys(TransaksiKas::KATEGORI))],
            'kategori' => ['required', Rule::in(is_string($jenis) ? (TransaksiKas::KATEGORI[$jenis] ?? []) : [])],
            'uraian' => ['required', 'string', 'max:200'],
            'jumlah' => ['required', 'integer', 'min:1', 'max:100000000000'],
            'metode' => ['required', Rule::in(TransaksiKas::METODE)],
            'bukti' => ['nullable', 'string', 'max:40'],
        ], [
            'tanggal.required' => 'Tanggal wajib diisi.',
            'tanggal.date_format' => 'Format tanggal tidak dikenal.',
            'tanggal.after_or_equal' => 'Tanggal terlalu lama.',
            'tanggal.before_or_equal' => 'Tanggal tidak boleh melewati hari ini.',
            'jenis.*' => 'Pilih pemasukan atau pengeluaran.',
            'kategori.required' => 'Pilih kategori.',
            'kategori.in' => 'Kategori tidak cocok dengan jenis transaksi.',
            'uraian.required' => 'Uraian wajib diisi.',
            'uraian.max' => 'Uraian paling banyak 200 karakter.',
            'jumlah.required' => 'Jumlah wajib diisi.',
            'jumlah.integer' => 'Jumlah harus berupa angka rupiah tanpa koma.',
            'jumlah.min' => 'Jumlah harus lebih dari Rp0.',
            'jumlah.max' => 'Jumlah terlalu besar.',
            'metode.*' => 'Pilih metode: tunai atau transfer bank.',
            'bukti.max' => 'No. bukti paling banyak 40 karakter.',
        ]);

        return [...$data, 'uraian' => trim($data['uraian']), 'bukti' => trim($data['bukti'] ?? '')];
    }
}

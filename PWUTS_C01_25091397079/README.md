# Identitas
Nama : Aby Putra Mahendra
NIM : 25091397079
Kelas : 2025C

# Rental Mobil — Project UTS Pemrograman Web
Website mobil dengan homepage responsif, navigasi konten menggunakan Ajax/jQuery, katalog interaktif, form booking, validasi client-side dan server-side, serta endpoint PHP untuk menyimpan transaksi ke MySQL.

## Fitur

- `index.html` sebagai layout utama dengan navigasi Ajax untuk Beranda, Katalog Mobil, dan Pemesanan.
- Katalog 3 mobil dengan pencarian nama dan filter harga.
- Tombol pemesanan pada katalog otomatis memilih mobil pada form.
- Form penyewa: nama, email, telepon, mobil, tanggal mulai, tanggal selesai.
- Perhitungan durasi dan estimasi biaya otomatis; hari mulai dan selesai dihitung inklusif.
- Validasi browser/JavaScript dan validasi ulang di PHP sebelum data disimpan.
- Harga dihitung ulang di server (tidak mempercayai harga dari browser).
- Query database menggunakan PDO prepared statements.
- Layout responsif dan pesan status yang dapat dibaca screen reader.

## Teknologi

HTML5, CSS3, JavaScript, jQuery 3.7.1, PHP 8+, dan MySQL/MariaDB.

## Cara menjalankan di XAMPP

1. Salin folder `rental mobil` ke direktori `htdocs` (contoh: `C:/xampp/htdocs/rental-mobil`).
2. Buka XAMPP Control Panel dan jalankan **Apache** serta **MySQL**.
3. Buka phpMyAdmin, pilih menu **Import**, lalu impor file `database/rental_mobil.sql`.
4. Jika username/password MySQL berbeda dari konfigurasi XAMPP default, edit `config/db.php` atau set environment `DB_HOST`, `DB_NAME`, `DB_USER`, dan `DB_PASS`.
5. Buka `http://localhost/rental-mobil/` (sesuaikan nama folder yang disalin).
6. Buka menu Katalog Mobil, pilih **Pesan Sekarang**, isi form dengan data uji, lalu kirim.
7. Pastikan respons sukses menampilkan nomor booking. Periksa tabel `pemesanan` melalui phpMyAdmin untuk memastikan record tersimpan.


## Endpoint

- `POST api/pemesanan.php`: menerima form booking, memvalidasi ulang input, menghitung harga/durasi di server, lalu menyimpan ke tabel `pemesanan`.
- Endpoint hanya menerima metode POST; permintaan lain akan mendapat HTTP 405.
- Respons endpoint berupa JSON. Jika koneksi DB gagal, periksa konfigurasi dan impor SQL.

## Struktur file

- `index.html` — homepage dan layout utama.
- `mobil.html` — fragmen HTML katalog yang dimuat via Ajax.
- `pemesanan.html` — fragmen form yang dimuat via Ajax.
- `script.js` — navigasi Ajax, filter katalog, perhitungan, validasi, dan pengiriman booking.
- `style.css` — tampilan responsif.
- `api/pemesanan.php` — endpoint server-side.
- `config/db.php` — konfigurasi PDO.
- `database/rental_mobil.sql` — skema database awal.
- File `.jpeg` — gambar mobil.

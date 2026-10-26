<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['success' => false, 'message' => 'Metode request tidak diizinkan.']);
}

$nama = trim((string)($_POST['nama'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$telepon = trim((string)($_POST['telepon'] ?? ''));
$mobil = trim((string)($_POST['mobil'] ?? ''));
$tanggalSewa = trim((string)($_POST['tanggalSewa'] ?? ''));
$tanggalSelesai = trim((string)($_POST['tanggalSelesai'] ?? ''));

$mobilTersedia = [
    'civic' => ['nama' => 'Honda Civic FL5 Type R', 'harga' => 7000000],
    'acura' => ['nama' => 'Acura NSX 2017', 'harga' => 9000000],
    'chevrolet' => ['nama' => 'Chevrolet Corvette 2023', 'harga' => 12000000],
];

if (mb_strlen($nama) < 2 || mb_strlen($nama) > 100) {
    respond(422, ['success' => false, 'message' => 'Nama harus terdiri dari 2 sampai 100 karakter.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    respond(422, ['success' => false, 'message' => 'Format email tidak valid.']);
}
if (!preg_match('/^[0-9+() -]{9,20}$/', $telepon)) {
    respond(422, ['success' => false, 'message' => 'Nomor telepon harus 9 sampai 20 karakter dan hanya berisi angka atau + ( ) - spasi.']);
}
if (!array_key_exists($mobil, $mobilTersedia)) {
    respond(422, ['success' => false, 'message' => 'Mobil yang dipilih tidak tersedia.']);
}
$dateStart = DateTimeImmutable::createFromFormat('!Y-m-d', $tanggalSewa);
$dateEnd = DateTimeImmutable::createFromFormat('!Y-m-d', $tanggalSelesai);
$today = new DateTimeImmutable('today');
if (!$dateStart || $dateStart->format('Y-m-d') !== $tanggalSewa || !$dateEnd || $dateEnd->format('Y-m-d') !== $tanggalSelesai) {
    respond(422, ['success' => false, 'message' => 'Format tanggal tidak valid.']);
}
if ($dateStart < $today) {
    respond(422, ['success' => false, 'message' => 'Tanggal mulai sewa tidak boleh di masa lalu.']);
}
if ($dateEnd < $dateStart) {
    respond(422, ['success' => false, 'message' => 'Tanggal selesai tidak boleh sebelum tanggal mulai sewa.']);
}

$durasi = (int)$dateStart->diff($dateEnd)->days + 1;
$hargaHarian = $mobilTersedia[$mobil]['harga'];
$totalHarga = $durasi * $hargaHarian;
if ($durasi > 365) {
    respond(422, ['success' => false, 'message' => 'Durasi sewa maksimal 365 hari.']);
}

require __DIR__ . '/../config/db.php';

try {
    $sql = 'INSERT INTO pemesanan (nama, email, telepon, mobil_kode, mobil_nama, tanggal_sewa, tanggal_selesai, durasi_hari, harga_harian, total_harga, status) VALUES (:nama, :email, :telepon, :mobil_kode, :mobil_nama, :tanggal_sewa, :tanggal_selesai, :durasi_hari, :harga_harian, :total_harga, :status)';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nama' => $nama,
        ':email' => $email,
        ':telepon' => $telepon,
        ':mobil_kode' => $mobil,
        ':mobil_nama' => $mobilTersedia[$mobil]['nama'],
        ':tanggal_sewa' => $tanggalSewa,
        ':tanggal_selesai' => $tanggalSelesai,
        ':durasi_hari' => $durasi,
        ':harga_harian' => $hargaHarian,
        ':total_harga' => $totalHarga,
        ':status' => 'menunggu',
    ]);
    respond(201, [
        'success' => true,
        'message' => 'Pemesanan berhasil disimpan.',
        'booking_id' => (int)$pdo->lastInsertId(),
        'durasi_hari' => $durasi,
        'harga_harian' => $hargaHarian,
        'total_harga' => $totalHarga,
    ]);
} catch (PDOException $e) {
    error_log('Insert booking error: ' . $e->getMessage());
    respond(500, ['success' => false, 'message' => 'Pemesanan belum tersimpan. Periksa tabel database dan coba lagi.']);
}

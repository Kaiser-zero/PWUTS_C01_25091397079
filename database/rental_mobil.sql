CREATE DATABASE IF NOT EXISTS rental_mobil_uts
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_mobil_uts;

CREATE TABLE IF NOT EXISTS pemesanan (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telepon VARCHAR(20) NOT NULL,
    mobil_kode VARCHAR(30) NOT NULL,
    mobil_nama VARCHAR(120) NOT NULL,
    tanggal_sewa DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    durasi_hari SMALLINT UNSIGNED NOT NULL,
    harga_harian BIGINT UNSIGNED NOT NULL,
    total_harga BIGINT UNSIGNED NOT NULL,
    status ENUM('menunggu','dikonfirmasi','dibatalkan','selesai') NOT NULL DEFAULT 'menunggu',
    dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pemesanan_email (email),
    KEY idx_pemesanan_tanggal (tanggal_sewa, tanggal_selesai),
    KEY idx_pemesanan_status (status)
) ENGINE=InnoDB;

$(function () {
    const berandaHTML = $("#kontenUtama").html();
    const hargaMobil = { civic: 7000000, acura: 9000000, chevrolet: 12000000 };
    const namaMobil = { civic: "Honda Civic FL5 Type R", acura: "Acura NSX 2017", chevrolet: "Chevrolet Corvette 2023" };

    function tandaiNavigasi(halaman) {
        $("nav a[data-page]").removeAttr("aria-current");
        $("nav a[data-page='" + halaman + "']").attr("aria-current", "page");
    }

    function muatHalaman(halaman, mobilDipilih = "", updateHistory = true) {
        if (halaman === "beranda") {
            $("#kontenUtama").html(berandaHTML);
            tandaiNavigasi("beranda");
            if (updateHistory && window.history && window.history.pushState) history.pushState({ halaman }, "", "#beranda");
            return;
        }
        if (!["mobil", "pemesanan"].includes(halaman)) return;
        $.get(halaman + ".html")
            .done(function (data) {
                $("#kontenUtama").html(data);
                tandaiNavigasi(halaman);
                if (updateHistory && window.history && window.history.pushState) history.pushState({ halaman }, "", "#" + halaman);
                if (mobilDipilih && hargaMobil[mobilDipilih]) $("#mobil").val(mobilDipilih);
                if (halaman === "mobil") filterMobil();
                if (halaman === "pemesanan") aturBooking();
                $("#kontenUtama").trigger("focus");
            })
            .fail(function () {
                $("#kontenUtama").html('<section class="pesan-error"><h2>Halaman tidak dapat dimuat</h2><p>Pastikan project dijalankan melalui server lokal seperti XAMPP atau PHP built-in server.</p></section>');
            });
    }

    $(document).on("click", "a[data-page]", function (e) {
        e.preventDefault();
        muatHalaman(String($(this).data("page")));
    });

    $(document).on("click", "[data-pesan-mobil]", function (e) {
        e.preventDefault();
        muatHalaman("pemesanan", String($(this).data("pesan-mobil")));
    });

    window.addEventListener("popstate", function () {
        const halaman = (location.hash || "#beranda").slice(1);
        muatHalaman(["beranda", "mobil", "pemesanan"].includes(halaman) ? halaman : "beranda", "", false);
    });

    function filterMobil() {
        if (!$("#daftarKatalog").length) return;
        const kataKunci = String($("#cariMobil").val() || "").toLowerCase().trim();
        const pilihanHarga = $("#filterHarga").val();
        let jumlahTampil = 0;
        $("#daftarKatalog .kartu-mobil").each(function () {
            const nama = String($(this).data("nama") || "").toLowerCase();
            const harga = Number($(this).data("harga"));
            const cocokNama = nama.includes(kataKunci);
            const cocokHarga = pilihanHarga === "terendah" ? harga <= 7000000 : pilihanHarga === "tertinggi" ? harga > 7000000 : true;
            const tampil = cocokNama && cocokHarga;
            $(this).toggle(tampil);
            if (tampil) jumlahTampil++;
        });
        $("#pesanKosong").prop("hidden", jumlahTampil !== 0);
    }
    $(document).on("input", "#cariMobil", filterMobil);
    $(document).on("change", "#filterHarga", filterMobil);

    function formatRupiah(angka) {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
    }

    function hitungBooking() {
        const mobil = $("#mobil").val();
        const mulai = $("#tanggalSewa").val();
        const selesai = $("#tanggalSelesai").val();
        const harga = hargaMobil[mobil] || 0;
        $("#hargaHarian").text(formatRupiah(harga));
        if (!mulai || !selesai || !harga || selesai < mulai) {
            $("#durasiSewa").text(selesai && mulai && selesai < mulai ? "Tanggal tidak valid" : "0 hari");
            $("#totalHarga").text(formatRupiah(0));
            return;
        }
        
        const awal = Date.parse(mulai + "T00:00:00Z");
        const akhir = Date.parse(selesai + "T00:00:00Z");
        const hari = Math.floor((akhir - awal) / 86400000) + 1;
        $("#durasiSewa").text(hari + (hari === 1 ? " hari" : " hari"));
        $("#totalHarga").text(formatRupiah(hari * harga));
    }

    function aturBooking() {
        const form = $("#formPemesanan");
        if (!form.length) return;
        const hariIni = new Date();
        const tanggalHariIni = [hariIni.getFullYear(), String(hariIni.getMonth() + 1).padStart(2, "0"), String(hariIni.getDate()).padStart(2, "0")].join("-");
        $("#tanggalSewa, #tanggalSelesai").attr("min", tanggalHariIni);
        $("#tanggalSewa").on("change", function () {
            const mulai = $(this).val();
            $("#tanggalSelesai").attr("min", mulai || tanggalHariIni);
            if ($("#tanggalSelesai").val() && $("#tanggalSelesai").val() < mulai) $("#tanggalSelesai").val("");
            hitungBooking();
        });
        $("#tanggalSelesai, #mobil").on("change", hitungBooking);
        hitungBooking();
    }

    $(document).on("submit", "#formPemesanan", function (e) {
        e.preventDefault();
        const form = this;
        const pesan = $("#pesanForm");
        const tombol = $("#tombolBooking");
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const mulai = $("#tanggalSewa").val();
        const selesai = $("#tanggalSelesai").val();
        if (!hargaMobil[$("#mobil").val()]) {
            pesan.removeClass("pesan-sukses").addClass("pesan-gagal").text("Pilih mobil yang tersedia."); return;
        }
        if (selesai < mulai) {
            pesan.removeClass("pesan-sukses").addClass("pesan-gagal").text("Tanggal selesai tidak boleh sebelum tanggal mulai."); return;
        }
        pesan.removeClass("pesan-sukses").removeClass("pesan-gagal").text("Mengirim pemesanan ke server...");
        tombol.prop("disabled", true).text("Mengirim...");
        $.ajax({ url: "api/pemesanan.php", method: "POST", data: $(form).serialize(), dataType: "json", timeout: 15000 })
            .done(function (response) {
                if (response && response.success) {
                    pesan.removeClass("pesan-gagal").addClass("pesan-sukses").text("Pemesanan berhasil disimpan. Nomor booking: " + response.booking_id + ". Total: " + formatRupiah(response.total_harga) + ".");
                    form.reset();
                    hitungBooking();
                } else {
                    pesan.removeClass("pesan-sukses").addClass("pesan-gagal").text(response && response.message ? response.message : "Pemesanan gagal diproses.");
                }
            })
            .fail(function (xhr, status) {
                let message = "Tidak dapat mengirim data ke server. Pastikan PHP dan database sudah aktif.";
                if (status === "timeout") message = "Server terlalu lama merespons. Silakan coba lagi.";
                else if (xhr.responseJSON && xhr.responseJSON.message) message = xhr.responseJSON.message;
                pesan.removeClass("pesan-sukses").addClass("pesan-gagal").text(message);
            })
            .always(function () { tombol.prop("disabled", false).text("Kirim Pemesanan"); });
    });

    const halamanAwal = (location.hash || "#beranda").slice(1);
    if (["mobil", "pemesanan"].includes(halamanAwal)) muatHalaman(halamanAwal, "", false);
});

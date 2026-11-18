/* ============================================================
   script.js - Klinik Sehat Nusantara
   Pert. 3: array/objek, variabel, kondisi, perulangan, fungsi
   Pert. 4: manipulasi DOM  | Pert. 6: event handler
   Pert. 8: validasi form sisi klien
   ============================================================ */

// ---------- Pert. 3: data dokter (array berisi objek) ----------
const dokterData = [
  { id: 1, nama: "dr. Ahmad Fauzi",       poli: "Umum", hari: ["Senin", "Rabu", "Jumat"],  jam: "08.00-12.00" },
  { id: 2, nama: "dr. Rina Kusumawati",   poli: "Umum", hari: ["Selasa", "Kamis", "Sabtu"], jam: "13.00-17.00" },
  { id: 3, nama: "drg. Dewi Lestari",     poli: "Gigi", hari: ["Senin", "Kamis"],           jam: "09.00-14.00" },
  { id: 4, nama: "drg. Bagus Prasetyo",   poli: "Gigi", hari: ["Rabu", "Jumat", "Sabtu"],   jam: "08.00-12.00" },
  { id: 5, nama: "dr. Sari Wulandari, Sp.OG", poli: "KIA", hari: ["Selasa", "Jumat"],       jam: "08.00-13.00" },
  { id: 6, nama: "Bd. Lilis Handayani",   poli: "KIA",  hari: ["Senin", "Rabu", "Sabtu"],   jam: "09.00-15.00" },
  { id: 7, nama: "Hendra Gunawan, S.Gz",  poli: "Gizi", hari: ["Selasa", "Kamis"],          jam: "10.00-15.00" },
  { id: 8, nama: "Maya Anggraini, S.Gz",  poli: "Gizi", hari: ["Senin", "Jumat"],           jam: "08.00-12.00" }
];

const kodePoli = { Umum: "UMUM", Gigi: "GIGI", KIA: "KIA", Gizi: "GIZI" };

// ---------- Penyimpanan (localStorage) & sesi admin ----------
const KUNCI_DATA = "klinikPermintaan";
const KUNCI_COUNTER = "klinikCounter";
const KUNCI_SESI = "klinikAdminSesi";
// Prototipe: kredensial ada di sisi klien. Untuk sistem nyata, login wajib diperiksa di server.
const AKUN_ADMIN = { username: "admin", password: "klinik2026" };

function bacaJSON(kunci, cadangan) {
  try {
    const mentah = localStorage.getItem(kunci);
    if (mentah === null) return cadangan;
    const v = JSON.parse(mentah);
    return v === null ? cadangan : v;
  } catch (e) {
    console.error("Gagal membaca penyimpanan klinik:", e);
    return cadangan;
  }
}
function simpanJSON(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
    return true;
  } catch (e) {
    console.error("Gagal menyimpan data klinik:", e);
    alert("Data tidak dapat disimpan. Periksa ruang penyimpanan browser Anda.");
    return false;
  }
}
function adaSesiAdmin() { return sessionStorage.getItem(KUNCI_SESI) === "1"; }
function tampilkanMenuAdmin() {
  // Tautan Admin selalu ditampilkan di navigasi agar mudah ditemukan.
  const m = document.getElementById("menuAdmin");
  if (m) m.hidden = false;
}

// ---------- Pert. 3: fungsi-fungsi dasar ----------
function sapaanWaktu(jam) {
  if (jam >= 4 && jam < 11) return "Selamat pagi";
  if (jam >= 11 && jam < 15) return "Selamat siang";
  if (jam >= 15 && jam < 18) return "Selamat sore";
  return "Selamat malam";
}

function hitungUsia(tglLahirStr) {
  const lahir = new Date(tglLahirStr + "T00:00:00");
  const hariIni = new Date();
  let usia = hariIni.getFullYear() - lahir.getFullYear();
  const belumUlangTahun =
    hariIni.getMonth() < lahir.getMonth() ||
    (hariIni.getMonth() === lahir.getMonth() && hariIni.getDate() < lahir.getDate());
  if (belumUlangTahun) usia--;
  return usia;
}

function buatNomorAntrean(poli) {
  const counter = bacaJSON(KUNCI_COUNTER, {});
  counter[poli] = (counter[poli] || 0) + 1;
  simpanJSON(KUNCI_COUNTER, counter);
  return kodePoli[poli] + "-" + String(counter[poli]).padStart(3, "0");
}

function formatTanggal(str) {           // "2026-11-11" -> format tanggal Indonesia
  return new Date(str + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function toISO(d) {                     // tanggal lokal -> "YYYY-MM-DD"
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const t = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + t;
}

// ---------- Pert. 4: DOM, tampilan dokter dinamis ----------
function renderDokter(poli) {
  const tbody = document.getElementById("tabelDokter");
  const info = document.getElementById("infoJumlah");
  tbody.innerHTML = "";
  let jumlah = 0;
  for (const d of dokterData) {
    if (poli !== "Semua" && d.poli !== poli) continue;
    const chips = d.hari.map(h => `<span class="hari-chip">${h}</span>`).join("");
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td class="fw-semibold">${d.nama}</td>` +
      `<td><span class="badge badge-poli">${d.poli}</span></td>` +
      `<td>${chips}</td>` +
      `<td class="text-nowrap">${d.jam} WIB</td>`;
    tbody.appendChild(tr);
    jumlah++;
  }
  info.textContent = "Menampilkan " + jumlah + " dokter" + (poli === "Semua" ? "." : " poli " + poli + ".");
}

function isiPilihanDokter(poli) {
  const sel = document.getElementById("dokter");
  sel.innerHTML = "";
  if (!poli) {
    sel.innerHTML = '<option value="">Pilih poliklinik terlebih dahulu</option>';
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  sel.innerHTML = '<option value="">Pilih dokter</option>';
  dokterData.filter(d => d.poli === poli).forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.nama + " (" + d.hari.join(", ") + ")";
    sel.appendChild(opt);
  });
}

// ---------- Halaman Beranda ----------
function initBeranda() {
  const el = document.getElementById("sapaan");
  if (el) el.textContent = sapaanWaktu(new Date().getHours()) + ", selamat datang di Klinik Sehat Nusantara";
}

// ---------- Halaman Layanan: event click ----------
function initLayanan() {
  document.querySelectorAll(".btn-detail").forEach(btn => {
    btn.addEventListener("click", () => {
      const daftar = document.getElementById(btn.dataset.target);
      daftar.hidden = !daftar.hidden;
      btn.textContent = daftar.hidden ? "Tampilkan layanan" : "Sembunyikan layanan";
      btn.setAttribute("aria-expanded", String(!daftar.hidden));
    });
  });
}

// ---------- Halaman Dokter: event change + click ----------
function initDokter() {
  const filter = document.getElementById("filterPoli");
  const area = document.getElementById("areaJadwal");
  const btn = document.getElementById("btnToggleJadwal");
  renderDokter("Semua");
  filter.addEventListener("change", () => renderDokter(filter.value));
  btn.addEventListener("click", () => {
    area.hidden = !area.hidden;
    btn.textContent = area.hidden ? "Tampilkan jadwal" : "Sembunyikan jadwal";
    btn.setAttribute("aria-expanded", String(!area.hidden));
  });
}

// ---------- Pert. 8: validasi (tiap fungsi mengembalikan pesan galat, "" jika valid) ----------
const aturan = {
  nama(v) {
    v = v.trim();
    if (!v) return "Nama lengkap wajib diisi.";
    if (!/^[A-Za-z\s]+$/.test(v)) return "Nama hanya boleh berisi huruf dan spasi.";
    if (v.length < 3) return "Nama minimal 3 karakter.";
    return "";
  },
  nik(v) {
    v = v.trim();
    if (!v) return "NIK wajib diisi.";
    if (!/^\d+$/.test(v)) return "NIK hanya boleh berisi angka.";
    if (v.length !== 16) return "NIK harus 16 digit.";
    return "";
  },
  tglLahir(v) {
    if (!v) return "Tanggal lahir wajib diisi.";
    if (Number.isNaN(Date.parse(v + "T00:00:00"))) return "Tanggal lahir tidak valid.";
    if (v > toISO(new Date())) return "Tanggal lahir tidak boleh di masa depan.";
    return "";
  },
  hp(v) {
    v = v.trim();
    if (!v) return "Nomor HP wajib diisi.";
    if (!/^\d+$/.test(v)) return "Nomor HP hanya boleh berisi angka.";
    if (!/^(08|62)/.test(v)) return "Nomor HP harus diawali 08 atau 62.";
    if (v.length < 10 || v.length > 14) return "Nomor HP harus 10-14 digit.";
    return "";
  },
  email(v) {
    v = v.trim();
    if (!v) return "";                                  // opsional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Format email tidak benar, contoh: nama@email.com.";
    return "";
  },
  poli(v) { return v ? "" : "Poliklinik wajib dipilih."; },
  dokter(v) {
    if (!v) return "Dokter wajib dipilih.";
    const poli = document.getElementById("poli").value;
    const dokterDipilih = dokterData.find(d => d.id === Number(v) && d.poli === poli);
    return dokterDipilih ? "" : "Dokter tidak sesuai dengan poliklinik yang dipilih. Pilih ulang dokter.";
  },
  tglKunjungan(v) {
    if (!v) return "Tanggal kunjungan wajib diisi.";
    const batas = new Date();
    batas.setDate(batas.getDate() + 14);
    if (Number.isNaN(Date.parse(v + "T00:00:00"))) return "Tanggal kunjungan tidak valid.";
    if (v < toISO(new Date())) return "Tanggal kunjungan paling cepat hari ini.";
    if (v > toISO(batas)) return "Tanggal kunjungan paling lambat 14 hari ke depan.";
    return "";
  },
  keluhan(v) {
    v = v.trim();
    if (!v) return "Keluhan wajib diisi.";
    if (v.length < 10) return "Keluhan minimal 10 karakter.";
    if (v.length > 200) return "Keluhan maksimal 200 karakter.";
    return "";
  }
};

function tampilkanGalat(id, pesan) {
  const el = document.getElementById(id);
  const err = document.getElementById("err-" + id);
  el.classList.toggle("is-invalid", pesan !== "");
  el.classList.toggle("is-valid", pesan === "" && el.value.trim() !== "");
  err.textContent = pesan;
}

function validasiRadioDanCek() {
  const jk = document.querySelector('input[name="jk"]:checked');
  document.getElementById("err-jk").textContent = jk ? "" : "Jenis kelamin wajib dipilih.";
  const setuju = document.getElementById("setuju").checked;
  document.getElementById("err-setuju").textContent = setuju ? "" : "Anda harus menyetujui penggunaan data.";
  return !!jk && setuju;
}

function validasiSemua() {
  let valid = true;
  for (const id in aturan) {
    const pesan = aturan[id](document.getElementById(id).value);
    tampilkanGalat(id, pesan);
    if (pesan) valid = false;
  }
  if (!validasiRadioDanCek()) valid = false;
  return valid;
}

function tampilkanRingkasan() {
  const poli = document.getElementById("poli").value;
  const dok = dokterData.find(d =>
    d.id === Number(document.getElementById("dokter").value) && d.poli === poli
  );
  if (!dok) {
    tampilkanGalat("dokter", "Dokter tidak sesuai dengan poliklinik yang dipilih. Pilih ulang dokter.");
    return;
  }
  const data = [
    ["Nama", document.getElementById("nama").value.trim()],
    ["NIK", document.getElementById("nik").value.trim()],
    ["Usia", hitungUsia(document.getElementById("tglLahir").value) + " tahun"],
    ["Jenis kelamin", document.querySelector('input[name="jk"]:checked').value],
    ["Nomor HP", document.getElementById("hp").value.trim()],
    ["Poliklinik", poli],
    ["Dokter", dok.nama],
    ["Tanggal kunjungan", formatTanggal(document.getElementById("tglKunjungan").value)],
    ["Keluhan", document.getElementById("keluhan").value.trim()]
  ];
  const email = document.getElementById("email").value.trim();
  if (email) data.splice(5, 0, ["Email", email]);

  const semuaTersimpan = bacaJSON(KUNCI_DATA, []);
  const nomor = buatNomorAntrean(poli);
  document.getElementById("mAntrean").textContent = nomor;

  const semua = Array.isArray(semuaTersimpan) ? semuaTersimpan : [];
  semua.push({
    id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + "-" + Math.random().toString(16).slice(2)),
    antrean: nomor,
    nama: document.getElementById("nama").value.trim(),
    nik: document.getElementById("nik").value.trim(),
    usia: hitungUsia(document.getElementById("tglLahir").value),
    jk: document.querySelector('input[name="jk"]:checked').value,
    hp: document.getElementById("hp").value.trim(),
    email: email,
    poli: poli,
    dokter: dok.nama,
    tglKunjungan: document.getElementById("tglKunjungan").value,
    keluhan: document.getElementById("keluhan").value.trim(),
    status: "Menunggu",
    waktuDaftar: new Date().toISOString()
  });
  if (!simpanJSON(KUNCI_DATA, semua)) return;
  const dl = document.getElementById("mRingkasan");
  dl.innerHTML = "";
  data.forEach(([k, v]) => {
    const dt = document.createElement("dt");
    dt.className = "col-5";
    dt.textContent = k;
    const dd = document.createElement("dd");
    dd.className = "col-7";
    dd.textContent = v;                       // textContent: aman dari injeksi HTML
    dl.append(dt, dd);
  });
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modalRingkasan")).show();
}

// ---------- Halaman Pendaftaran: event input, change, submit, click ----------
function initPendaftaran() {
  const form = document.getElementById("formDaftar");
  const hariIni = new Date();
  const batas = new Date();
  batas.setDate(batas.getDate() + 14);
  document.getElementById("tglKunjungan").min = toISO(hariIni);
  document.getElementById("tglKunjungan").max = toISO(batas);
  document.getElementById("tglLahir").max = toISO(hariIni);

  // change: poliklinik -> pilihan dokter berubah otomatis
  document.getElementById("poli").addEventListener("change", e => {
    isiPilihanDokter(e.target.value);
    document.getElementById("dokter").classList.remove("is-invalid", "is-valid");
  });

  // change: tampilkan usia otomatis
  document.getElementById("tglLahir").addEventListener("change", e => {
    const usia = document.getElementById("usia");
    usia.textContent = e.target.value && !aturan.tglLahir(e.target.value)
      ? "Usia: " + hitungUsia(e.target.value) + " tahun" : "";
  });

  // input: penghitung karakter keluhan
  document.getElementById("keluhan").addEventListener("input", e => {
    const sisa = 200 - e.target.value.length;
    const el = document.getElementById("sisaKarakter");
    el.textContent = sisa;
    el.parentElement.classList.toggle("text-danger", sisa < 0);
  });

  // input/change: setelah kolom pernah salah, periksa ulang saat diketik
  for (const id in aturan) {
    const el = document.getElementById(id);
    const ulang = () => { if (el.classList.contains("is-invalid")) tampilkanGalat(id, aturan[id](el.value)); };
    el.addEventListener("input", ulang);
    el.addEventListener("change", ulang);
  }
  document.querySelectorAll('input[name="jk"], #setuju').forEach(el =>
    el.addEventListener("change", validasiRadioDanCek));

  // submit: data tidak terkirim bila belum valid
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (validasiSemua()) {
      tampilkanRingkasan();
    } else {
      const pertama = form.querySelector(".is-invalid");
      if (pertama) pertama.focus();
    }
  });

  // reset: bersihkan status validasi, usia, dan pilihan dokter
  form.addEventListener("reset", () => {
    setTimeout(() => {
      form.querySelectorAll(".is-invalid, .is-valid").forEach(el => el.classList.remove("is-invalid", "is-valid"));
      form.querySelectorAll("[id^='err-']").forEach(el => el.textContent = "");
      document.getElementById("usia").textContent = "";
      document.getElementById("sisaKarakter").textContent = "200";
      document.getElementById("sisaKarakter").parentElement.classList.remove("text-danger");
      isiPilihanDokter("");
    }, 0);
  });

  // modal ditutup: kosongkan formulir; tombol cetak (bonus print stylesheet)
  document.getElementById("modalRingkasan").addEventListener("hidden.bs.modal", () => form.reset());
  document.getElementById("btnCetak").addEventListener("click", () => window.print());
}

// ---------- Halaman Admin: login, daftar permintaan, terima/tolak ----------
function sel(id) { return document.getElementById(id); }

function sel_td(teks, kelas) {
  const td = document.createElement("td");
  if (kelas) td.className = kelas;
  td.textContent = teks;
  return td;
}

function renderPermintaan() {
  const dataTersimpan = bacaJSON(KUNCI_DATA, []);
  const semua = Array.isArray(dataTersimpan) ? dataTersimpan : [];
  const filter = sel("filterStatus").value;
  const tbody = sel("tabelPermintaan");
  tbody.innerHTML = "";

  const hitung = { Menunggu: 0, Diterima: 0, Ditolak: 0 };
  semua.forEach(p => {
    if (Object.prototype.hasOwnProperty.call(hitung, p.status)) hitung[p.status]++;
  });
  sel("stTotal").textContent = semua.length;
  sel("stMenunggu").textContent = hitung.Menunggu;
  sel("stDiterima").textContent = hitung.Diterima;
  sel("stDitolak").textContent = hitung.Ditolak;

  const tampil = semua
    .filter(p => p && (filter === "Semua" || p.status === filter))
    .sort((a, b) => String(b.waktuDaftar || "").localeCompare(String(a.waktuDaftar || "")));
  for (const p of tampil) {
    const tr = document.createElement("tr");
    tr.appendChild(sel_td(p.antrean, "fw-bold text-nowrap"));

    const tdPasien = document.createElement("td");
    const nama = document.createElement("div");
    nama.className = "fw-semibold";
    nama.textContent = p.nama;
    const rinci = document.createElement("div");
    rinci.className = "small text-muted";
    rinci.textContent = p.jk + ", " + p.usia + " th | NIK " + p.nik + " | HP " + p.hp;
    tdPasien.append(nama, rinci);
    tr.appendChild(tdPasien);

    const tdPoli = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge badge-poli me-1";
    badge.textContent = p.poli;
    tdPoli.append(badge, document.createTextNode(p.dokter));
    tr.appendChild(tdPoli);

    tr.appendChild(sel_td(formatTanggal(p.tglKunjungan), "text-nowrap"));
    tr.appendChild(sel_td(p.keluhan, "keluhan-admin"));

    const tdStatus = document.createElement("td");
    const st = document.createElement("span");
    st.className = "badge status-" + p.status.toLowerCase();
    st.textContent = p.status;
    tdStatus.appendChild(st);
    tr.appendChild(tdStatus);

    const tdAksi = document.createElement("td");
    tdAksi.className = "text-nowrap";
    if (p.status === "Menunggu") {
      const terima = document.createElement("button");
      terima.type = "button";
      terima.className = "btn btn-sm btn-klinik me-1";
      terima.textContent = "Terima";
      terima.addEventListener("click", () => ubahStatus(p.id, "Diterima"));
      const tolak = document.createElement("button");
      tolak.type = "button";
      tolak.className = "btn btn-sm btn-outline-danger";
      tolak.textContent = "Tolak";
      tolak.addEventListener("click", () => ubahStatus(p.id, "Ditolak"));
      tdAksi.append(terima, tolak);
    } else {
      tdAksi.textContent = "-";
    }
    tr.appendChild(tdAksi);
    tbody.appendChild(tr);
  }
  sel("infoAdmin").textContent = tampil.length
    ? "Menampilkan " + tampil.length + " permintaan."
    : "Tidak ada permintaan pada status ini.";
}

function ubahStatus(id, statusBaru) {
  if (!adaSesiAdmin()) return;
  if (!["Diterima", "Ditolak"].includes(statusBaru)) return;

  const dataTersimpan = bacaJSON(KUNCI_DATA, []);
  const semua = Array.isArray(dataTersimpan) ? dataTersimpan : [];
  const p = semua.find(x => String(x.id) === String(id));
  if (!p || p.status !== "Menunggu") return;

  p.status = statusBaru;
  p.waktuDiubah = new Date().toISOString();
  if (simpanJSON(KUNCI_DATA, semua)) renderPermintaan();
}

function tampilkanHalamanAdmin() {
  const login = adaSesiAdmin();
  sel("boxLogin").hidden = login;
  sel("panelAdmin").hidden = !login;
  tampilkanMenuAdmin();
  if (login) renderPermintaan();
}

function initAdmin() {
  sel("formLogin").addEventListener("submit", e => {
    e.preventDefault();
    const u = sel("adminUser").value.trim();
    const p = sel("adminPass").value;
    if (u === AKUN_ADMIN.username && p === AKUN_ADMIN.password) {
      sessionStorage.setItem(KUNCI_SESI, "1");
      sel("err-login").textContent = "";
      sel("formLogin").reset();
      tampilkanHalamanAdmin();
    } else {
      sel("err-login").textContent = "Username atau password salah.";
    }
  });
  sel("btnLogout").addEventListener("click", () => {
    sessionStorage.removeItem(KUNCI_SESI);
    tampilkanHalamanAdmin();
  });
  sel("filterStatus").addEventListener("change", renderPermintaan);
  // Sinkronkan tabel jika pendaftaran/status berubah dari tab browser lain.
  window.addEventListener("storage", e => {
    if (e.key === KUNCI_DATA && adaSesiAdmin()) renderPermintaan();
  });
  tampilkanHalamanAdmin();
}

// ---------- Customer service: tombol melayang WhatsApp & telepon ----------
// GANTI nomor di bawah dengan nomor resmi klinik (WA: format internasional tanpa + atau 0 di depan).
const CS_KONTAK = {
  wa: "62895358047218",
  telepon: "+62895358047218",
  pesanAwal: "Halo Klinik Sehat Nusantara, saya ingin bertanya tentang layanan klinik.",
  jamBuka: 7.5,   // 07.30 WIB
  jamTutup: 17,   // 17.00 WIB
  hariBuka: [1, 2, 3, 4, 5, 6] // Senin-Sabtu (0 = Minggu)
};

function klinikSedangBuka() {
  // Waktu dihitung dalam WIB agar tidak bergantung zona waktu perangkat pengunjung.
  const bagian = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta", weekday: "short", hour: "numeric", minute: "numeric", hour12: false
  }).formatToParts(new Date());
  const ambil = t => bagian.find(p => p.type === t).value;
  const hari = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(ambil("weekday"));
  const jam = (parseInt(ambil("hour"), 10) % 24) + parseInt(ambil("minute"), 10) / 60;
  return CS_KONTAK.hariBuka.includes(hari) && jam >= CS_KONTAK.jamBuka && jam < CS_KONTAK.jamTutup;
}

// ---------- Asisten FAQ (berbasis kata kunci, tanpa server) ----------
const layananData = {
  Umum: ["Pemeriksaan fisik dan tekanan darah", "Pengobatan demam, batuk, dan flu", "Surat keterangan sehat", "Rujukan ke fasilitas lanjutan"],
  Gigi: ["Pemeriksaan gigi dan mulut", "Penambalan gigi", "Pembersihan karang gigi", "Pencabutan gigi sederhana"],
  KIA:  ["Pemeriksaan kehamilan", "Imunisasi bayi dan anak", "Pemantauan tumbuh kembang", "Konsultasi KB"],
  Gizi: ["Penilaian status gizi", "Rencana menu harian", "Konsultasi diet penyakit kronis", "Gizi ibu hamil dan balita"]
};
const kataPoli = {
  Umum: ["umum", "demam", "batuk", "flu", "surat sehat", "surat keterangan"],
  Gigi: ["gigi", "tambal", "karang", "mulut"],
  KIA:  ["kia", "hamil", "kehamilan", "bayi", "anak", "imunisasi", "kb", "balita"],
  Gizi: ["gizi", "diet", "menu", "nutrisi"]
};

function ringkasTeks(teks) {
  const bersih = teks.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  return { bersih, kata: bersih.split(" ").filter(Boolean) };
}
function cocokKata(t, kw) {
  // Frasa (berspasi) dicari utuh. Kata pendek (<= 4 huruf) harus sama persis agar "menu" tidak cocok dengan "menunggu";
  // kata lebih panjang boleh cocok di awal kata ("daftar" cocok dengan "daftarkan").
  if (kw.includes(" ")) return t.bersih.includes(kw);
  return kw.length <= 4 ? t.kata.includes(kw) : t.kata.some(k => k.startsWith(kw));
}
function deteksiPoli(t) {
  for (const poli in kataPoli) if (kataPoli[poli].some(kw => cocokKata(t, kw))) return poli;
  return null;
}
function bulletList(arr) { return "<ul class=\"cs-daftar\">" + arr.map(x => "<li>" + x + "</li>").join("") + "</ul>"; }
function linkWAFaq(teks) {
  const href = "https://wa.me/" + CS_KONTAK.wa + "?text=" + encodeURIComponent(CS_KONTAK.pesanAwal);
  return "<a href=\"" + href + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + (teks || "Chat via WhatsApp") + "</a>";
}

const intentFaq = [
  { kata: ["darurat", "gawat", "pingsan", "sesak", "kecelakaan", "pendarahan", "perdarahan", "tidak sadar"],
    jawab: () => "Jika ini kondisi darurat, jangan menunggu balasan chat. Segera menuju IGD terdekat atau hubungi 119." },
  { kata: ["halo", "hai", "hi", "selamat pagi", "selamat siang", "selamat sore", "selamat malam", "permisi"],
    jawab: () => "Halo! Saya asisten FAQ Klinik Sehat Nusantara. Silakan tanya soal pendaftaran, jadwal dokter, layanan, atau jam buka." },
  { kata: ["terima kasih", "makasih", "thanks", "terimakasih"],
    jawab: () => "Sama-sama! Semoga lekas sehat. Ada yang ingin ditanyakan lagi?" },
  { kata: ["biaya", "harga", "tarif", "bayar", "pembayaran", "bpjs", "gratis", "murah"],
    jawab: () => "Informasi biaya dan pembayaran belum tersedia di situs ini. Silakan tanyakan langsung ke staf kami: " + linkWAFaq() + "." },
  { kata: ["batal", "ubah jadwal", "ganti jadwal", "reschedule", "pindah jadwal", "mengubah", "membatalkan"],
    jawab: () => "Untuk mengubah atau membatalkan jadwal kunjungan, silakan hubungi staf kami: " + linkWAFaq() + " atau lewat halaman <a href=\"kontak.html\">Hubungi Kami</a>." },
  { kata: ["daftar", "mendaftar", "pendaftaran", "registrasi", "antrean", "antrian", "nomor antrean", "booking"],
    jawab: () => "Buka halaman <a href=\"pendaftaran.html\">Pendaftaran</a>, isi data diri, pilih poliklinik dan dokter, lalu kirim. Nomor antrean muncul di layar setelah data dinyatakan benar." },
  { kata: ["jadwal", "dokter", "praktek", "praktik", "jam praktek", "jam praktik", "dokternya"],
    jawab: (t) => {
      const poli = deteksiPoli(t);
      if (!poli) return "Jadwal lengkap ada di halaman <a href=\"dokter.html\">Jadwal Dokter</a>. Sebutkan poli (Umum, Gigi, KIA, atau Gizi) dan saya tampilkan dokternya.";
      const baris = dokterData.filter(d => d.poli === poli).map(d => "<strong>" + d.nama + "</strong><br>" + d.hari.join(", ") + ", " + d.jam + " WIB");
      return "Dokter Poli " + poli + ":" + bulletList(baris) + "Daftar lengkap: <a href=\"dokter.html\">Jadwal Dokter</a>.";
    } },
  { kata: ["buka", "tutup", "jam buka", "jam operasional", "operasional", "jam layanan", "jam kerja", "libur", "minggu"],
    jawab: () => "Klinik melayani Senin–Sabtu, 07.30–17.00 WIB. Saat ini kami " + (klinikSedangBuka() ? "sedang buka." : "sedang tutup.") },
  { kata: ["alamat", "lokasi", "dimana", "di mana", "letak", "maps", "kediri"],
    jawab: () => "Klinik Pratama Sehat Nusantara berada di Jl. Contoh No. 12, Kota Kediri." },
  { kata: ["bawa", "dibawa", "membawa", "dokumen", "ktp", "syarat", "persyaratan", "kartu", "identitas"],
    jawab: () => "Bawa KTP atau kartu identitas lain, kartu BPJS bila ada, dan tunjukkan nomor antrean Anda di loket." },
  { kata: ["kapan", "tanggal", "14 hari", "batas"],
    jawab: () => "Kunjungan dapat dijadwalkan mulai hari ini sampai 14 hari ke depan melalui halaman <a href=\"pendaftaran.html\">Pendaftaran</a>." },
  { kata: ["layanan", "poli", "poliklinik", "periksa", "pemeriksaan", "perawatan", "tersedia"],
    jawab: (t) => {
      const poli = deteksiPoli(t);
      if (poli) return "Layanan Poli " + poli + ":" + bulletList(layananData[poli]);
      return "Kami memiliki empat poliklinik: Umum, Gigi, KIA, dan Gizi. Sebutkan nama poli untuk melihat layanannya, atau buka halaman <a href=\"layanan.html\">Layanan</a>.";
    } },
  { kata: ["kontak", "hubungi", "telepon", "telpon", "wa", "whatsapp", "nomor", "staf", "admin", "petugas", "operator"],
    jawab: () => "Anda bisa " + linkWAFaq("chat via WhatsApp") + ", menelepon <a href=\"tel:" + CS_KONTAK.telepon + "\">" + CS_KONTAK.telepon + "</a>, atau memakai halaman <a href=\"kontak.html\">Hubungi Kami</a>." }
];

function jawabAsisten(teks) {
  const t = ringkasTeks(teks);
  let terbaik = null, skorTerbaik = 0;
  for (const intent of intentFaq) {
    const skor = intent.kata.filter(kw => cocokKata(t, kw)).length;
    if (skor > skorTerbaik) { skorTerbaik = skor; terbaik = intent; }
  }
  // Pertanyaan darurat selalu didahulukan.
  const darurat = intentFaq[0];
  if (darurat.kata.some(kw => cocokKata(t, kw))) return darurat.jawab(t);
  if (terbaik) return terbaik.jawab(t);
  return "Maaf, saya belum bisa menjawab itu. Coba tanyakan soal pendaftaran, jadwal dokter, layanan, atau jam buka, atau hubungi staf kami lewat " + linkWAFaq("WhatsApp") + ".";
}

let bukaAsistenCS = null; // diisi saat widget dibuat; dipakai tombol di halaman Kontak

function initCustomerService() {
  if (document.getElementById("cs-widget")) return;
  const buka = klinikSedangBuka();
  const linkWA = "https://wa.me/" + CS_KONTAK.wa + "?text=" + encodeURIComponent(CS_KONTAK.pesanAwal);
  const linkTel = "tel:" + CS_KONTAK.telepon;

  const wadah = document.createElement("div");
  wadah.id = "cs-widget";
  wadah.className = "cs-widget";
  wadah.innerHTML = `
    <div class="cs-panel" id="cs-panel" role="dialog" aria-label="Customer service" hidden>
      <div id="cs-menu">
        <p class="cs-judul">Butuh bantuan?</p>
        <p class="cs-status ${buka ? "cs-buka" : "cs-tutup"}">
          <span class="cs-titik" aria-hidden="true"></span>${buka ? "Kami sedang buka" : "Kami sedang tutup"}
        </p>
        <p class="cs-jam">Senin–Sabtu, 07.30–17.00 WIB</p>
        <button type="button" class="cs-aksi cs-aksi-bot" id="cs-buka-bot">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2zm4 5v2h8V9H8zm0 4v2h5v-2H8z"/></svg>
          Tanya asisten FAQ
        </button>
        <a class="cs-aksi cs-aksi-wa" href="${linkWA}" target="_blank" rel="noopener noreferrer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2zm0 18.200c-1.500 0-3-.4-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200zm4.500-6.100c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100-1.500-.7-2.400-1.300-3.400-2.900-.3-.4.300-.4.800-1.300.1-.2 0-.3 0-.5l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.100-.7.300-.7.700-1 1.500-1 2.400.1 1 .5 2 1.200 2.900 1.300 1.800 2.900 3.200 5 4 .6.200 1.200.3 1.700.2.600-.1 1.500-.6 1.700-1.200.2-.6.200-1.100.1-1.200-.1-.1-.3-.2-.5-.3z"/></svg>
          Chat via WhatsApp
        </a>
        <a class="cs-aksi cs-aksi-tel" href="${linkTel}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.600 10.800a15.100 15.100 0 0 0 6.600 6.600l2.200-2.200a1 1 0 0 1 1-.25c1.100.37 2.300.57 3.600.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.600 21 3 13.400 3 4a1 1 0 0 1 1-1h3.500a1 1 0 0 1 1 1c0 1.300.2 2.500.57 3.600a1 1 0 0 1-.25 1z"/></svg>
          Telepon klinik
        </a>
        <a class="cs-link-kecil" href="kontak.html">Kirim pesan lewat halaman Hubungi Kami &rarr;</a>
      </div>

      <div id="cs-chat" hidden>
        <div class="cs-chat-kepala">
          <button type="button" class="cs-kembali" id="cs-kembali" aria-label="Kembali ke menu bantuan">&larr;</button>
          <span class="cs-judul mb-0">Asisten FAQ</span>
        </div>
        <div class="cs-log" id="cs-log" role="log" aria-live="polite"></div>
        <div class="cs-chip-baris" id="cs-chip-baris"></div>
        <form class="cs-form" id="cs-form" autocomplete="off">
          <input type="text" id="cs-input" class="form-control" aria-label="Ketik pertanyaan Anda" placeholder="Ketik pertanyaan..." maxlength="200">
          <button type="submit" class="btn btn-klinik">Kirim</button>
        </form>
      </div>
    </div>
    <button type="button" class="cs-fab" id="cs-fab" aria-expanded="false" aria-controls="cs-panel" aria-label="Hubungi customer service">
      <svg class="cs-ikon-buka" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 1-2z"/></svg>
      <svg class="cs-ikon-tutup" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>`;
  document.body.appendChild(wadah);

  const fab = document.getElementById("cs-fab");
  const panel = document.getElementById("cs-panel");
  const menu = document.getElementById("cs-menu");
  const chat = document.getElementById("cs-chat");
  const log = document.getElementById("cs-log");
  const input = document.getElementById("cs-input");
  let sapaTerkirim = false;

  function atur(terbuka) {
    panel.hidden = !terbuka;
    fab.setAttribute("aria-expanded", String(terbuka));
    wadah.classList.toggle("cs-terbuka", terbuka);
    if (!terbuka) tampilMenu();
  }
  function tampilMenu() {
    chat.hidden = true;
    menu.hidden = false;
    panel.classList.remove("cs-panel-chat");
  }
  function tampilChat() {
    menu.hidden = true;
    chat.hidden = false;
    panel.classList.add("cs-panel-chat");
    if (!sapaTerkirim) {
      sapaTerkirim = true;
      tambahPesan("bot", "Halo! Saya asisten FAQ Klinik Sehat Nusantara. Pilih pertanyaan di bawah atau ketik sendiri.", true);
    }
    input.focus();
  }
  function tambahPesan(pengirim, isi, html) {
    const el = document.createElement("div");
    el.className = "cs-pesan cs-pesan-" + pengirim;
    if (html) el.innerHTML = isi; else el.textContent = isi;   // teks pengguna tidak pernah disisipkan sebagai HTML
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }
  function kirim(teks) {
    teks = teks.trim();
    if (!teks) return;
    tambahPesan("user", teks, false);
    tambahPesan("bot", jawabAsisten(teks), true);
  }

  // Pertanyaan cepat
  [["Cara daftar", "Bagaimana cara mendaftar?"], ["Jam buka", "Jam buka klinik?"], ["Jadwal dokter", "Jadwal dokter"],
   ["Layanan poli", "Layanan poli apa saja?"], ["Yang dibawa", "Apa yang perlu dibawa?"], ["Biaya", "Berapa biaya berobat?"]]
    .forEach(([label, tanya]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "cs-chip"; b.textContent = label;
      b.addEventListener("click", () => kirim(tanya));
      document.getElementById("cs-chip-baris").appendChild(b);
    });

  document.getElementById("cs-form").addEventListener("submit", e => {
    e.preventDefault();
    kirim(input.value);
    input.value = "";
    input.focus();
  });
  document.getElementById("cs-buka-bot").addEventListener("click", tampilChat);
  document.getElementById("cs-kembali").addEventListener("click", tampilMenu);
  fab.addEventListener("click", () => atur(panel.hidden));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { atur(false); fab.focus(); } });
  document.addEventListener("click", e => { if (!panel.hidden && !wadah.contains(e.target)) atur(false); });

  bukaAsistenCS = () => { atur(true); tampilChat(); };
}

// ---------- Halaman Kontak ----------
const aturanKontak = {
  kNama(v) {
    v = v.trim();
    if (!v) return "Nama wajib diisi.";
    if (!/^[A-Za-z\s.,'’-]+$/.test(v)) return "Nama hanya boleh berisi huruf dan spasi.";
    if (v.length < 3) return "Nama minimal 3 karakter.";
    return "";
  },
  kHp: aturan.hp,
  kTopik(v) { return v ? "" : "Topik wajib dipilih."; },
  kPesan(v) {
    v = v.trim();
    if (!v) return "Pesan wajib diisi.";
    if (v.length < 10) return "Pesan minimal 10 karakter.";
    if (v.length > 500) return "Pesan maksimal 500 karakter.";
    return "";
  }
};

function initKontak() {
  const linkWA = "https://wa.me/" + CS_KONTAK.wa;
  const a = sel("kontakWA"); a.href = linkWA; a.textContent = "+" + CS_KONTAK.wa;
  const t = sel("kontakTel"); t.href = "tel:" + CS_KONTAK.telepon; t.textContent = CS_KONTAK.telepon;
  const status = sel("kontakStatus"), buka = klinikSedangBuka();
  status.textContent = buka ? "Buka sekarang" : "Tutup sekarang";
  status.className = "badge ms-1 " + (buka ? "status-diterima" : "status-ditolak");

  sel("btnBukaBot").addEventListener("click", () => { if (bukaAsistenCS) bukaAsistenCS(); });
  sel("kPesan").addEventListener("input", e => { sel("kHitung").textContent = e.target.value.length; });
  for (const id in aturanKontak) {
    sel(id).addEventListener("blur", () => tampilkanGalat(id, aturanKontak[id](sel(id).value)));
  }

  sel("formKontak").addEventListener("submit", e => {
    e.preventDefault();
    let valid = true;
    for (const id in aturanKontak) {
      const pesan = aturanKontak[id](sel(id).value);
      tampilkanGalat(id, pesan);
      if (pesan) valid = false;
    }
    if (!valid) { const pertama = document.querySelector("#formKontak .is-invalid"); if (pertama) pertama.focus(); return; }
    const teks = "Halo Klinik Sehat Nusantara,\n" +
      "Nama: " + sel("kNama").value.trim() + "\n" +
      "No. HP: " + sel("kHp").value.trim() + "\n" +
      "Topik: " + sel("kTopik").value + "\n\n" +
      sel("kPesan").value.trim();
    const url = "https://wa.me/" + CS_KONTAK.wa + "?text=" + encodeURIComponent(teks);
    window.open(url, "_blank", "noopener");
    const hasil = sel("kontakHasil");
    hasil.innerHTML = "WhatsApp dibuka dengan pesan Anda. Jika tidak terbuka, <a href=\"" + url + "\" target=\"_blank\" rel=\"noopener noreferrer\">klik di sini</a>.";
    hasil.hidden = false;
  });
}

// ---------- Jalankan sesuai halaman ----------
document.addEventListener("DOMContentLoaded", () => {
  const halaman = document.body.dataset.halaman;
  tampilkanMenuAdmin();
  initCustomerService();
  if (halaman === "index.html") initBeranda();
  if (halaman === "layanan.html") initLayanan();
  if (halaman === "dokter.html") initDokter();
  if (halaman === "pendaftaran.html") initPendaftaran();
  if (halaman === "admin.html") initAdmin();
  if (halaman === "kontak.html") initKontak();
});

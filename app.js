// 15 Data Pendaftar Bansos dengan Berbagai Kasus Valid & Tidak Valid
const initialSheetData = [
  { row: 2, nama: "Budi Santoso", email: "budi.santoso@warga.id", nik: "6306051204980001", status: "Valid", catatan: "16 digit NIK terverifikasi jelas & sesuai database dukcapil." },
  { row: 3, nama: "Siti Aminah", email: "siti.aminah@warga.id", nik: "6306055408990002", status: "Valid", catatan: "16 digit NIK terverifikasi jelas & sesuai database dukcapil." },
  { row: 4, nama: "Ahmad Fauzi", email: "ahmad.fauzi@warga.id", nik: "63060519001", status: "Tidak Valid", catatan: "DITOLAK: Ekstraksi OCR hanya membaca 11 digit (Foto KTP buram)." },
  { row: 5, nama: "Rina Kartika", email: "rina.kartika@warga.id", nik: "6306054509010004", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 6, nama: "Hendra Wijaya", email: "hendra.wijaya@warga.id", nik: "630605010188000X", status: "Tidak Valid", catatan: "DITOLAK: Terdeteksi karakter huruf 'X' pada NIK akibat pantulan cahaya." },
  { row: 7, nama: "Dewi Lestari", email: "dewi.lestari@warga.id", nik: "6306056211950003", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 8, nama: "Muhammad Rizky", email: "m.rizky@warga.id", nik: "6306051807020005", status: "Valid", catatan: "16 digit NIK terverifikasi jelas & sesuai database dukcapil." },
  { row: 9, nama: "Nurul Hidayah", email: "nurul.hidayah@warga.id", nik: "6306054903", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 10, nama: "Eko Prasetyo", email: "eko.prasetyo@warga.id", nik: "6306052910870007", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 11, nama: "Fitriani Rahma", email: "fitri.rahma@warga.id", nik: "", status: "Tidak Valid", catatan: "DITOLAK: Dokumen bukan KTP / NIK kosong tidak terbaca oleh AI." },
  { row: 12, nama: "Agus Setiawan", email: "agus.setiawan@warga.id", nik: "6306050412910009", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 13, nama: "Ratna Sari", email: "ratna.sari@warga.id", nik: "6306056705960010", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 14, nama: "Dimas Anggara", email: "dimas.anggara@warga.id", nik: "63060511029400B2", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 15, nama: "Lina Marlina", email: "lina.marlina@warga.id", nik: "6306055908900012", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." },
  { row: 16, nama: "Wahyu Saputra", email: "wahyu.saputra@warga.id", nik: "6306052106", status: "Menunggu", catatan: "Menunggu eksekusi workflow output..." }
];

let sheetData = JSON.parse(JSON.stringify(initialSheetData));
let currentFilter = "ALL";
let activeRowNumber = 2;
let isAutoRunning = false;

const dom = {
  rowIndex: document.getElementById("in_RowIndex"),
  status: document.getElementById("in_StatusVerifikasi"),
  nama: document.getElementById("in_NamaPendaftar"),
  email: document.getElementById("in_EmailPendaftar"),
  nik: document.getElementById("in_NIK_KTP"),
  nikCounter: document.getElementById("nikCounter"),
  catatan: document.getElementById("in_CatatanAI"),
  sheetsBody: document.getElementById("sheetsTableBody"),
  previewTo: document.getElementById("previewTo"),
  previewSubject: document.getElementById("previewSubject"),
  emailModeTag: document.getElementById("emailModeTag"),
  emailRenderBox: document.getElementById("emailRenderBox"),
  vbExpressionBox: document.getElementById("vbExpressionBox"),
  executionLog: document.getElementById("executionLog"),
  notifFeed: document.getElementById("notifFeed"),
  toastContainer: document.getElementById("toastContainer"),
  robotStatusText: document.getElementById("robotStatusText"),
  statTotal: document.getElementById("statTotal"),
  statValid: document.getElementById("statValid"),
  statInvalid: document.getElementById("statInvalid"),
  btnExecuteSingle: document.getElementById("btnExecuteSingle"),
  btnValidateNik: document.getElementById("btnValidateNik"),
  btnSimAccept: document.getElementById("btnSimAccept"),
  btnSimReject: document.getElementById("btnSimReject"),
  btnAutoRun: document.getElementById("btnAutoRun"),
  btnResetSheets: document.getElementById("btnResetSheets"),
  btnCopyVb: document.getElementById("btnCopyVb"),
  btnClearLog: document.getElementById("btnClearLog"),
  btnClearNotif: document.getElementById("btnClearNotif")
};

// Update Counter Statistik di Header
function updateStats() {
  const total = sheetData.length;
  const validCount = sheetData.filter((r) => r.status === "Valid").length;
  const invalidCount = sheetData.filter((r) => r.status === "Tidak Valid").length;

  dom.statTotal.textContent = total;
  dom.statValid.textContent = validCount;
  dom.statInvalid.textContent = invalidCount;
}

// Tampilkan Popup Toast Notification (Diterima & Ditolak)
function showNotificationToast(nama, email, status, catatan) {
  const isAccepted = status === "Valid";
  const toast = document.createElement("div");
  toast.className = `toast ${isAccepted ? "toast-accepted" : "toast-rejected"}`;

  const statusTitle = isAccepted
    ? "NOTIFIKASI DITERIMA TERKIRIM"
    : "NOTIFIKASI PENOLAKAN TERKIRIM";

  toast.innerHTML = `
    <div class="toast-header">
      <span>${statusTitle}</span>
      <span>GMAIL API</span>
    </div>
    <div class="toast-body">
      <strong>${nama}</strong> (${email})
    </div>
    <div class="toast-sub">${catatan}</div>
  `;

  dom.toastContainer.prepend(toast);

  setTimeout(() => {
    toast.remove();
  }, 3800);
}

// Tambahkan ke Riwayat Notifikasi Terkirim di Panel Kiri
function addNotificationHistory(rowNum, nama, email, status, catatan) {
  const isAccepted = status === "Valid";
  const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const card = document.createElement("div");
  card.className = `notif-card ${isAccepted ? "accepted" : "rejected"}`;

  const tagLabel = isAccepted ? "[DISETUJUI / DITERIMA]" : "[DITOLAK / TIDAK VALID]";

  card.innerHTML = `
    <div class="notif-card-top">
      <strong>${tagLabel} Baris #${rowNum}</strong>
      <span>${time}</span>
    </div>
    <div>Kepada: <strong>${nama}</strong> &lt;${email}&gt;</div>
    <div style="color: var(--text-muted); font-size: 0.7rem;">${catatan}</div>
  `;

  dom.notifFeed.prepend(card);
}

// Log Aktivitas Robot
function writeLog(level, message) {
  const now = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const div = document.createElement("div");
  div.className = "log-item";
  div.innerHTML = `[${now}] <strong>[${level}]</strong> ${message}`;
  dom.executionLog.prepend(div);
}

// Validasi 16 digit NIK otomatis
function autoValidateNikLogic(nikString) {
  const cleanNik = nikString.trim();
  if (!cleanNik) {
    return {
      status: "Tidak Valid",
      catatan: "DITOLAK: Foto KTP kosong atau NIK gagal diekstrak oleh AI Document Understanding."
    };
  }
  if (!/^\d+$/.test(cleanNik)) {
    return {
      status: "Tidak Valid",
      catatan: `DITOLAK: NIK mengandung karakter non-angka (${cleanNik}) akibat foto KTP silau/buram.`
    };
  }
  if (cleanNik.length !== 16) {
    return {
      status: "Tidak Valid",
      catatan: `DITOLAK: Jumlah digit NIK tidak lengkap (Terbaca ${cleanNik.length} dari 16 digit wajib).`
    };
  }
  return {
    status: "Valid",
    catatan: "DITERIMA: 16 digit NIK terverifikasi jelas & sesuai format standar KTP."
  };
}

// Render Tabel Google Sheets
function renderSheetsTable() {
  dom.sheetsBody.innerHTML = "";

  const filteredData = sheetData.filter((item) => {
    if (currentFilter === "ALL") return true;
    return item.status === currentFilter;
  });

  filteredData.forEach((item) => {
    const tr = document.createElement("tr");
    if (item.row === activeRowNumber) {
      tr.classList.add("selected-row");
    }

    let badgeClass = "badge badge-pending";
    let statusText = item.status;

    if (item.status === "Valid") {
      badgeClass = "badge badge-valid";
      statusText = "VALID (DITERIMA)";
    } else if (item.status === "Tidak Valid") {
      badgeClass = "badge badge-invalid";
      statusText = "TIDAK VALID (DITOLAK)";
    }

    tr.innerHTML = `
      <td>#${item.row}</td>
      <td><strong>${item.nama}</strong></td>
      <td>${item.email}</td>
      <td>${item.nik || "<em>Tidak Terbaca</em>"}</td>
      <td><span class="${badgeClass}">${statusText}</span></td>
      <td>${item.catatan}</td>
    `;

    tr.addEventListener("click", () => {
      loadRowIntoForm(item.row);
    });

    dom.sheetsBody.appendChild(tr);
  });

  updateStats();
}

// Muat baris ke Form Arguments
function loadRowIntoForm(rowNumber) {
  const item = sheetData.find((r) => r.row === rowNumber);
  if (!item) return;

  activeRowNumber = rowNumber;
  dom.rowIndex.value = item.row;
  dom.nama.value = item.nama;
  dom.email.value = item.email;
  dom.nik.value = item.nik;

  if (item.status === "Menunggu") {
    const check = autoValidateNikLogic(item.nik);
    dom.status.value = check.status;
    dom.catatan.value = check.catatan;
  } else {
    dom.status.value = item.status;
    dom.catatan.value = item.catatan;
  }

  updateNikCounter();
  updateEmailAndVbPreview();
  renderSheetsTable();
}

function updateNikCounter() {
  const len = dom.nik.value.trim().length;
  dom.nikCounter.textContent = `${len}/16 Digit`;
}

// Generate HTML Email (Membedakan Tampilan Diterima vs Ditolak dengan Jelas)
function generateEmailHtml(nama, nik, status, catatan) {
  const isAccepted = status === "Valid";
  const badgeBg = isAccepted ? "#10b981" : "#0f172a";
  const statusBanner = isAccepted
    ? "PENGAJUAN BANSOS DITERIMA (VALID)"
    : "PENGAJUAN BANSOS DITOLAK (TIDAK VALID)";

  const introMsg = isAccepted
    ? "Selamat! Berdasarkan pemeriksaan otomatis Robot RPA & AI Document Understanding, dokumen KTP Anda dinyatakan <strong>VALID</strong> dan pendaftaran Bantuan Sosial Anda telah <strong>DISETUJUI</strong>."
    : "Mohon maaf, berdasarkan hasil pemeriksaan otomatis Robot RPA & AI Document Understanding, dokumen KTP Anda dinyatakan <strong>TIDAK VALID</strong> sehingga pengajuan Bantuan Sosial Anda <strong>DITOLAK</strong>.";

  const actionBox = isAccepted
    ? `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 10px 12px; font-size: 12px; margin-bottom: 12px; color: #0f172a;">
         <strong>Tahap Selanjutnya:</strong> Dana bantuan akan disalurkan sesuai jadwal kelurahan. Simpan email ini sebagai bukti persetujuan resmi.
       </div>`
    : `<div style="background-color: #f1f5f9; border-left: 4px solid #0f172a; padding: 10px 12px; font-size: 12px; margin-bottom: 12px; color: #0f172a;">
         <strong>Instruksi Perbaikan:</strong> Silakan unggah ulang foto KTP asli yang terang, fokus, dan pastikan seluruh 16 digit angka NIK terlihat jelas.
       </div>`;

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; background-color: #f8fafc; padding: 16px; border: 1px solid #cbd5e1; border-radius: 6px;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <strong style="font-size: 13px;">SISTEM VERIFIKASI BANSOS TERPADU</strong>
        <span style="background-color: ${badgeBg}; color: #f8fafc; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px;">
          ${statusBanner}
        </span>
      </div>
      <p style="font-size: 13px; margin-bottom: 8px;">Yth. Bapak/Ibu <strong>${nama}</strong>,</p>
      <p style="font-size: 12.5px; line-height: 1.5; margin-bottom: 12px;">${introMsg}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; background-color: #ffffff;">
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; width: 36%; background-color: #f1f5f9;"><strong>NIK Terbaca (AI)</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-family: monospace;">${nik || "Tidak Terbaca"}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; background-color: #f1f5f9;"><strong>Keputusan Akhir</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">${isAccepted ? "DITERIMA (Valid)" : "DITOLAK (Tidak Valid)"}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; background-color: #f1f5f9;"><strong>Catatan Evaluasi AI</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">${catatan}</td>
        </tr>
      </table>
      ${actionBox}
      <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 10.5px; color: #475569;">
        Dikirim otomatis oleh Robot RPA UiPath — Mohon tidak membalas email ini.
      </div>
    </div>
  `;
}

// Generate VB.NET String untuk UiPath Studio
function generateVbNetString(status) {
  const isAccepted = status === "Valid";
  const statusBanner = isAccepted ? "DISETUJUI // DITERIMA" : "DITOLAK // TIDAK VALID";
  const introMsg = isAccepted
    ? "Selamat! Pendaftaran Bantuan Sosial Anda telah DISETUJUI berdasarkan verifikasi AI Document Understanding."
    : "Mohon maaf, pendaftaran Bantuan Sosial Anda DITOLAK karena dokumen KTP tidak lolos verifikasi AI.";

  return `"<div style='font-family:Arial,sans-serif;max-width:560px;padding:18px;border:1px solid #0f172a;background:#f8fafc;color:#0f172a;'>" +
"<div style='border-bottom:2px solid #0f172a;padding-bottom:8px;margin-bottom:12px;'>" +
"<strong>VERIFIKASI BANSOS — ${statusBanner}</strong></div>" +
"<p>Yth. <b>" + in_NamaPendaftar + "</b>,</p>" +
"<p>${introMsg}</p>" +
"<table style='width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;background:#ffffff;'>" +
"<tr><td style='border:1px solid #cbd5e1;padding:8px;'><b>NIK Terbaca</b></td>" +
"<td style='border:1px solid #cbd5e1;padding:8px;'>" + If(String.IsNullOrEmpty(in_NIK_KTP), "Tidak Terbaca", in_NIK_KTP) + "</td></tr>" +
"<tr><td style='border:1px solid #cbd5e1;padding:8px;'><b>Status Akhir</b></td>" +
"<td style='border:1px solid #cbd5e1;padding:8px;'><b>" + in_StatusVerifikasi + "</b></td></tr>" +
"<tr><td style='border:1px solid #cbd5e1;padding:8px;'><b>Catatan AI</b></td>" +
"<td style='border:1px solid #cbd5e1;padding:8px;'>" + in_CatatanAI + "</td></tr></table>" +
"<p style='font-size:11px;color:#475569;'>Notifikasi Otomatis Robot RPA UiPath.</p></div>"`;
}

// Update Pratinjau Email & Kode VB.NET
function updateEmailAndVbPreview() {
  const nama = dom.nama.value.trim() || "Warga Pendaftar";
  const email = dom.email.value.trim() || "warga@email.id";
  const nik = dom.nik.value.trim();
  const status = dom.status.value;
  const catatan = dom.catatan.value.trim();

  const isAccepted = status === "Valid";
  const subjectPrefix = isAccepted ? "[DISETUJUI]" : "[DITOLAK]";

  dom.emailModeTag.textContent = isAccepted ? "MODE: DITERIMA" : "MODE: DITOLAK";
  dom.emailModeTag.className = isAccepted ? "badge badge-valid" : "badge badge-invalid";

  dom.previewTo.textContent = email;
  dom.previewSubject.textContent = `${subjectPrefix} Pengumuman Verifikasi Bansos - ${nama}`;
  dom.emailRenderBox.innerHTML = generateEmailHtml(nama, nik, status, catatan);
  dom.vbExpressionBox.textContent = generateVbNetString(status);
}

// Eksekusi Update Baris & Kirim Notifikasi (Diterima / Ditolak)
function executeSingleRow() {
  const rowNum = parseInt(dom.rowIndex.value, 10);
  const target = sheetData.find((r) => r.row === rowNum);

  if (!target) {
    writeLog("ERROR", `Baris #${rowNum} tidak ditemukan di tabel Google Sheets.`);
    return;
  }

  activeRowNumber = rowNum;
  target.nama = dom.nama.value.trim();
  target.email = dom.email.value.trim();
  target.nik = dom.nik.value.trim();
  target.status = dom.status.value;
  target.catatan = dom.catatan.value.trim();

  const decisionText = target.status === "Valid" ? "DITERIMA" : "DITOLAK";
  dom.robotStatusText.textContent = `SENDING // ROW #${rowNum} (${decisionText})`;

  renderSheetsTable();
  updateEmailAndVbPreview();

  // Munculkan Toast & Masukkan ke Riwayat Notifikasi
  showNotificationToast(target.nama, target.email, target.status, target.catatan);
  addNotificationHistory(rowNum, target.nama, target.email, target.status, target.catatan);

  writeLog("INFO", `Row #${rowNum} (${target.nama}) -> Status: ${target.status} | Notifikasi ${decisionText} terkirim ke ${target.email}.`);
}

// Jalankan Auto-Loop untuk Seluruh 15 Pendaftar
async function runFullQueueAutomation() {
  if (isAutoRunning) return;
  isAutoRunning = true;
  dom.btnAutoRun.textContent = "Memproses 15 Antrean...";
  writeLog("INFO", "Memulai Auto-Loop (For Each Row) untuk 15 pendaftar Bansos...");

  for (const item of sheetData) {
    loadRowIntoForm(item.row);
    const check = autoValidateNikLogic(item.nik);
    dom.status.value = check.status;
    dom.catatan.value = check.catatan;

    executeSingleRow();
    await new Promise((r) => setTimeout(r, 550));
  }

  dom.robotStatusText.textContent = "COMPLETED // 15 NOTIFICATIONS SENT";
  dom.btnAutoRun.textContent = "Jalankan Antrean Robot (15 Data)";
  writeLog("INFO", "Seluruh 15 data selesai diverifikasi dan dikirimi email Diterima/Ditolak.");
  isAutoRunning = false;
}

// Event Listeners
dom.nik.addEventListener("input", () => {
  updateNikCounter();
  updateEmailAndVbPreview();
});

[dom.nama, dom.email, dom.status, dom.catatan].forEach((el) => {
  el.addEventListener("input", updateEmailAndVbPreview);
});

dom.btnValidateNik.addEventListener("click", () => {
  const result = autoValidateNikLogic(dom.nik.value);
  dom.status.value = result.status;
  dom.catatan.value = result.catatan;
  updateEmailAndVbPreview();
});

// Tombol Uji Cepat Notifikasi Diterima
dom.btnSimAccept.addEventListener("click", () => {
  dom.status.value = "Valid";
  dom.catatan.value = "DITERIMA: 16 digit NIK terverifikasi jelas & sesuai database dukcapil.";
  executeSingleRow();
});

// Tombol Uji Cepat Notifikasi Ditolak
dom.btnSimReject.addEventListener("click", () => {
  dom.status.value = "Tidak Valid";
  dom.catatan.value = "DITOLAK: Foto KTP buram / digit NIK tidak lengkap hasil pemeriksaan AI.";
  executeSingleRow();
});

dom.btnExecuteSingle.addEventListener("click", executeSingleRow);
dom.btnAutoRun.addEventListener("click", runFullQueueAutomation);

// Filter Tabel Status
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderSheetsTable();
  });
});

dom.btnResetSheets.addEventListener("click", () => {
  sheetData = JSON.parse(JSON.stringify(initialSheetData));
  dom.notifFeed.innerHTML = "";
  loadRowIntoForm(2);
  writeLog("INFO", "15 data pendaftar di-reset ke status awal.");
});

dom.btnClearLog.addEventListener("click", () => {
  dom.executionLog.innerHTML = "";
});

dom.btnClearNotif.addEventListener("click", () => {
  dom.notifFeed.innerHTML = "";
});

dom.btnCopyVb.addEventListener("click", () => {
  navigator.clipboard.writeText(dom.vbExpressionBox.textContent);
  const oldText = dom.btnCopyVb.textContent;
  dom.btnCopyVb.textContent = "Copied!";
  setTimeout(() => {
    dom.btnCopyVb.textContent = oldText;
  }, 1400);
});

// Inisialisasi awal beserta contoh riwayat notifikasi Diterima & Ditolak
loadRowIntoForm(2);
addNotificationHistory(2, "Budi Santoso", "budi.santoso@warga.id", "Valid", "DITERIMA: 16 digit NIK terverifikasi jelas & sesuai database dukcapil.");
addNotificationHistory(4, "Ahmad Fauzi", "ahmad.fauzi@warga.id", "Tidak Valid", "DITOLAK: Ekstraksi OCR hanya membaca 11 digit (Foto KTP buram).");

// Data awal simulasi Google Sheets
const initialSheetData = [
  {
    row: 2,
    nama: "Budi Santoso",
    email: "budi.santoso@warga.id",
    nik: "6306051204980001",
    status: "Valid",
    catatan: "16 digit NIK terverifikasi jelas & sesuai database dukcapil."
  },
  {
    row: 3,
    nama: "Siti Aminah",
    email: "siti.aminah@warga.id",
    nik: "6306055408990002",
    status: "Menunggu",
    catatan: "Menunggu eksekusi workflow output..."
  },
  {
    row: 4,
    nama: "Ahmad Fauzi",
    email: "ahmad.fauzi@warga.id",
    nik: "63060519001",
    status: "Tidak Valid",
    catatan: "Ekstraksi OCR hanya membaca 11 digit (Foto KTP buram)."
  },
  {
    row: 5,
    nama: "Rina Kartika",
    email: "rina.kartika@warga.id",
    nik: "6306054509010004",
    status: "Menunggu",
    catatan: "Menunggu eksekusi workflow output..."
  },
  {
    row: 6,
    nama: "Hendra Wijaya",
    email: "hendra.w@warga.id",
    nik: "630605010188000X",
    status: "Menunggu",
    catatan: "Menunggu eksekusi workflow output..."
  }
];

let sheetData = JSON.parse(JSON.stringify(initialSheetData));
let isAutoRunning = false;

// Referensi DOM
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
  emailRenderBox: document.getElementById("emailRenderBox"),
  vbExpressionBox: document.getElementById("vbExpressionBox"),
  executionLog: document.getElementById("executionLog"),
  robotStatusText: document.getElementById("robotStatusText"),
  btnExecuteSingle: document.getElementById("btnExecuteSingle"),
  btnValidateNik: document.getElementById("btnValidateNik"),
  btnAutoRun: document.getElementById("btnAutoRun"),
  btnResetSheets: document.getElementById("btnResetSheets"),
  btnCopyVb: document.getElementById("btnCopyVb"),
  btnClearLog: document.getElementById("btnClearLog")
};

// Catat Log seperti panel Output UiPath Studio
function writeLog(level, message) {
  const now = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const div = document.createElement("div");
  div.className = "log-item";
  div.innerHTML = `[${now}] <strong>[${level}]</strong> ${message}`;
  dom.executionLog.prepend(div);
}

// Validasi 16 digit angka NIK otomatis (Simulasi logika bisnis Document Understanding)
function autoValidateNikLogic(nikString) {
  const cleanNik = nikString.trim();
  const is16Digits = /^\d{16}$/.test(cleanNik);

  if (is16Digits) {
    return {
      status: "Valid",
      catatan: "16 digit NIK terverifikasi jelas & sesuai format standar KTP."
    };
  } else {
    return {
      status: "Tidak Valid",
      catatan: `Format NIK gagal validasi AI (Terbaca ${cleanNik.length} karakter, wajib 16 digit angka).`
    };
  }
}

// Render Tabel Google Sheets
function renderSheetsTable(selectedRowNum) {
  dom.sheetsBody.innerHTML = "";

  sheetData.forEach((item) => {
    const tr = document.createElement("tr");
    if (item.row === selectedRowNum) {
      tr.classList.add("selected-row");
    }

    const badgeClass = item.status === "Valid" ? "badge badge-valid" : "badge badge-invalid";

    tr.innerHTML = `
      <td>#${item.row}</td>
      <td><strong>${item.nama}</strong></td>
      <td>${item.email}</td>
      <td>${item.nik || "Tidak Terbaca"}</td>
      <td><span class="${badgeClass}">${item.status}</span></td>
      <td>${item.catatan}</td>
    `;

    // Klik baris tabel untuk mengoper data ke Form Arguments
    tr.addEventListener("click", () => {
      loadRowIntoForm(item.row);
    });

    dom.sheetsBody.appendChild(tr);
  });
}

// Muat baris tertentu ke panel Arguments di sebelah kiri
function loadRowIntoForm(rowNumber) {
  const item = sheetData.find((r) => r.row === rowNumber);
  if (!item) return;

  dom.rowIndex.value = item.row;
  dom.nama.value = item.nama;
  dom.email.value = item.email;
  dom.nik.value = item.nik;

  // Jika masih "Menunggu", evaluasi otomatis dengan pengecek NIK
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
  renderSheetsTable(rowNumber);
  writeLog("INFO", `Memuat data baris #${rowNumber} (${item.nama}) ke Arguments.`);
}

// Update indikator jumlah digit NIK
function updateNikCounter() {
  const len = dom.nik.value.trim().length;
  dom.nikCounter.textContent = `${len}/16 Digit`;
}

// Bangun HTML Email (Menggunakan 3 palet warna yang konsisten)
function generateEmailHtml(nama, nik, status, catatan) {
  const isValid = status.trim().toUpperCase() === "VALID";
  const badgeBg = isValid ? "#10b981" : "#0f172a";
  const statusHeading = isValid ? "DISETUJUI // VALID" : "DITOLAK // TIDAK VALID";

  const introMsg = isValid
    ? "Selamat! Dokumen KTP dan data pendaftaran Bantuan Sosial (Bansos) Anda telah berhasil diverifikasi oleh sistem AI Document Understanding kami."
    : "Mohon maaf, pendaftaran Bantuan Sosial (Bansos) Anda belum dapat kami proses lebih lanjut karena dokumen KTP tidak lolos verifikasi AI.";

  const nextStepMsg = isValid
    ? "Silakan simpan email ini sebagai bukti verifikasi resmi. Jadwal penyaluran bantuan akan diinformasikan pada tahap berikutnya."
    : "Silakan ajukan ulang pendaftaran dengan memastikan foto KTP terlihat terang, tidak buram, dan 16 digit NIK terbaca jelas.";

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; background-color: #f8fafc; padding: 18px; border: 1px solid #cbd5e1; border-radius: 6px;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 14px; letter-spacing: 0.4px;">VERIFIKASI BANSOS TERPADU</strong>
        <span style="background-color: ${badgeBg}; color: #f8fafc; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px;">
          ${statusHeading}
        </span>
      </div>
      <p style="font-size: 13px; margin-bottom: 10px;">Halo <strong>${nama}</strong>,</p>
      <p style="font-size: 13px; line-height: 1.5; margin-bottom: 14px;">${introMsg}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; background-color: #ffffff;">
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; width: 38%; background-color: #f1f5f9;"><strong>NIK Terbaca (AI)</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-family: monospace;">${nik || "Tidak Terbaca"}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; background-color: #f1f5f9;"><strong>Status Akhir</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-weight: bold;">${status}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px; background-color: #f1f5f9;"><strong>Catatan AI</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${catatan}</td>
        </tr>
      </table>
      <p style="font-size: 12px; line-height: 1.5; margin-bottom: 12px;">${nextStepMsg}</p>
      <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 11px; color: #475569;">
        Notifikasi Otomatis Robot RPA UiPath — Mohon tidak membalas pesan ini.
      </div>
    </div>
  `;
}

// Bangun kode ekspresi String VB.NET untuk UiPath Assign Activity
function generateVbNetString(status) {
  const isValid = status.trim().toUpperCase() === "VALID";
  const badgeBg = isValid ? "#10b981" : "#0f172a";
  const statusHeading = isValid ? "DISETUJUI // VALID" : "DITOLAK // TIDAK VALID";
  const introMsg = isValid
    ? "Selamat! Dokumen KTP dan pendaftaran Bansos Anda telah berhasil diverifikasi oleh AI Document Understanding."
    : "Mohon maaf, pendaftaran Bansos Anda belum dapat disetujui karena dokumen KTP tidak lolos verifikasi AI.";

  return `"<div style='font-family:Arial,sans-serif;max-width:560px;padding:20px;border:1px solid #0f172a;background:#f8fafc;color:#0f172a;'>" +
"<div style='border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:14px;'>" +
"<strong>PORTAL VERIFIKASI BANSOS — ${statusHeading}</strong></div>" +
"<p>Halo <b>" + in_NamaPendaftar + "</b>,</p>" +
"<p>${introMsg}</p>" +
"<table style='width:100%;border-collapse:collapse;margin:14px 0;font-size:13px;background:#ffffff;'>" +
"<tr><td style='border:1px solid #cbd5e1;padding:8px;'><b>NIK KTP (AI)</b></td>" +
"<td style='border:1px solid #cbd5e1;padding:8px;'>" + If(String.IsNullOrEmpty(in_NIK_KTP), "Tidak Terbaca", in_NIK_KTP) + "</td></tr>" +
"<tr><td style='border:1px solid #cbd5e1;padding:8px;'><b>Status Akhir</b></td>" +
"<td style='border:1px solid #cbd5e1;padding:8px;color:${badgeBg};'><b>" + in_StatusVerifikasi + "</b></td></tr>" +
"<tr><td style='border:1px solid #cbd5e1;padding:8px;'><b>Catatan AI</b></td>" +
"<td style='border:1px solid #cbd5e1;padding:8px;'>" + in_CatatanAI + "</td></tr></table>" +
"<p style='font-size:11px;color:#475569;'>Dikirim otomatis oleh Robot RPA UiPath.</p></div>"`;
}

// Perbarui pratinjau Email dan kode VB.NET
function updateEmailAndVbPreview() {
  const nama = dom.nama.value.trim() || "Pendaftar";
  const email = dom.email.value.trim() || "pendaftar@warga.id";
  const nik = dom.nik.value.trim();
  const status = dom.status.value;
  const catatan = dom.catatan.value.trim();

  const isValid = status.toUpperCase() === "VALID";
  const prefix = isValid ? "[DISETUJUI]" : "[DITOLAK]";

  dom.previewTo.textContent = email;
  dom.previewSubject.textContent = `${prefix} Hasil Verifikasi Pendaftaran Bansos - ${nama}`;
  dom.emailRenderBox.innerHTML = generateEmailHtml(nama, nik, status, catatan);
  dom.vbExpressionBox.textContent = generateVbNetString(status);
}

// Eksekusi pembaruan satu baris (Simulasi Write Cell + Send Email)
function executeSingleRow() {
  const rowNum = parseInt(dom.rowIndex.value, 10);
  const target = sheetData.find((r) => r.row === rowNum);

  if (!target) {
    writeLog("ERROR", `Baris #${rowNum} tidak ditemukan di Google Sheets.`);
    return;
  }

  dom.robotStatusText.textContent = `RUNNING // ROW #${rowNum} (WRITE CELL & GMAIL)`;

  target.nama = dom.nama.value.trim();
  target.email = dom.email.value.trim();
  target.nik = dom.nik.value.trim();
  target.status = dom.status.value;
  target.catatan = dom.catatan.value.trim();

  renderSheetsTable(rowNum);
  updateEmailAndVbPreview();

  writeLog("INFO", `Write Cell G${rowNum} = "${target.status}" & H${rowNum} = "${target.catatan}" berhasil.`);
  writeLog("INFO", `Send Email Gmail terkirim ke ${target.email} (${target.status}).`);

  setTimeout(() => {
    if (!isAutoRunning) {
      dom.robotStatusText.textContent = `SUCCESS // ROW #${rowNum} COMPLETED`;
    }
  }, 400);
}

// Simulasi Auto-Loop seluruh baris seperti For Each Row di UiPath
async function runFullQueueAutomation() {
  if (isAutoRunning) return;
  isAutoRunning = true;
  dom.btnAutoRun.textContent = "Memproses Antrean...";
  writeLog("INFO", "Memulai eksekusi For Each Row in Google Sheets...");

  for (const item of sheetData) {
    dom.robotStatusText.textContent = `AUTO-LOOP // PROCESSING ROW #${item.row}`;
    loadRowIntoForm(item.row);

    const validation = autoValidateNikLogic(item.nik);
    dom.status.value = validation.status;
    dom.catatan.value = validation.catatan;

    executeSingleRow();
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  dom.robotStatusText.textContent = "QUEUE FINISHED // ALL ROWS UPDATED";
  dom.btnAutoRun.textContent = "Jalankan Antrean Robot (Auto-Loop)";
  writeLog("INFO", "Seluruh antrean pendaftar Bansos selesai diverifikasi & dikirimi email.");
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
  writeLog("INFO", `Validasi RegEx 16 digit NIK menghasilkan status: ${result.status}`);
});

dom.btnExecuteSingle.addEventListener("click", executeSingleRow);
dom.btnAutoRun.addEventListener("click", runFullQueueAutomation);

dom.btnResetSheets.addEventListener("click", () => {
  sheetData = JSON.parse(JSON.stringify(initialSheetData));
  loadRowIntoForm(2);
  writeLog("INFO", "Data simulasi Google Sheets di-reset ke kondisi awal.");
});

dom.btnClearLog.addEventListener("click", () => {
  dom.executionLog.innerHTML = "";
});

dom.btnCopyVb.addEventListener("click", () => {
  navigator.clipboard.writeText(dom.vbExpressionBox.textContent);
  const original = dom.btnCopyVb.textContent;
  dom.btnCopyVb.textContent = "Copied!";
  writeLog("INFO", "String ekspresi VB.NET berhasil disalin ke Clipboard.");
  setTimeout(() => {
    dom.btnCopyVb.textContent = original;
  }, 1500);
});

// Inisialisasi awal saat halaman dibuka
loadRowIntoForm(2);

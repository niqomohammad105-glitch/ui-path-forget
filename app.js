const initialSheetData = [
  { row: 2, nama: "Budi Santoso", email: "budi.santoso@warga.id", nik: "6306051204980001", status: "Valid", catatan: "16 digit NIK terverifikasi jelas & sesuai database Dukcapil." },
  { row: 3, nama: "Siti Aminah", email: "siti.aminah@warga.id", nik: "6306055408990002", status: "Valid", catatan: "16 digit NIK terverifikasi jelas & sesuai database Dukcapil." },
  { row: 4, nama: "Ahmad Fauzi", email: "ahmad.fauzi@warga.id", nik: "63060519001", status: "Tidak Valid", catatan: "DITOLAK: OCR hanya membaca 11 digit (Foto KTP buram)." },
  { row: 5, nama: "Rina Kartika", email: "rina.kartika@warga.id", nik: "6306054509010004", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 6, nama: "Hendra Wijaya", email: "hendra.wijaya@warga.id", nik: "630605010188000X", status: "Tidak Valid", catatan: "DITOLAK: Karakter huruf 'X' terdeteksi pada NIK." },
  { row: 7, nama: "Dewi Lestari", email: "dewi.lestari@warga.id", nik: "6306056211950003", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 8, nama: "Muhammad Rizky", email: "m.rizky@warga.id", nik: "6306051807020005", status: "Valid", catatan: "16 digit NIK terverifikasi jelas & sesuai database Dukcapil." },
  { row: 9, nama: "Nurul Hidayah", email: "nurul.hidayah@warga.id", nik: "6306054903", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 10, nama: "Eko Prasetyo", email: "eko.prasetyo@warga.id", nik: "6306052910870007", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 11, nama: "Fitriani Rahma", email: "fitri.rahma@warga.id", nik: "", status: "Tidak Valid", catatan: "DITOLAK: NIK kosong / dokumen tidak terbaca AI." },
  { row: 12, nama: "Agus Setiawan", email: "agus.setiawan@warga.id", nik: "6306050412910009", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 13, nama: "Ratna Sari", email: "ratna.sari@warga.id", nik: "6306056705960010", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 14, nama: "Dimas Anggara", email: "dimas.anggara@warga.id", nik: "63060511029400B2", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 15, nama: "Lina Marlina", email: "lina.marlina@warga.id", nik: "6306055908900012", status: "Menunggu", catatan: "Menunggu antrean workflow..." },
  { row: 16, nama: "Wahyu Saputra", email: "wahyu.saputra@warga.id", nik: "6306052106", status: "Menunggu", catatan: "Menunggu antrean workflow..." }
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

function updateStats() {
  dom.statTotal.textContent = sheetData.length;
  dom.statValid.textContent = sheetData.filter(r => r.status === "Valid").length;
  dom.statInvalid.textContent = sheetData.filter(r => r.status === "Tidak Valid").length;
}

function showNotificationToast(nama, email, status, catatan) {
  const isAccepted = status === "Valid";
  const toast = document.createElement("div");
  toast.className = `toast ${isAccepted ? "toast-accepted" : "toast-rejected"}`;

  toast.innerHTML = `
    <div class="toast-header">
      <span>${isAccepted ? "EMAIL DITERIMA TERKIRIM" : "EMAIL DITOLAK TERKIRIM"}</span>
      <span>GMAIL</span>
    </div>
    <div class="toast-body"><strong>${nama}</strong></div>
    <div class="toast-sub">${catatan}</div>
  `;

  dom.toastContainer.prepend(toast);
  setTimeout(() => toast.remove(), 3500);
}

function addNotificationHistory(rowNum, nama, email, status, catatan) {
  const isAccepted = status === "Valid";
  const time = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const card = document.createElement("div");
  card.className = `notif-card ${isAccepted ? "accepted" : "rejected"}`;

  card.innerHTML = `
    <div class="notif-card-top">
      <strong>#${rowNum} ${isAccepted ? "DITERIMA" : "DITOLAK"}</strong>
      <span>${time}</span>
    </div>
    <div>${nama} &lt;${email}&gt;</div>
  `;
  dom.notifFeed.prepend(card);
}

function writeLog(level, message) {
  const now = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const div = document.createElement("div");
  div.className = "log-item";
  div.innerHTML = `[${now}] <strong>[${level}]</strong> ${message}`;
  dom.executionLog.prepend(div);
}

function autoValidateNikLogic(nikString) {
  const cleanNik = nikString.trim();
  if (!cleanNik || !/^\d+$/.test(cleanNik) || cleanNik.length !== 16) {
    return { status: "Tidak Valid", catatan: "DITOLAK: NIK tidak valid / kurang dari 16 digit angka." };
  }
  return { status: "Valid", catatan: "DITERIMA: 16 digit NIK terverifikasi sesuai Dukcapil." };
}

function renderSheetsTable() {
  dom.sheetsBody.innerHTML = "";
  const filtered = sheetData.filter(item => currentFilter === "ALL" || item.status === currentFilter);

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    if (item.row === activeRowNumber) tr.classList.add("selected-row");

    let badgeClass = "badge badge-pending";
    let statusText = item.status;
    if (item.status === "Valid") { badgeClass = "badge badge-valid"; statusText = "VALID"; }
    else if (item.status === "Tidak Valid") { badgeClass = "badge badge-invalid"; statusText = "TIDAK VALID"; }

    tr.innerHTML = `
      <td>#${item.row}</td>
      <td><strong>${item.nama}</strong></td>
      <td>${item.email}</td>
      <td>${item.nik || "<em>Kosong</em>"}</td>
      <td><span class="${badgeClass}">${statusText}</span></td>
      <td>${item.catatan}</td>
    `;
    tr.addEventListener("click", () => loadRowIntoForm(item.row));
    dom.sheetsBody.appendChild(tr);
  });
  updateStats();
}

function loadRowIntoForm(rowNumber) {
  const item = sheetData.find(r => r.row === rowNumber);
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

  dom.nikCounter.textContent = `${dom.nik.value.trim().length}/16`;
  updateEmailAndVbPreview();
  renderSheetsTable();
}

function generateEmailHtml(nama, nik, status, catatan) {
  const isAccepted = status === "Valid";
  const badgeBg = isAccepted ? "#10b981" : "#0f172a";

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; background-color: #f8fafc; padding: 18px; border: 1px solid #cbd5e1; border-radius: 8px;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
        <strong>VERIFIKASI BANSOS</strong>
        <span style="background-color: ${badgeBg}; color: #f8fafc; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px;">
          ${isAccepted ? "DISETUJUI" : "DITOLAK"}
        </span>
      </div>
      <p style="font-size: 13px; margin-bottom: 10px;">Halo <strong>${nama}</strong>,</p>
      <p style="font-size: 13px; line-height: 1.5; margin-bottom: 14px;">
        ${isAccepted ? "Pengajuan Bansos Anda telah <strong>DISETUJUI</strong>." : "Mohon maaf, pengajuan Bansos Anda <strong>DITOLAK</strong>."}
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; background-color: #ffffff;">
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; width: 35%; background: #f1f5f9;"><strong>NIK</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: monospace;">${nik || "Tidak Terbaca"}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9;"><strong>Catatan AI</strong></td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">${catatan}</td>
        </tr>
      </table>
      <div style="font-size: 11px; color: #475569;">Robot RPA UiPath</div>
    </div>
  `;
}

function generateVbNetString(status) {
  const isAccepted = status === "Valid";
  return `"<div style='font-family:Arial;padding:20px;border:1px solid #0f172a;background:#f8fafc;color:#0f172a;'>" +
"<strong>VERIFIKASI BANSOS - ${isAccepted ? "DISETUJUI" : "DITOLAK"}</strong>" +
"<p>Halo <b>" + in_NamaPendaftar + "</b></p>" +
"<p>Status: <b>" + in_StatusVerifikasi + "</b></p>" +
"<p>Catatan: " + in_CatatanAI + "</p></div>"`;
}

function updateEmailAndVbPreview() {
  const nama = dom.nama.value.trim() || "Warga";
  const email = dom.email.value.trim() || "warga@email.id";
  const nik = dom.nik.value.trim();
  const status = dom.status.value;
  const catatan = dom.catatan.value.trim();
  const isAccepted = status === "Valid";

  dom.emailModeTag.textContent = isAccepted ? "DITERIMA" : "DITOLAK";
  dom.emailModeTag.className = isAccepted ? "badge badge-valid" : "badge badge-invalid";
  dom.previewTo.textContent = email;
  dom.previewSubject.textContent = `${isAccepted ? "[DISETUJUI]" : "[DITOLAK]"} Pengumuman Bansos`;
  dom.emailRenderBox.innerHTML = generateEmailHtml(nama, nik, status, catatan);
  dom.vbExpressionBox.textContent = generateVbNetString(status);
}

function executeSingleRow() {
  const rowNum = parseInt(dom.rowIndex.value, 10);
  const target = sheetData.find(r => r.row === rowNum);
  if (!target) return;

  activeRowNumber = rowNum;
  target.nama = dom.nama.value.trim();
  target.email = dom.email.value.trim();
  target.nik = dom.nik.value.trim();
  target.status = dom.status.value;
  target.catatan = dom.catatan.value.trim();

  dom.robotStatusText.textContent = `UPDATE #${rowNum}`;
  renderSheetsTable();
  updateEmailAndVbPreview();
  showNotificationToast(target.nama, target.email, target.status, target.catatan);
  addNotificationHistory(rowNum, target.nama, target.email, target.status, target.catatan);
  writeLog("INFO", `Row #${rowNum} updated & email sent.`);
}

async function runFullQueueAutomation() {
  if (isAutoRunning) return;
  isAutoRunning = true;
  dom.btnAutoRun.textContent = "Processing...";
  writeLog("INFO", "Starting Auto-Loop...");

  for (const item of sheetData) {
    loadRowIntoForm(item.row);
    const check = autoValidateNikLogic(item.nik);
    dom.status.value = check.status;
    dom.catatan.value = check.catatan;
    executeSingleRow();
    await new Promise(r => setTimeout(r, 450));
  }

  dom.robotStatusText.textContent = "FINISHED";
  dom.btnAutoRun.textContent = "Jalankan 15 Antrean";
  writeLog("INFO", "All 15 queue completed.");
  isAutoRunning = false;
}

// Event Listeners
dom.nik.addEventListener("input", () => {
  dom.nikCounter.textContent = `${dom.nik.value.trim().length}/16`;
  updateEmailAndVbPreview();
});

[dom.nama, dom.email, dom.status, dom.catatan].forEach(el => el.addEventListener("input", updateEmailAndVbPreview));

dom.btnValidateNik.addEventListener("click", () => {
  const res = autoValidateNikLogic(dom.nik.value);
  dom.status.value = res.status;
  dom.catatan.value = res.catatan;
  updateEmailAndVbPreview();
});

dom.btnSimAccept.addEventListener("click", () => {
  dom.status.value = "Valid";
  dom.catatan.value = "DITERIMA: 16 digit NIK valid.";
  executeSingleRow();
});

dom.btnSimReject.addEventListener("click", () => {
  dom.status.value = "Tidak Valid";
  dom.catatan.value = "DITOLAK: KTP buram / NIK tidak lengkap.";
  executeSingleRow();
});

dom.btnExecuteSingle.addEventListener("click", executeSingleRow);
dom.btnAutoRun.addEventListener("click", runFullQueueAutomation);

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderSheetsTable();
  });
});

dom.btnResetSheets.addEventListener("click", () => {
  sheetData = JSON.parse(JSON.stringify(initialSheetData));
  dom.notifFeed.innerHTML = "";
  loadRowIntoForm(2);
  writeLog("INFO", "Sheets reset.");
});

dom.btnClearLog.addEventListener("click", () => dom.executionLog.innerHTML = "");
dom.btnClearNotif.addEventListener("click", () => dom.notifFeed.innerHTML = "");
dom.btnCopyVb.addEventListener("click", () => {
  navigator.clipboard.writeText(dom.vbExpressionBox.textContent);
  dom.btnCopyVb.textContent = "Copied!";
  setTimeout(() => dom.btnCopyVb.textContent = "Copy", 1200);
});

loadRowIntoForm(2);
addNotificationHistory(2, "Budi Santoso", "budi.santoso@warga.id", "Valid", "DITERIMA: 16 digit NIK valid.");
addNotificationHistory(4, "Ahmad Fauzi", "ahmad.fauzi@warga.id", "Tidak Valid", "DITOLAK: KTP buram / NIK tidak lengkap.");

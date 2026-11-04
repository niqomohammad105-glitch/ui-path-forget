const initialSheetData = [
  { row: 2, nama: "Budi Santoso", email: "budi.santoso@warga.id", nik: "6306051204980001", status: "Valid", catatan: "16 digit NIK valid sesuai Dukcapil." },
  { row: 3, nama: "Siti Aminah", email: "siti.aminah@warga.id", nik: "6306055408990002", status: "Valid", catatan: "16 digit NIK valid sesuai Dukcapil." },
  { row: 4, nama: "Ahmad Fauzi", email: "ahmad.fauzi@warga.id", nik: "63060519001", status: "Tidak Valid", catatan: "DITOLAK: OCR hanya membaca 11 digit." },
  { row: 5, nama: "Rina Kartika", email: "rina.kartika@warga.id", nik: "6306054509010004", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 6, nama: "Hendra Wijaya", email: "hendra.wijaya@warga.id", nik: "630605010188000X", status: "Tidak Valid", catatan: "DITOLAK: Karakter huruf 'X' pada NIK." },
  { row: 7, nama: "Dewi Lestari", email: "dewi.lestari@warga.id", nik: "6306056211950003", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 8, nama: "Muhammad Rizky", email: "m.rizky@warga.id", nik: "6306051807020005", status: "Valid", catatan: "16 digit NIK valid sesuai Dukcapil." },
  { row: 9, nama: "Nurul Hidayah", email: "nurul.hidayah@warga.id", nik: "6306054903", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 10, nama: "Eko Prasetyo", email: "eko.prasetyo@warga.id", nik: "6306052910870007", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 11, nama: "Fitriani Rahma", email: "fitri.rahma@warga.id", nik: "", status: "Tidak Valid", catatan: "DITOLAK: NIK kosong." },
  { row: 12, nama: "Agus Setiawan", email: "agus.setiawan@warga.id", nik: "6306050412910009", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 13, nama: "Ratna Sari", email: "ratna.sari@warga.id", nik: "6306056705960010", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 14, nama: "Dimas Anggara", email: "dimas.anggara@warga.id", nik: "63060511029400B2", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 15, nama: "Lina Marlina", email: "lina.marlina@warga.id", nik: "6306055908900012", status: "Menunggu", catatan: "Menunggu antrean..." },
  { row: 16, nama: "Wahyu Saputra", email: "wahyu.saputra@warga.id", nik: "6306052106", status: "Menunggu", catatan: "Menunggu antrean..." }
];

let sheetData = JSON.parse(JSON.stringify(initialSheetData));
let currentFilter = "ALL";
let activeRowNumber = 2;
let isCodeView = false;

const dom = {
  sheetsBody: document.getElementById("sheetsTableBody"),
  countValid: document.getElementById("countValid"),
  countInvalid: document.getElementById("countInvalid"),
  detailTitle: document.getElementById("detailTitle"),
  nama: document.getElementById("in_NamaPendaftar"),
  email: document.getElementById("in_EmailPendaftar"),
  nik: document.getElementById("in_NIK_KTP"),
  status: document.getElementById("in_StatusVerifikasi"),
  catatan: document.getElementById("in_CatatanAI"),
  emailRenderBox: document.getElementById("emailRenderBox"),
  vbExpressionBox: document.getElementById("vbExpressionBox"),
  toastContainer: document.getElementById("toastContainer"),
  btnExecuteSingle: document.getElementById("btnExecuteSingle"),
  btnSimAccept: document.getElementById("btnSimAccept"),
  btnSimReject: document.getElementById("btnSimReject"),
  btnAutoRun: document.getElementById("btnAutoRun"),
  btnResetData: document.getElementById("btnResetData"),
  btnCopyVb: document.getElementById("btnCopyVb")
};

function updateStats() {
  dom.countValid.textContent = sheetData.filter(r => r.status === "Valid").length;
  dom.countInvalid.textContent = sheetData.filter(r => r.status === "Tidak Valid").length;
}

function showToast(nama, status, catatan) {
  const isAccepted = status === "Valid";
  const toast = document.createElement("div");
  toast.className = `toast ${isAccepted ? "toast-accepted" : "toast-rejected"}`;
  toast.innerHTML = `
    <span class="toast-title">${isAccepted ? "EMAIL DITERIMA TERKIRIM" : "EMAIL DITOLAK TERKIRIM"}</span>
    <strong>${nama}</strong>
    <span style="color:var(--text-muted); font-size:0.72rem;">${catatan}</span>
  `;
  dom.toastContainer.prepend(toast);
  setTimeout(() => toast.remove(), 3200);
}

function renderTable() {
  dom.sheetsBody.innerHTML = "";
  const filtered = sheetData.filter(item => currentFilter === "ALL" || item.status === currentFilter);

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    if (item.row === activeRowNumber) tr.classList.add("selected-row");

    let badgeClass = "badge badge-pending";
    let statusText = item.status;
    if (item.status === "Valid") { badgeClass = "badge badge-valid"; statusText = "Terima"; }
    else if (item.status === "Tidak Valid") { badgeClass = "badge badge-invalid"; statusText = "Tolak"; }

    tr.innerHTML = `
      <td>#${item.row}</td>
      <td><strong>${item.nama}</strong></td>
      <td>${item.nik || "Kosong"}</td>
      <td><span class="${badgeClass}">${statusText}</span></td>
    `;
    tr.addEventListener("click", () => loadRow(item.row));
    dom.sheetsBody.appendChild(tr);
  });
  updateStats();
}

function loadRow(rowNum) {
  const item = sheetData.find(r => r.row === rowNum);
  if (!item) return;

  activeRowNumber = rowNum;
  dom.detailTitle.textContent = `Baris #${rowNum} — ${item.nama}`;
  dom.nama.value = item.nama;
  dom.email.value = item.email;
  dom.nik.value = item.nik;
  dom.status.value = item.status === "Menunggu" ? "Valid" : item.status;
  dom.catatan.value = item.catatan;

  updatePreview();
  renderTable();
}

function updatePreview() {
  const isAccepted = dom.status.value === "Valid";
  dom.emailRenderBox.innerHTML = `
    <div style="font-family:Arial; color:#0f172a;">
      <strong>PENGUMUMAN BANSOS — ${isAccepted ? "DISETUJUI" : "DITOLAK"}</strong>
      <p style="margin:8px 0;">Halo <b>${dom.nama.value}</b>,</p>
      <p style="margin-bottom:8px;">${isAccepted ? "Pengajuan Bansos Anda telah disetujui." : "Mohon maaf, pengajuan Bansos Anda ditolak."}</p>
      <div style="font-size:11px; color:#64748b;">NIK: ${dom.nik.value || "-"} | Catatan: ${dom.catatan.value}</div>
    </div>
  `;
  dom.vbExpressionBox.textContent = `"<div style='font-family:Arial;padding:16px;'><strong>BANSOS ${isAccepted ? "DISETUJUI" : "DITOLAK"}</strong><p>Halo " + in_NamaPendaftar + "</p><p>Catatan: " + in_CatatanAI + "</p></div>"`;
}

function executeAction() {
  const item = sheetData.find(r => r.row === activeRowNumber);
  if (!item) return;

  item.nama = dom.nama.value;
  item.email = dom.email.value;
  item.nik = dom.nik.value;
  item.status = dom.status.value;
  item.catatan = dom.catatan.value;

  renderTable();
  updatePreview();
  showToast(item.nama, item.status, item.catatan);
}

async function runAutoLoop() {
  dom.btnAutoRun.disabled = true;
  for (const item of sheetData) {
    loadRow(item.row);
    if(item.status === "Menunggu") {
      item.status = item.nik.length === 16 ? "Valid" : "Tidak Valid";
      item.catatan = item.status === "Valid" ? "Valid sesuai Dukcapil." : "Ditolak: NIK tidak lengkap.";
    }
    executeAction();
    await new Promise(r => setTimeout(r, 400));
  }
  dom.btnAutoRun.disabled = false;
}

// Event Listeners
[dom.nama, dom.email, dom.nik, dom.status, dom.catatan].forEach(el => el.addEventListener("input", updatePreview));

dom.btnExecuteSingle.addEventListener("click", executeAction);
dom.btnSimAccept.addEventListener("click", () => { dom.status.value = "Valid"; dom.catatan.value = "Diterima otomatis."; executeAction(); });
dom.btnSimReject.addEventListener("click", () => { dom.status.value = "Tidak Valid"; dom.catatan.value = "Ditolak otomatis."; executeAction(); });
dom.btnAutoRun.addEventListener("click", runAutoLoop);
dom.btnResetData.addEventListener("click", () => { sheetData = JSON.parse(JSON.stringify(initialSheetData)); loadRow(2); });

dom.btnCopyVb.addEventListener("click", () => {
  if(!isCodeView) {
    dom.emailRenderBox.style.display = "none";
    dom.vbExpressionBox.style.display = "block";
    dom.btnCopyVb.textContent = "Salin Teks VB.NET";
    isCodeView = true;
  } else {
    navigator.clipboard.writeText(dom.vbExpressionBox.textContent);
    dom.btnCopyVb.textContent = "Disalin!";
    setTimeout(() => dom.btnCopyVb.textContent = "Pratinjau Email", 1200);
  }
});

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTable();
  });
});

loadRow(2);

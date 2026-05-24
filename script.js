const FEE_PER_COPY = 300; // 1通300円（例）

const form = document.getElementById("application-form");
const feeDisplay = document.getElementById("feeDisplay");
const calculateFeeBtn = document.getElementById("calculateFeeBtn");
const applicationList = document.getElementById("applicationList");
const clearAllBtn = document.getElementById("clearAllBtn");
const formError = document.getElementById("formError");
const formSuccess = document.getElementById("formSuccess");

const STORAGE_KEY = "resident_applications";

function loadApplications() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveApplications(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderApplications() {
  const list = loadApplications();
  applicationList.innerHTML = "";

  if (list.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.textContent = "申請履歴はありません。";
    td.style.textAlign = "center";
    tr.appendChild(td);
    applicationList.appendChild(tr);
    return;
  }

  list.forEach(app => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${app.id}</td>
      <td>${app.name}</td>
      <td>${app.certificateTypeLabel}</td>
      <td>${app.copies}</td>
      <td>${app.receiveMethodLabel}</td>
      <td>${app.fee} 円</td>
      <td>${app.createdAt}</td>
    `;

    applicationList.appendChild(tr);
  });
}

function getCertificateTypeLabel(value) {
  switch (value) {
    case "full":
      return "世帯全員";
    case "individual":
      return "本人のみ";
    case "partial":
      return "一部";
    default:
      return "";
  }
}

function getReceiveMethodLabel(value) {
  switch (value) {
    case "counter":
      return "窓口受取";
    case "mail":
      return "郵送";
    default:
      return "";
  }
}

function calculateFee() {
  const copies = Number(document.getElementById("copies").value || 0);
  if (copies <= 0) {
    feeDisplay.textContent = "0 円";
    return 0;
  }
  const fee = copies * FEE_PER_COPY;
  feeDisplay.textContent = `${fee.toLocaleString()} 円`;
  return fee;
}

calculateFeeBtn.addEventListener("click", () => {
  formError.textContent = "";
  formSuccess.textContent = "";
  calculateFee();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formError.textContent = "";
  formSuccess.textContent = "";

  const name = document.getElementById("applicantName").value.trim();
  const address = document.getElementById("address").value.trim();
  const certificateType = document.getElementById("certificateType").value;
  const copies = Number(document.getElementById("copies").value || 0);
  const receiveMethod = document.getElementById("receiveMethod").value;
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!name || !address || !certificateType || !receiveMethod || !paymentMethod || copies <= 0) {
    formError.textContent = "未入力の項目があります。すべて入力してください。";
    return;
  }

  const fee = calculateFee();
  if (fee === 0) {
    formError.textContent = "通数が正しくありません。";
    return;
  }

  const list = loadApplications();
  const id = `AP-${String(list.length + 1).padStart(4, "0")}`;
  const now = new Date();
  const createdAt = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const app = {
    id,
    name,
    address,
    certificateType,
    certificateTypeLabel: getCertificateTypeLabel(certificateType),
    copies,
    receiveMethod,
    receiveMethodLabel: getReceiveMethodLabel(receiveMethod),
    paymentMethod,
    fee,
    createdAt
  };

  list.push(app);
  saveApplications(list);
  renderApplications();

  formSuccess.textContent = `申請を登録しました。（申請番号：${id}）`;
  form.reset();
  feeDisplay.textContent = "0 円";
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("申請履歴をすべて削除しますか？")) return;
  localStorage.removeItem(STORAGE_KEY);
  renderApplications();
});

document.addEventListener("DOMContentLoaded", () => {
  renderApplications();
  calculateFee();
});

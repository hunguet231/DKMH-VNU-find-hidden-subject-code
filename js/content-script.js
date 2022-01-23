// utils and configs
const insertAfter = (newNode, referenceNode) => {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

const getPosition = (string, subString, index) => {
  return string.split(subString, index).join(subString).length;
};

const config = {
  method: "POST",
  credentials: "same-origin",
  headers: {
    Cookie: document.cookie,
  },
};

const chooseSubject = async (num) => {
  try {
    const url = `http://dangkyhoc.vnu.edu.vn/chon-mon-hoc/${num}/1/${
      document.querySelector("span.select2-chosen").textContent ===
      "Môn học theo ngành"
        ? "1"
        : "2"
    }`;

    const res = await fetch(url, config);
    const data = await res.json();

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRegisteredSubject = async (subject) => {
  try {
    let res;
    while (true) {
      res = await fetch(
        `http://dangkyhoc.vnu.edu.vn/danh-sach-mon-hoc-da-dang-ky/1`,
        config
      );
      if (res.status === 304) continue;
      else if (res.status === 200) break;
      else return;
    }

    const data = await res.text();

    const div = document.createElement("div");
    div.innerHTML = `<table>${data}</table>`;
    const trs = div.querySelectorAll("tr");
    let tr;

    // Lớp thực hành
    if (subject.split(" ").includes("TH")) {
      tr = trs[trs.length - 2];
    } else {
      tr = trs[trs.length - 1];
    }

    const tds = tr.querySelectorAll("td");
    return [tds[3].textContent, tds[5].textContent.replace(/\s/g, "")];
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkMatch = async (num, subject, time) => {
  await chooseSubject(num);
  const [newSubject, newTime] = await getRegisteredSubject(subject);
  return (
    `${newSubject}${subject.split(" ").includes("TH") ? " TH" : ""}` ===
      subject && (time ? newTime === time.toString().replaceAll(" ", "") : true)
  );
};

// mount nodes
const newEle = document.createElement("div");
newEle.innerHTML = `
<div
  class="box bordered-box green-border box-header green-background"
  style="
    margin-bottom: 0px;
    padding: 9px;
    color: #fff;
    font-weight: bold;
    display: block;
    height: 100%;
    text-align: center;
  "
>
  Tool Dò Mã Số Môn v1.0
</div>
<div style="padding-left: 10px; padding-right: 10px">
  <textarea
    id="dm-subject"
    placeholder="Nhập mã Lớp môn học, ví dụ INT2208E 20, với lớp có LT và TH thì ghi TH sau mã lớp&#10;Ví dụ INT2208E 20 TH"
    style="
      padding-bottom: 2px;
      margin: 10px 0px;
      width: 100%;
      height: 100%;
      resize: both;
    "
    id="subject"
    rows="4"
  ></textarea>
  <textarea
    id="dm-time"
    placeholder="Nhập lịch học Thực hành (cần thiết đối với lớp có cả LT và TH)&#10;Ví dụ T6-(9-10)-210-GĐ3"
    style="
      padding-bottom: 2px;
      margin: 10px 0px;
      width: 100%;
      height: 100%;
      resize: both;
    "
    id="subject"
    rows="3"
  ></textarea>
  <div style="margin-bottom: 10px">
    <span>Dò từ</span
    >&nbsp;<input
      type="number"
      id="dm-start-number"
      min="1"
      step="1"
      value="1"
      style="border-color: initial; max-width: 60px; text-align: center"
    />
    <span>đến</span
    >&nbsp;<input
      type="number"
      id="dm-end-number"
      min="1"
      step="1"
      value="1000"
      style="border-color: initial; max-width: 60px; text-align: center"
    />
    <div style="margin-top: 10px">
      <button id="dm-btn" class="btn btn-warning">Bắt đầu</button>&nbsp;
      <span id="dm-running" style="color:green;font-weight:bold;word-wrap: break-word;"></span>
      <span id="dm-result" style="color:orange;font-weight:bold;word-wrap: break-word;"></span>
      <span id="dm-err" style="color:orange;font-weight:bold;word-wrap: break-word;"></span>
    </div>
  </div>
  <div style="padding-left: 10px; padding-right: 10px; color: grey">
    <p>*Chú ý: Tuỳ theo khoảng dò sẽ cho ra kết quả nhanh hoặc chậm. Sau khi dò xong, KHÔNG nhấn Ghi nhận, KHÔNG load lại trang để tránh bị lag, đăng xuất khỏi hệ thống và vào lại.</p>
  </div>
</div>
`;

const navigation = document.querySelector(".navigation");
insertAfter(newEle, navigation);

// find hidden subject code
let stop = false;
document.querySelector("#dm-btn").addEventListener("click", async function () {
  try {
    stop = false;
    this.addEventListener("click", function () {
      stop = !stop;
      if (stop) {
        this.setAttribute("class", "btn btn-warning");
        this.textContent = "Bắt đầu";
        running.textContent = "";
      } else {
        this.setAttribute("class", "btn btn-danger");
        this.textContent = "Dừng";
      }
    });

    if (stop) {
      this.setAttribute("class", "btn btn-warning");
      this.textContent = "Bắt đầu";
      return;
    } else {
      this.setAttribute("class", "btn btn-danger");
      this.textContent = "Dừng";
    }

    const subject = document.querySelector("#dm-subject");
    const time = document.querySelector("#dm-time");
    const startNum = document.querySelector("#dm-start-number");
    const endNum = document.querySelector("#dm-end-number");
    const running = document.querySelector("#dm-running");
    const result = document.querySelector("#dm-result");
    const err = document.querySelector("#dm-err");

    if (!subject) {
      alert("Hãy nhập Mã lớp môn học.");
      return;
    }

    result.textContent = "";
    err.textContent = "";
    let i;
    for (i = parseInt(startNum.value); i <= parseInt(endNum.value); ++i) {
      if (stop) {
        break;
      }
      running.textContent = `Đang dò mã: ${i}`;
      const check = await checkMatch(i, subject.value, time.value);
      if (check) {
        running.textContent = "";
        result.textContent = `Kết quả: ${i}`;
        break;
      }
    }

    if (i > parseInt(endNum.value)) {
      running.textContent = "";
      err.textContent = "Không tìm thấy!";
    }
  } catch (error) {
    document.querySelector("#dm-running").textContent = error.message;
  }
});

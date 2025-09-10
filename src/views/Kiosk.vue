<template>
  <div class="wrap">
    <div class="card">
      <div class="top">
        <h2>BỆNH VIỆN ĐA KHOA SA ĐÉC</h2>
        <h4>Số 153, Nguyễn Sinh Sắc, K.Hòa Khánh, Phường Sa Đéc, Tỉnh Đồng Tháp</h4>
      </div>

      <div class="bottom">
        <h1 class="text-center fw-bold mt-3 mb-5">HỆ THỐNG QUÉT THẺ LẤY SỐ THÔNG MINH</h1>

        <div class="content row">
          <!-- Bên trái: form quét -->
          <div class="col-6 px-5 d-flex flex-column justify-content-between">
            <form @submit.prevent class="form1">
              <!-- Ô input để quét -->
              <div class="form-group mb-2">
                <label class="form-label">Quét thẻ (CCCD/BHYT):</label>
                <input ref="inputScan" v-model="raw" @keyup.enter="parseData" @keydown="handleKeydown" type="text"
                  class="form-control" placeholder="Đưa thẻ vào máy quét..." />
              </div>

              <!-- Các input -->
              <div class="row">
                <div class="col-6 form-group mb-2">
                  <label class="form-label">Số CCCD/BHYT</label>
                  <input v-model="fields.so_the" type="text" class="form-control" readonly />
                </div>
                <div class="col-6 form-group mb-2">
                  <label class="form-label">Họ và tên</label>
                  <input v-model="fields.ho_ten" type="text" class="form-control" readonly />
                </div>
              </div>

              <div class="row">
                <div class="col-6 form-group mb-2">
                  <label class="form-label">Ngày sinh</label>
                  <input v-model="fields.ngay_sinh" type="text" class="form-control" readonly />
                </div>
                <div class="col-6 form-group mb-2">
                  <label class="form-label">Giới tính</label>
                  <input v-model="fields.gioi_tinh" type="text" class="form-control" readonly />
                </div>
              </div>

              <div class="row">
                <div class="col-6 form-group mb-2">
                  <label class="form-label">Nơi KCB ban đầu (BHYT)</label>
                  <input v-model="fields.noi_kcb" type="text" class="form-control" readonly />
                </div>
                <div class="col-6 form-group mb-2">
                  <label class="form-label">Hạn thẻ (BHYT)</label>
                  <input v-model="fields.han_the" type="text" class="form-control" readonly />
                </div>
              </div>

              <div class="row">
                <div class="col-12 form-group mb-2">
                  <label class="form-label">Địa chỉ</label>
                  <input v-model="fields.thuong_tru" type="text" class="form-control" readonly />
                </div>
              </div>
            </form>

            <!-- Nút đóng -->
            <!-- <div class="btn-dong" @click="closeApp">
              <span class="material-symbols-outlined">close</span>
            </div> -->

          </div>

          <!-- Bên phải: nút chọn -->
          <div class="col-6 d-flex flex-column justify-content-around px-5 mt-3">
            <!-- Khám thường -->
            <div v-if="showThuong" class="mb-3">
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span class="fw-bold">Đã cấp đến: {{ soCapThuong }}</span>
                <span class="fw-bold">Phục vụ đến: {{ soPhucVuThuong }}</span>
              </div>
              <button class="btn btn-primary btn-xxl w-100" @click="submitToApi(91, 'Khám thường')">
                KHÁM THƯỜNG
              </button>
            </div>

            <!-- Khám ưu tiên -->
            <div v-if="showUuTien" class="mb-3">
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span class="fw-bold">Đã cấp đến: {{ soCapUuTien }}</span>
                <span class="fw-bold">Phục vụ đến: {{ soPhucVuUuTien }}</span>
              </div>
              <button class="btn btn-warning btn-xxl w-100" @click="submitToApi(92, 'Khám ưu tiên')">
                KHÁM ƯU TIÊN
              </button>
            </div>

            <!-- Khám theo yêu cầu -->
            <div v-if="showYeuCau" class="mb-3">
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span class="fw-bold">Đã cấp đến: {{ soCapYeuCau }}</span>
                <span class="fw-bold">Phục vụ đến: {{ soPhucVuYeuCau }}</span>
              </div>
              <button class="btn btn-success btn-xxl w-100" @click="submitToApi(93, 'Khám theo yêu cầu')">
                KHÁM THEO YÊU CẦU
              </button>
            </div>
          </div>
        </div>

        <!-- Nút setting -->
        <div class="p-3 setting">
          <button class="btn btn-dark" title="Cấu hình" @click="open = true">
            <span class="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="open" class="modal-mask">
      <div class="modal-container">
        <h1 class="mb-3">Cấu hình hiển thị nút</h1>
        <div class="form-check d-flex align-items-center">
          <input class="form-check-input p-2" type="checkbox" v-model="showThuong" id="thuong" />
          <label class="form-check-label" for="thuong">Khám thường</label>
        </div>
        <div class="form-check d-flex align-items-center">
          <input class="form-check-input p-2" type="checkbox" v-model="showUuTien" id="uutien" />
          <label class="form-check-label" for="uutien">Khám ưu tiên</label>
        </div>
        <div class="form-check d-flex align-items-center">
          <input class="form-check-input p-2" type="checkbox" v-model="showYeuCau" id="yeucau" />
          <label class="form-check-label" for="yeucau">Khám theo yêu cầu</label>
        </div>

        <div class="text-end mt-3">
          <button class="btn btn-secondary px-4 py-2" @click="open = false">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận chưa quét -->
    <div v-if="confirmOpen" class="modal-mask">
      <div class="modal-container">
        <h1 class="mb-3">Bạn chưa quét thông tin</h1>
        <p>Bạn có muốn tiếp tục cấp số với dữ liệu rỗng không?</p>
        <div class="text-end mt-3">
          <button class="btn btn-secondary me-2 px-4 py-2" @click="confirmOpen = false">Hủy</button>
          <button class="btn btn-primary px-4 py-2"
            @click="_doSubmit(pendingPhankhu, pendingLoai); confirmOpen = false">
            Đồng ý
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      raw: "",
      open: false,
      fields: {
        stt: "",
        so_the: "",
        ho_ten: "",
        ngay_sinh: "",
        gioi_tinh: "",
        thuong_tru: "",
        han_the: "",
        noi_kcb: "",
      },
      showThuong: true,
      showUuTien: true,
      showYeuCau: true,

      // demo số hiện tại / phục vụ
      soCapThuong: 0,
      soPhucVuThuong: 0,
      soCapUuTien: 0,
      soPhucVuUuTien: 0,
      soCapYeuCau: 0,
      soPhucVuYeuCau: 0,

      confirmOpen: false,
      pendingPhankhu: null,
      pendingLoai: null,

    };
  },
  mounted() {
    this.fetchSoCap();
  },
  methods: {
    // formatSo(num) {
    //   if (!num) return "0000";
    //   return String(num).padStart(4, "0");
    // },
    handleKeydown(e) {
      const key = e.key.toLowerCase();

      // 🚫 Chặn Tab
      if (key === "tab") {
        e.preventDefault();
        return;
      }

      // 🚫 Chặn Ctrl+T (tab mới), Ctrl+N (cửa sổ mới)
      if ((e.ctrlKey && key === "t") || (e.ctrlKey && key === "n")) {
        e.preventDefault();
        return;
      }

      // 🚫 Chặn Ctrl+Shift+T (mở lại tab đóng)
      if (e.ctrlKey && e.shiftKey && key === "t") {
        e.preventDefault();
        return;
      }

      // 🚫 Chặn Ctrl+Shift+N (cửa sổ ẩn danh)
      if (e.ctrlKey && e.shiftKey && key === "n") {
        e.preventDefault();
        return;
      }
    },

    hexToUtf8(hex) {
      if (!hex) return "";
      try {
        const bytes = [];
        for (let c = 0; c < hex.length; c += 2) {
          bytes.push(parseInt(hex.substr(c, 2), 16));
        }
        return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
      } catch (e) {
        return hex;
      }
    },

    parseData() {
      const parts = this.raw.split("|").map((p) => p.trim());
      if (parts.length < 2) return;

      this.fields = {
        stt: "",
        so_the: "",
        ho_ten: "",
        ngay_sinh: "",
        gioi_tinh: "",
        thuong_tru: "",
        han_the: "",
        noi_kcb: "",
      };

      // CCCD
      if (/^\d{12}$/.test(parts[0])) {
        this.fields.so_the = parts[0];
        this.fields.ho_ten = parts[2] || "";
        this.fields.ngay_sinh = this.formatDate(parts[3]) || "";
        this.fields.gioi_tinh = parts[4] || "";
        this.fields.thuong_tru = parts[5] || "";
      }
      // BHYT
      else if (/^\d{10}$/.test(parts[0])) {
        this.fields.so_the = parts[0];
        this.fields.ho_ten = this.hexToUtf8(parts[1]);
        this.fields.ngay_sinh = this.formatDate(parts[2]) || "";
        this.fields.gioi_tinh = parts[3] === "1" ? "Nam" : "Nữ";
        this.fields.noi_kcb = parts[5] || "";
        this.fields.han_the = parts[12] || "";
      }

      this.raw = "";
      this.$nextTick(() => this.$refs.inputScan?.focus());
    },
    formatDate(str) {
      if (!str) return "";

      // Trường hợp dạng dd/mm/yyyy đã sẵn (06/10/2023)
      if (str.includes("/")) return str;

      // Trường hợp dạng ddMMyyyy (12061982)
      if (/^\d{8}$/.test(str)) {
        const d = str.substring(0, 2);
        const m = str.substring(2, 4);
        const y = str.substring(4);
        return `${d}/${m}/${y}`;
      }

      // Trường hợp khác, trả nguyên
      return str;
    },
    closeApp() {
      window.location.reload()

    },

    resetForm() {
      this.fields = {
        stt: "",
        so_the: "",
        ho_ten: "",
        ngay_sinh: "",
        gioi_tinh: "",
        thuong_tru: "",
        han_the: "",
        noi_kcb: "",
      };
      this.$nextTick(() => this.$refs.inputScan?.focus());
    },
    // async submitToApi(phankhu, loai) {
    //   const res = await axios.post(`/benhnhan`, {
    //     mathe: this.fields.so_the,
    //     hoten: this.fields.ho_ten,
    //     ngaysinh: this.fields.ngay_sinh,
    //     phankhu: phankhu,
    //   });
    //   const data = res.data;
    //   this.printTicket(loai, data);
    //   this.fetchSoCap();
    // },
    async submitToApi(phankhu, loai) {
      if (!this.fields.so_the && !this.fields.ho_ten) {
        this.pendingPhankhu = phankhu;
        this.pendingLoai = loai;
        this.confirmOpen = true;
        return;
      }

      await this._doSubmit(phankhu, loai);
    },
    async _doSubmit(phankhu, loai) {
      try {
        const res = await axios.post(`/benhnhan`, {
          mathe: this.fields.so_the || "",   // nếu trống -> ""
          hoten: this.fields.ho_ten || "",
          ngaysinh: this.fields.ngay_sinh || "",
          phankhu: phankhu,
        });
        const data = res.data;
        this.printTicket(loai, data);
        this.fetchSoCap();
        this.resetForm();
      } catch (err) {
        console.error("Lỗi gửi bệnh nhân:", err);
      }
    },
    async fetchSoCap() {
      try {
        const res = await axios.get("/sotts");
        const data = res.data;

        this.soCapThuong = data["91"] || 0;
        this.soCapUuTien = data["92"] || 0;
        this.soCapYeuCau = data["93"] || 0;
      } catch (err) {
        console.error("Lỗi load số đã cấp:", err);
      }
    },
    printTicket(loai, benhNhan) {
      const win = window.open("", "_blank", `width=${screen.width},height=${screen.height}`);
      const now = new Date();
      // const date = now.toLocaleDateString("vi-VN");
      const date = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(now);
      const time = now.toLocaleTimeString("vi-VN");

      win.document.write(`
       <html>
          <head>
            <title>Phiếu khám</title>
            <style>
              @page { size: 5cm auto; margin: 0; }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
              }
              .ticket {
                width: 7.8cm;
                padding: 4px;
                font-size: 14px;
                text-align: center;
                border: 1px solid #000;

              }
              .tenphieu{
                font-size: 14px;
              }
              .title {
                margin-top: 4px;
                font-size: 16px;
                font-weight: bold;
              }
              .type {
                font-size: 16px;
                font-weight: bold;
                margin-top: 4px;
              }
              .sott {
                font-size: 30px;
                font-weight: bold;
                margin-top: 4px;
              }
              .hoten {
                margin-top: 4px;
                font-size: 16px;
              }
              .datetime {
                margin-top: 4px;
                font-size: 10px;
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <div class="ticket">
              <div class="tenphieu">PHIẾU ĐĂNG KÝ NHẬN BỆNH</div>
              <div class="title">BỆNH VIỆN ĐA KHOA SA ĐÉC</div>
              <div class="type">${loai.toUpperCase()}</div>

              <!-- STT nổi bật -->
              <div class="sott">${benhNhan.sott || "----"}</div>

              <!-- Họ tên riêng -->
              <div class="hoten">${benhNhan.hoten || "---"}</div>

              <div class="datetime">
                Ngày: ${date} &nbsp;|&nbsp; Lúc: ${time}
              </div>
            </div>
          </body>
        </html>

      `);
      win.document.close();
    },
  },
};
</script>


<style scoped>
.wrap {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
  border: none;
}

.top {
  background: #125ad6;
  color: #fff;
  text-align: center;
  padding: 30px 0;
}

.bottom {
  border-top: 6px solid #41bfa9;
  background: #e7f0f5;
  color: #173468;
  padding-top: 1rem;
  height: 100%;
}

label {
  font-weight: 700;
}

.btn-xxl {
  font-size: 36px;
  font-weight: 500;
  padding: 20px;
  border-radius: 20px;
}

.form1 {
  margin-top: 30px;
}

.btn-dong {
  position: fixed;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.form-check-label {
  font-weight: 500;
  font-size: 30px;
  padding-left: 10px;
}

/* Modal */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  background: #fff;
  padding: 20px 30px;
  border-radius: 10px;
  width: 800px;
  font-size: 30px;
  max-width: 90%;
}

.setting {
  position: absolute;
  bottom: 0;
}

</style>

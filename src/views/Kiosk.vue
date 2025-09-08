<template>
  <div class="wrap">
    <div class="card">
      <div class="top">
        <h3>BỆNH VIỆN ĐA KHOA SA ĐÉC</h3>
        <h4>Số 153, Nguyễn Sinh Sắc, K.Hòa Khánh, Phường Sa Đéc, Tỉnh Đồng Tháp</h4>
      </div>
      <div class="bottom">
        <h1 class="text-center mt-3 mb-5">HỆ THỐNG QUÉT THẺ LẤY SỐ THÔNG MINH</h1>
        <div class="content row">
          <!-- Form bên trái -->
          <div class="col-6 px-5 d-flex flex-column justify-content-between">
            <form @submit.prevent class="form1">
              <!-- Ô input để quét -->
              <div class="form-group mb-2">
                <label class="form-label">Quét thẻ (CCCD/BHYT):</label>
                <input ref="inputScan" v-model="raw" @change="parseData" type="text" class="form-control"
                  placeholder="Đưa thẻ vào máy quét..." />
              </div>

              <!-- Các input 2 cột -->
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
            <div class="btn-dong">
              <h4 @click="resetForm">X</h4>
            </div>
          </div>

          <!-- Bên phải -->
          <div class="col-6 d-flex flex-column justify-content-around px-5 mt-3">
            <!-- Khám thường -->
            <div v-if="showThuong" class="mb-3">
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span class="fw-bold">Đã cấp đến: {{ soCapThuong }}</span>
                <span class="fw-bold">Phục vụ đến: {{ soPhucVuThuong }}</span>
              </div>
              <button class="btn btn-primary btn-xxl w-100" @click="printTicket('Khám thường')">KHÁM THƯỜNG</button>
            </div>

            <!-- Khám ưu tiên -->
            <div v-if="showUuTien" class="mb-3">
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span class="fw-bold">Đã cấp đến: {{ soCapUuTien }}</span>
                <span class="fw-bold">Phục vụ đến: {{ soPhucVuUuTien }}</span>
              </div>
              <button class="btn btn-warning btn-xxl w-100" @click="printTicket('Khám ưu tiên')">KHÁM ƯU TIÊN</button>
            </div>

            <!-- Khám theo yêu cầu -->
            <div v-if="showYeuCau" class="mb-3">
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span class="fw-bold">Đã cấp đến: {{ soCapYeuCau }}</span>
                <span class="fw-bold">Phục vụ đến: {{ soPhucVuYeuCau }}</span>
              </div>
              <button class="btn btn-success btn-xxl w-100" @click="printTicket('Khám theo yêu cầu')">KHÁM THEO YÊU
                CẦU</button>
            </div>
          </div>
        </div>
              <!-- Nút setting -->
      <div class="p-3 settting">
        <button class="btn btn-dark" title="Cấu hình" @click="open = true">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
      </div>

    </div>

    <!-- Modal cấu hình -->
    <div v-if="open" class="modal-mask">
      <div class="modal-container">
        <h4 class="mb-3">Cấu hình hiển thị nút</h4>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="showThuong" id="thuong">
          <label class="form-check-label" for="thuong">Khám thường</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="showUuTien" id="uutien">
          <label class="form-check-label" for="uutien">Khám ưu tiên</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" v-model="showYeuCau" id="yeucau">
          <label class="form-check-label" for="yeucau">Khám theo yêu cầu</label>
        </div>

        <div class="text-end mt-3">
          <button class="btn btn-secondary me-2" @click="open = false">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      soCapThuong: 120,
      soPhucVuThuong: 115,
      soCapUuTien: 40,
      soPhucVuUuTien: 37,
      soCapYeuCau: 15,
      soPhucVuYeuCau: 12,
      showThuong: true,
      showUuTien: true,
      showYeuCau: true,
    };
  },
  watch: {
    showThuong(val) {
      localStorage.setItem("showThuong", val);
    },
    showUuTien(val) {
      localStorage.setItem("showUuTien", val);
    },
    showYeuCau(val) {
      localStorage.setItem("showYeuCau", val);
    },
  },
  mounted() {

    this.$nextTick(() => {
      this.$refs.inputScan?.focus();
    });
    // Lấy trạng thái từ localStorage nếu có
    const thuong = localStorage.getItem("showThuong");
    const uutien = localStorage.getItem("showUuTien");
    const yeucau = localStorage.getItem("showYeuCau");

    if (thuong !== null) this.showThuong = thuong === "true";
    if (uutien !== null) this.showUuTien = uutien === "true";
    if (yeucau !== null) this.showYeuCau = yeucau === "true";
  },
  methods: {
    parseData() {
      const parts = this.raw.split("||");
      if (parts.length < 3) return;

      // Reset trước
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

      // Nếu là CCCD (12 số)
      if (/^\d{12}$/.test(parts[1])) {
        this.fields.so_the = parts[1] || "";
        this.fields.ho_ten = parts[2] || "";
        this.fields.ngay_sinh = parts[3] || "";
        this.fields.gioi_tinh = parts[4] || "";
        this.fields.thuong_tru = parts[5] || "";
      }
      // Nếu là BHYT
      else {
        this.fields.so_the = parts[1] || "";
        this.fields.ho_ten = parts[2] || "";
        this.fields.ngay_sinh = parts[3] || "";
        this.fields.gioi_tinh = parts[4] || "";
        this.fields.han_the = parts[5] || "";
        this.fields.noi_kcb = parts[6] || "";
      }

      // Xoá input raw sau khi quét
      this.raw = "";

      // Focus lại input
      this.$nextTick(() => this.$refs.inputScan?.focus());
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

      this.$nextTick(() => this.$refs.inputScan?.focus()); // reset xong focus lại
    },
    // In phiếu
   printTicket(loai) {
  const win = window.open(
    "",
    "_blank",
    `width=${screen.width},height=${screen.height}`
  );
  const now = new Date();
  const date = now.toLocaleDateString("vi-VN");
  const time = now.toLocaleTimeString("vi-VN");

  win.document.write(`
    <html>
      <head>
        <title>Phiếu khám</title>
        <style>
          @page {
            size: 5cm auto;
            margin: 0;
          }
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
          }
          .ticket {
            width: 5cm;
            padding: 10px;
            font-size: 14px;
            border: 1px soild #000
          }
          .title {
            font-size: 14px;
            font-weight: bold;
          }
          .type {
            font-size: 15px;
            margin: 6px 0;
          }
          .info {
            margin-top: 12px;
          }
          .info div {
            margin: 4px 0;
          }
          .datetime {
            font-size: 10px;
            margin-top: 10px;
            
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="ticket">
          <div class="title">BỆNH VIỆN ĐA KHOA SA ĐÉC</div>
          <div class="type">${loai.toUpperCase()}</div>
          <div class="info">
            <div><b>Họ tên:</b> xxx</div>
            <div><b>STT:</b> xxx</div>
          </div>
          <div class="datetime">
            Ngày: ${date} &nbsp;|&nbsp; Lúc: ${time}
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
}

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
  padding-top: 20px;
  padding-bottom: 15px;
}

.bottom {
  border-top: 6px solid #41bfa9;
  background: #f9f9f6;
  color: #173468;
  padding-top: 1rem;
  height: 100%
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
  width: 400px;
  max-width: 90%;
}
</style>

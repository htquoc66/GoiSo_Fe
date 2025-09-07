<template>
  <div class="wrap">
    <div class="card">
      <div class="top">
        <h1>BỆNH VIỆN ĐA KHOA SA ĐÉC</h1>
        <h4>Số 153, Nguyễn Sinh Sắc, K.Hòa Khánh, Phường Sa Đéc, Tỉnh Đồng Tháp</h4>
      </div>
      <div class="bottom">
        <h1 class="text-center title">HỆ THỐNG QUÉT THẺ LẤY SỐ THÔNG MINH</h1>

        <div class="content row h-100">
          <!-- Form bên trái -->
          <div class="col-6 border p-5 d-flex flex-column justify-content-between">
            <form @submit.prevent class="flex-grow-1">
              <!-- Ô input để quét -->
              <div class="mb-4">
                <label class="form-label big-label">Quét thẻ (CCCD/BHYT):</label>
                <input
                  v-model="raw"
                  @change="parseData"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="Đưa thẻ vào máy quét..."
                />
              </div>

              <!-- STT -->
              <div class="mb-4">
                <label class="form-label big-label">Số thứ tự</label>
                <input v-model="fields.stt" type="text" class="form-control form-control-lg" readonly />
              </div>

              <!-- Các input 2 cột -->
              <div class="row mb-4">
                <div class="col-6">
                  <label class="form-label big-label">Số CCCD/BHYT</label>
                  <input v-model="fields.so_the" type="text" class="form-control form-control-lg" readonly />
                </div>
                <div class="col-6">
                  <label class="form-label big-label">Họ và tên</label>
                  <input v-model="fields.ho_ten" type="text" class="form-control form-control-lg" readonly />
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-6">
                  <label class="form-label big-label">Ngày sinh</label>
                  <input v-model="fields.ngay_sinh" type="text" class="form-control form-control-lg" readonly />
                </div>
                <div class="col-6">
                  <label class="form-label big-label">Giới tính</label>
                  <input v-model="fields.gioi_tinh" type="text" class="form-control form-control-lg" readonly />
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-6">
                  <label class="form-label big-label">Địa chỉ (CCCD)</label>
                  <input v-model="fields.thuong_tru" type="text" class="form-control form-control-lg" readonly />
                </div>
                <div class="col-6">
                  <label class="form-label big-label">Hạn thẻ (BHYT)</label>
                  <input v-model="fields.han_the" type="text" class="form-control form-control-lg" readonly />
                </div>
              </div>

              <div class="row mb-4">
                <div class="col-12">
                  <label class="form-label big-label">Nơi KCB ban đầu (BHYT)</label>
                  <input v-model="fields.noi_kcb" type="text" class="form-control form-control-lg" readonly />
                </div>
              </div>
            </form>

            <!-- Nút đóng -->
            <button class="btn btn-danger btn-lg w-100 mt-3" @click="resetForm">ĐÓNG</button>
          </div>

          <!-- Bên phải -->
          <div class="col-6 d-flex flex-column justify-content-around p-5">
            <!-- Khám thường -->
            <div>
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span>Đã cấp đến: {{ soCapThuong }}</span>
                <span>Phục vụ đến: {{ soPhucVuThuong }}</span>
              </div>
              <button class="btn btn-primary btn-xxl w-100">KHÁM THƯỜNG</button>
            </div>

            <!-- Khám ưu tiên -->
            <div>
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span>Đã cấp đến: {{ soCapUuTien }}</span>
                <span>Phục vụ đến: {{ soPhucVuUuTien }}</span>
              </div>
              <button class="btn btn-success btn-xxl w-100">KHÁM ƯU TIÊN</button>
            </div>

            <!-- Khám theo yêu cầu -->
            <div>
              <div class="d-flex justify-content-between px-2 mb-2 stt-info">
                <span>Đã cấp đến: {{ soCapYeuCau }}</span>
                <span>Phục vụ đến: {{ soPhucVuYeuCau }}</span>
              </div>
              <button class="btn btn-warning btn-xxl w-100">KHÁM THEO YÊU CẦU</button>
            </div>
          </div>
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
      // số thứ tự demo
      soCapThuong: 120,
      soPhucVuThuong: 115,
      soCapUuTien: 40,
      soPhucVuUuTien: 37,
      soCapYeuCau: 15,
      soPhucVuYeuCau: 12,
    };
  },
  methods: {
    parseData() {
      const parts = this.raw.split("||");
      if (parts.length < 3) return;

      this.fields = {
        stt: "001",
        so_the: "",
        ho_ten: "",
        ngay_sinh: "",
        gioi_tinh: "",
        thuong_tru: "",
        han_the: "",
        noi_kcb: "",
      };

      if (/^\d{12}$/.test(parts[1])) {
        this.fields.so_the = parts[1] || "";
        this.fields.ho_ten = parts[2] || "";
        this.fields.ngay_sinh = parts[3] || "";
        this.fields.gioi_tinh = parts[4] || "";
        this.fields.thuong_tru = parts[5] || "";
      } else {
        this.fields.so_the = parts[1] || "";
        this.fields.ho_ten = parts[2] || "";
        this.fields.ngay_sinh = parts[3] || "";
        this.fields.gioi_tinh = parts[4] || "";
        this.fields.han_the = parts[5] || "";
        this.fields.noi_kcb = parts[6] || "";
      }

      this.raw = "";
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
.big-label {
  font-size: 1.8rem;
  font-weight: 600;
}
.top {
  background: #125ad6;
  color: #fff;
  text-align: center;
  padding: 2rem;
}
.top h1 {
  font-size: 2.5rem;
}
.top h4 {
  font-size: 1.2rem;
}
.bottom {
  border-top: 6px solid #41bfa9;
  background: #f9f9f6;
  color: #173468;
  padding-top: 1rem;
  height: calc(100% - 160px);
}
.title {
  font-size: 2.5rem;
  padding: 1rem 0;
}
.btn-xxl {
  font-size: 2rem;
  padding: 2rem;
  border-radius: 20px;
}

.stt-info {
  font-size: 2.2rem; /* 22px */
  font-weight: bold;
}
</style>

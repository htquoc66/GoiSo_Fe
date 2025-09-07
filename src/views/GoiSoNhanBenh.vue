<template>
  <div class="goiso">
    <div class="so-group">
      <div class="so-item"><strong>Quầy {{ quay }}</strong></div>
      <div class="so-item"><strong>Phân khu {{ phankhu }}</strong></div>
      <div v-if="phankhu != 92" class="so-item" :class="{ blinking: blinkThuong }">
        Số thường: <strong v-if="soThuong !== null">{{ soThuong }}</strong>
      </div>
      <div v-if="phankhu == 92" class="so-item" :class="{ blinking: blinkUuTien }">
        Số ưu tiên: <strong v-if="soUuTien !== null">{{ soUuTien }}</strong>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-gray" title="Cấu hình" @click="open = true">
        <span class="material-symbols-outlined">settings</span>
      </button>
      <button class="btn btn-warning" v-if="phankhu == 92" title="Gọi ưu tiên" @click="goiUuTien">
        <span class="material-symbols-outlined">star</span>
      </button>
      <button class="btn btn-blue" v-if="phankhu != 92" title="Gọi thường" @click="goiThuong">
        <span class="material-symbols-outlined">skip_next</span>
      </button>
    </div>

    <!-- Modal cấu hình -->
    <div v-if="open" class="modal-container">
      <div class="modal-overlay" @click="close"></div>
      <div class="modal-content">
        <span class="modal-close" @click="close">&times;</span>
        <h4 class="modal-title">Cấu hình</h4>

        <label>Số quầy:</label>
        <select v-model="quay" class="form-select">
          <option disabled value="">-- Chọn số quầy --</option>
          <option v-for="n in [1, 2, 3, 4, 5, 6, 9]" :key="n" :value="n">
            Quầy {{ n }}
          </option>
        </select>

        <label>Phân khu:</label>
        <select v-model="phankhu" class="form-select">
          <option disabled value="">-- Chọn phân khu --</option>
          <option value="91">Phân khu 91</option>
          <option value="92">Phân khu 92</option>
          <option value="93">Phân khu 93</option>
        </select>


        <div class="modal-buttons">
          <button class="btn btn-red" @click="reset">Reset</button>
          <button class="btn btn-secondary" @click="close">Hủy</button>
          <button class="btn btn-primary" @click="save">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
const LS_KEY = "nhanbenh:config"

export default {
  name: "GoiSoNhanBenh",
  data() {
    return {
      open: false,
      quay: 1,
      phankhu: "",
      soThuong: null,
      soUuTien: null,
      blinkThuong: false,
      blinkUuTien: false,
    }
  },
  mounted() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const { quay, phankhu } = JSON.parse(raw)
        this.quay = quay
        this.phankhu = phankhu
      }
    } catch { }
    this.fetchSo()
    window.addEventListener("keydown", this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.onKey)
  },
  methods: {
    onKey(e) {
      if (this.open && e.key === "Escape") this.close()
    },
    close() {
      this.open = false
    },
    clearSel() {
      this.phankhu = ""
      this.quay = 1
      localStorage.removeItem(LS_KEY)
    },
    save() {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          quay: this.quay,
          phankhu: this.phankhu,
        })
      )
      axios.post(`/nhan-benh/${this.quay}/update-phankhu`, {
        phankhu: this.phankhu,
      })

      this.fetchSo()
      this.close()
    },
    async fetchSo() {
      try {
        const res = await axios.get("/nhan-benh")
        const record = res.data.find((r) => r.quay === this.quay)
        if (record) {
          this.soThuong = record.sott_thuong
          this.soUuTien = record.sott_uutien
        }
      } catch (err) {
        console.error("Lỗi khi lấy số:", err)
      }
    },
    async goiThuong() {
      if (!this.phankhu) return alert("Chưa chọn phân khu!")
      try {
        const res = await axios.post(`/nhan-benh/${this.quay}/goi-thuong`, {
          phankhu: this.phankhu,
        })
        this.soThuong = res.data?.sott_thuong ?? this.soThuong

        // chớp số thường
        this.blinkThuong = true
        setTimeout(() => (this.blinkThuong = false), 5000)

        window.dispatchEvent(
          new CustomEvent("nhanbenh:call", {
            detail: {
              sott: this.soThuong,
              phong: this.phankhu,
              quay: this.quay,
              loai: "thuong",
            },
          })
        )
      } catch (err) {
        console.error("Lỗi gọi số thường:", err)
      }
    },
    async goiUuTien() {
      if (!this.phankhu) return alert("Chưa chọn phân khu!")
      try {
        const res = await axios.post(`/nhan-benh/${this.quay}/goi-uutien`, {
          phankhu: this.phankhu,
        })
        this.soUuTien = res.data?.sott_uutien ?? this.soUuTien

        // chớp số ưu tiên
        this.blinkUuTien = true
        setTimeout(() => (this.blinkUuTien = false), 5000)

        window.dispatchEvent(
          new CustomEvent("nhanbenh:call", {
            detail: {
              sott: this.soUuTien,
              phong: this.phankhu,
              quay: this.quay,
              loai: "uutien",
            },
          })
        )
      } catch (err) {
        console.error("Lỗi gọi số ưu tiên:", err)
      }
    },
    async reset() {
      if (!confirm(`Bạn có chắc muốn reset số cho phân khu ${this.phankhu}?`)) return
      try {
        await axios.post(`/nhan-benh/${this.quay}/reset`)
        this.soThuong = 0
        this.soUuTien = 0

        // ❌ Xóa luôn localStorage
        localStorage.removeItem(LS_KEY)

        // Clear config trên giao diện
        this.quay = 1
        this.phankhu = ""
      } catch (err) {
        console.error("Lỗi reset:", err)
      }
    }

  },
}
</script>

<style scoped>
.goiso {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  z-index: 1000;
}

.so-group {
  text-align: right;
  font-size: 15px;
  color: #333;
  line-height: 1.4;
}

.so-item {
  font-weight: 500;
  font-size: 18px;
}

.btn-group {
  display: flex;
  gap: 6px;
}

.btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s ease;
}

.btn-blue {
  background: #2f63c7;
}

.btn-blue:hover {
  background: #2957b1;
}

.btn-red {
  background: #d32f2f;
}

.btn-red:hover {
  background: #b71c1c;
}

.btn-gray {
  background: #666;
}

.btn-gray:hover {
  background: #444;
}

.btn-secondary,
.btn-primary,
.btn-warning {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background: #ccc;
  color: #000;
}

.btn-primary {
  background: #2f63c7;
  color: #fff;
}

.btn-warning {
  background: #f59e0b;
  color: #fff;
}

.btn-warning:hover {
  background: #d97706;
}

.material-symbols-outlined {
  font-size: 22px;
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
}

/* Modal */
.modal-container {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  inset: 0;
}

.modal-content {
  position: relative;
  background: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 2;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 5px;
  right: 10px;
  cursor: pointer;
  font-size: 24px;
  color: #888;
}

.modal-title {
  font-size: 18px;
  text-align: center;
  margin-bottom: 16px;
}

.form-select,
.form-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  margin: 6px 0;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@keyframes blink {
  50% {
    color: red;
  }
}

.blinking {
  animation: blink 0.5s step-start 10;
}
</style>

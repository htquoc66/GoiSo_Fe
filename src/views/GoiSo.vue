<template>
  <div class="goiso">
    <div class="so-group">
      <div class="so-item"><strong>Phòng khám {{ selectedId }}</strong></div>
      <div class="so-item">Số hiện tại: <strong v-if="soHienTai !== null">{{ soHienTai }}</strong></div>
      <div class="so-item">Số ưu tiên: <strong v-if="soUuTien !== null">{{ soUuTien }}</strong></div>
    </div>

    <div class="btn-group">
      <button class="btn btn-gray" title="Cấu hình" @click="open = true">
        <span class="material-symbols-outlined">settings</span>
      </button>
      <button class="btn btn-red" title="Gọi ưu tiên" @click="goiUuTien">
        <span class="material-symbols-outlined">star</span>
      </button>
      <button class="btn btn-blue" title="Gọi thường" @click="goiTiep">
        <span class="material-symbols-outlined">skip_next</span>
      </button>
    </div>


    <!-- Cấu hình chọn phòng -->
    <div v-if="open" class="modal-container">
      <div class="modal-overlay" @click="close"></div>
      <div class="modal-content">
        <span class="modal-close" @click="close">&times;</span>
        <h4 class="modal-title">Chọn phòng khám</h4>
        <select v-model="selectedId" class="form-select">
          <option disabled value="">-- Chọn phòng --</option>
          <option v-for="id in danhSachPhong" :key="id" :value="id">Phòng {{ id }}</option>
        </select>
        <div class="modal-buttons">
          <button class="btn btn-secondary" @click="clearSel">Hủy</button>
          <button class="btn btn-primary" @click="save">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
const LS_KEY = "phongkham:selected_one"

export default {
  name: "GoiSo",
  data() {
    return {
      open: false,
      selectedId: "",
      soHienTai: null,
      soUuTien: null,
      danhSachPhong: []
    }
  },
  mounted() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      this.selectedId = raw ? String(JSON.parse(raw)) : "1"
    } catch {
      this.selectedId = "1"
    }
    this.fetchSo()
    this.fetchDanhSachPhong()
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
      this.selectedId = ""
    },
    save() {
      if (!this.selectedId) return
      localStorage.setItem(LS_KEY, JSON.stringify(this.selectedId))
      this.fetchSo()
      this.close()
    },
    async fetchDanhSachPhong() {
      try {
        const res = await axios.get("/phong-kham/danh-sach")
        this.danhSachPhong = res.data.map(p => String(p.ma_phong))
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phòng:", err)
      }
    },
    async fetchSo() {
      if (!this.selectedId) return
      try {
        const res = await axios.get(`/phong-kham?ids=${this.selectedId}`)
        const phong = res.data?.[0]
        this.soHienTai = phong?.so_hien_tai ?? null
        this.soUuTien = phong?.so_uu_tien ?? null
      } catch (err) {
        console.error("Lỗi khi lấy số:", err)
      }
    },
    async goiTiep() {
      if (!this.selectedId) return
      try {
        const res = await axios.post(`/phong-kham/${this.selectedId}/goi-so-thuong`)
        this.soHienTai = res.data?.so_hien_tai ?? this.soHienTai
        this.blink(this.selectedId, "thuong")
      } catch (err) {
        console.error("Lỗi khi gọi tiếp:", err)
      }
    },
    async goiUuTien() {
      if (!this.selectedId) return
      try {
        const res = await axios.post(`/phong-kham/${this.selectedId}/goi-uu-tien`)
        this.soUuTien = res.data?.so_uu_tien ?? this.soUuTien
        this.blink(this.selectedId, "uutien")
      } catch (err) {
        console.error("Lỗi khi gọi ưu tiên:", err)
      }
    },
    blink(id, loai = "thuong") {
      window.dispatchEvent(new CustomEvent("phongkham:blink", {
        detail: {
          ids: [id],
          loai: loai
        }
      }))
    }
  }
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
.btn-primary {
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

.form-select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>

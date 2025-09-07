<template>
  <section class="wrap">
    <div class="grid" :class="`cols-${cols}`"
      :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `25% 75%` }">
      <template v-for="(phong, i) in phongList" :key="phong.ma_phong">
        <!-- Header phòng -->
        <div class="cell top text-center" :style="{ gridColumn: i + 1, gridRow: 1 }">
          <h1 class="phong-kham">Phòng {{ phong.ma_phong }}</h1>
        </div>

        <!-- Số gọi -->
        <div class="cell bottom text-center" :style="{ gridColumn: i + 1, gridRow: 2 }"
          :class="{ blinking: blinkingIds.has(String(phong.ma_phong)) }">
          <div class="num-wrap">
            <div v-if="loaiSoMap[phong.ma_phong] === 'uutien'" class="uutien-label">
              <h1>Ưu tiên</h1>
            </div>

            <h1 class="so-goi">
              {{
                loaiSoMap[phong.ma_phong] === 'uutien'
                  ? formatSo(phong.so_uu_tien)
                  : formatSo(phong.so_hien_tai)
              }}
            </h1>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script>
import { useRoute } from "vue-router";
import axios from "axios";

export default {
  name: "PhongKham",
  data() {
    return {
      route: null,
      phongList: [],

      // Blink state
      blinkingIds: new Set(),
      blinkTimeouts: {},

      // Lần cuối đọc được từ server (để phát hiện tăng số)
      lastSoHienTai: {},
      lastSoUuTien: {},

      // Số đang hiển thị (để không bị poll ghi đè khi đang chạy queue)
      displaySoHienTai: {},
      displaySoUuTien: {},

      // Nhớ loại số gần nhất cho từng phòng
      loaiSoMap: {}, // { [ma_phong]: 'thuong' | 'uutien' }

      // Hàng đợi cần blink theo từng phòng
      blinkQueue: {}, // { [ma_phong]: [ {so, loai} , ... ] }
      processing: {}, // { [ma_phong]: boolean }

      // Poll
      polling: null,

      // Thời gian hiển thị mỗi số (ms)
      stepIntervalMs: 5000,
    };
  },

  computed: {
    idList() {
      if (!this.route) return [];
      const raw = String(this.route.params.ids || "");
      return raw.split(",").map(s => s.trim()).filter(Boolean).slice(0, 10);
    },
    cols() {
      return this.idList.length || 1;
    },
  },

  mounted() {
    this.route = useRoute();

    // Jitter  để tránh nhiều thiết bị gọi đồng thời
    // const startDelay = Math.random() * 1000; // 0–1000ms

    // setTimeout(() => {
    //   this.fetchData();
    //   this.polling = setInterval(
    //     this.fetchData,
    //     4000 + Math.floor(Math.random() * 1000) - 500
    //     // 3500ms – 4500ms
    //   );
    // }, startDelay);
    // Jitter để tránh nhiều thiết bị gọi đồng thời
    const startDelay = Math.random() * 1000; // 0–1000ms

    setTimeout(() => {
      const poll = () => {
        this.fetchData();

        const base = 4000;
        const jitter = (Math.random() - 0.5) * 1000; // -500ms đến +500ms
        const nextDelay = base + jitter;

        setTimeout(poll, nextDelay);
      };

      poll();
    }, startDelay);


    // Sự kiện từ máy gọi
    window.addEventListener("phongkham:blink", this.handleBlinkEvent);
    window.addEventListener("phongkham:refresh", this.fetchData);
  },

  beforeUnmount() {
    clearInterval(this.polling);
    window.removeEventListener("phongkham:blink", this.handleBlinkEvent);
    window.removeEventListener("phongkham:refresh", this.fetchData);
    Object.values(this.blinkTimeouts).forEach(tid => clearTimeout(tid));
  },

  methods: {
    // Hiển thị 3 chữ số: 4 -> 004, 11 -> 011
    formatSo(num) {
      const n = Number(num) || 0;
      return String(n).padStart(3, "0");
    },

    // --- Poll dữ liệu ---
    async fetchData() {
      if (!this.idList.length) return;
      try {
        const res = await axios.get("/phong-kham", {
          params: { ids: this.idList.join(",") },
        });
        const newList = Array.isArray(res.data) ? res.data : [];

        // Phát hiện tăng số -> đẩy vào queue
        newList.forEach(p => {
          const id = String(p.ma_phong);

          // Số thường
          const newSo = Number(p.so_hien_tai) || 0;
          const oldSo = this.lastSoHienTai[id];
          if (oldSo !== undefined && newSo > oldSo) {
            this.enqueueRange(id, oldSo + 1, newSo, "thuong");
            this.processQueue(id);
          }
          this.lastSoHienTai[id] = newSo;

          // Số ưu tiên
          const newUu = Number(p.so_uu_tien) || 0;
          const oldUu = this.lastSoUuTien[id];
          if (oldUu !== undefined && newUu > oldUu) {
            this.enqueueRange(id, oldUu + 1, newUu, "uutien");
            this.processQueue(id);
          }
          this.lastSoUuTien[id] = newUu;
        });

        // Cập nhật danh sách hiển thị
        this.phongList = newList.map(p => {
          const id = String(p.ma_phong);
          // Nếu đang xử lý queue cho phòng này -> giữ số đang hiển thị (không để poll ghi đè)
          if (this.processing[id]) {
            return {
              ...p,
              so_hien_tai:
                this.displaySoHienTai[id] ?? Number(p.so_hien_tai) ?? 0,
              so_uu_tien:
                this.displaySoUuTien[id] ?? Number(p.so_uu_tien) ?? 0,
            };
          }
          return p;
        });
      } catch (err) {
        console.error("Lỗi fetch phòng khám:", err);
      }
    },

    // Thêm dãy số vào queue
    enqueueRange(id, from, to, loai) {
      if (!this.blinkQueue[id]) this.blinkQueue[id] = [];
      for (let s = from; s <= to; s++) {
        this.blinkQueue[id].push({ so: s, loai });
      }
    },

    // Xử lý queue theo từng phòng
    processQueue(id) {
      if (this.processing[id]) return; // đang chạy thì thôi

      const step = () => {
        const item = this.blinkQueue[id]?.shift();
        if (!item) {
          this.processing[id] = false;
          return;
        }

        // Ghi số vào phongList để hiển thị + lưu display map
        const phong = this.phongList.find(p => String(p.ma_phong) === id);
        if (phong) {
          if (item.loai === "thuong") {
            phong.so_hien_tai = item.so;
            this.displaySoHienTai[id] = item.so;
          } else {
            phong.so_uu_tien = item.so;
            this.displaySoUuTien[id] = item.so;
          }
          this.loaiSoMap[id] = item.loai;
          this.startBlink([id], item.loai);
        }

        // Đợi X giây rồi qua số tiếp theo
        setTimeout(step, this.stepIntervalMs);
      };

      this.processing[id] = true;
      step();
    },

    // Nhận sự kiện blink từ máy gọi (vẫn hỗ trợ)
    handleBlinkEvent(e) {
      const d = e?.detail || {};
      let ids = [];
      if (Array.isArray(d.ids)) ids = d.ids;
      else if (d.id != null) ids = [d.id];
      const loai = d.loai ?? "thuong";
      // Không thay đổi số khi nhận event này; chỉ blink theo loại
      this.startBlink(ids.map(String), loai);
    },

    // Blink nền từng phòng
    startBlink(ids, loai = "thuong") {
      ids.forEach(id => {
        this.blinkingIds.add(id);
        this.loaiSoMap[id] = loai;
        if (this.blinkTimeouts[id]) clearTimeout(this.blinkTimeouts[id]);
        this.blinkTimeouts[id] = setTimeout(() => {
          this.blinkingIds.delete(id);
          delete this.blinkTimeouts[id];
          this.$forceUpdate();
        }, this.stepIntervalMs); // blink đúng bằng thời gian dừng mỗi số
      });
      this.$forceUpdate();
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

.grid {
  display: grid;
  width: 99%;
  height: 98%;
  border-radius: 40px;
  overflow: hidden;
  border: 1px solid #999;
  /* box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px; */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 7px 13px rgba(0, 0, 0, 0.2),
    0 0 6px rgba(0, 0, 0, 0.15) inset;

}

.cell {
  border-right: 6px solid #41bfa9;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

/* Header */
.top {
  background: #125ad6;
  color: #fff;
  font-size: 20px;
  font-weight: bold;

}

.phong-kham {
  font-size: 160px;
  font-weight: 800;
  margin: 0.6em 0;
}


.bottom {
  border-top: 6px solid #41bfa9;
  background: #f9f9f6;
  color: #173468;
  padding-top: 20px;

}

/* Bỏ border phải cột cuối (2 ô cuối: top+bottom) */
.grid .cell:nth-last-child(-n + 2) {
  border-right: none !important;
}


.num-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}


.uutien-label {
  position: absolute;
  top: 6%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  font-size: 200px;
  line-height: 1;
  margin: 0;

}

.so-goi {
  font-size: 400px;
  font-weight: 800;
  line-height: 1;
  margin: 0;
  padding-top: 30px;
}

/* Khi 3 cột: thu nhỏ như yêu cầu */
.grid.cols-3 .so-goi {
  font-size: 320px;
  line-height: 1;
}

.grid.cols-3 .uutien-label {
  font-size: 160px;
  line-height: 1;
}

.grid.cols-3 .phong-kham {
  font-size: 130px;
  font-weight: 800;
  margin: 0.6em 0;
}

@keyframes blinkbg {

  0%,
  100% {
    background-color: #FFD600;
    /* background-color: #f708f7; */

  }

  50% {
    background-color: #ffffff;
  }
}


.blinking {
  animation: blinkbg 2s steps(2, start) infinite;
}
</style>

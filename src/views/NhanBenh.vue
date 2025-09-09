<template>
  <div class="container-fluid fullvh">
    <div class="row h-100">
      <div class="col-6 d-flex flex-column" v-for="card in list" :key="card.quay">
        <div class="card flex-fill">
          <div class="top">
            <h1 class="title">Quầy {{ card.quay }}</h1>
          </div>
          <div class="bottom" :class="{ blinking: blinkingIds.has(String(card.quay)) }">
            <div class="sott">
              <span v-if="card.loai === 'uutien'">Ưu tiên - </span>
              Số: {{ formatSo(card.sott) }}
            </div>
            <div v-if="card.hoten" class="benhnhan">
              {{ card.hoten }} - {{ card.namsinh }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "NhanBenh",
  data() {
    return {
      list: Array.from({ length: 6 }).map((_, i) => ({
        quay: i + 1,
        sott: 0,
        phankhu: "",
        loai: "",
        hoten: "",
        namsinh: "",
        queue: []
      })),
      processing: {},
      blinkingIds: new Set(),
      blinkTimeouts: {},
      stepIntervalMs: 5000,
      polling: null,
      lastLogId: 0,
      voiceQueue: [],    // hàng đợi câu đọc
      speaking: false    // trạng thái đang đọc
    }
  },
  mounted() {
    this.fetchInitial()
    this.fetchData()
    // this.polling = setInterval(this.fetchData, 3000)
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

  },
  beforeUnmount() {
    clearInterval(this.polling)
    Object.values(this.blinkTimeouts).forEach(tid => clearTimeout(tid))
  },
  methods: {
    formatSo(n) {
      return String(n || "").padStart(3, "0")
    },

    // ✅ Hàng đợi đọc loa
    enqueueSpeak(text) {
      this.voiceQueue.push(text)
      if (!this.speaking) {
        this.processVoiceQueue()
      }
    },
    processVoiceQueue() {
      if (this.voiceQueue.length === 0) {
        this.speaking = false
        return
      }
      this.speaking = true

      const text = this.voiceQueue.shift()
      const audio = new Audio("/sounds/ring.mp3")
      audio.play().then(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "vi-VN"
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 1
        utterance.onend = () => {
          this.processVoiceQueue()
        }
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      }).catch(err => {
        console.error("Không phát được ting:", err)
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "vi-VN"
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
      })
    },

    // 🔹 Lấy số hiện tại khi F5
    async fetchInitial() {
      try {
        const res = await axios.get("/nhan-benh")
        const data = Array.isArray(res.data) ? res.data : []
        data.forEach(item => {
          const card = this.list.find(c => c.quay === Number(item.quay))
          if (card) {
            card.sott = Math.max(item.sott_thuong, item.sott_uutien)
            card.phankhu = item.phankhu
          }
        })
      } catch (err) {
        console.error("Lỗi fetchInitial:", err)
      }
    },

    // 🔹 Lấy log mới
    async fetchData() {
      try {
        const res = await axios.get("/nhan-benh-logs")
        const data = Array.isArray(res.data) ? res.data : []
        const newLogs = data.filter(l => l.id > this.lastLogId)
        if (newLogs.length === 0) return

        newLogs.sort((a, b) => a.id - b.id)
        newLogs.forEach(log => {
          const card = this.list.find(c => c.quay === Number(log.quay))
          if (!card) return
          card.queue.push({
            id: log.id,
            sott: log.so,
            phankhu: log.phankhu,
            loai: log.loai
          })
          this.processQueue(card)
          this.lastLogId = log.id
        })
      } catch (err) {
        console.error("Lỗi fetchData:", err)
      }
    },

    // 🔹 Xử lý queue
    processQueue(card) {
      if (this.processing[card.quay]) return
      this.processing[card.quay] = true

      const step = async () => {
        const item = card.queue.shift()
        if (!item) {
          this.processing[card.quay] = false
          return
        }

        try {
          await axios.delete(`/nhan-benh-logs/${item.id}`)
        } catch (err) {
          console.error("Xoá log lỗi:", err)
        }

        card.sott = item.sott
        card.phankhu = item.phankhu
        card.loai = item.loai

        // 🔹 Gọi API lấy thông tin bệnh nhân
        // try {
        //   const res = await axios.post("http://172.16.100.10:3000/api/benhnhan", {
        //     sott: Number(item.sott),
        //     phankhu: Number(item.phankhu)
        //   })
        //   card.hoten = res.data.hoten || ""
        //   card.namsinh = res.data.ngaysinh
        //     ? String(res.data.ngaysinh).slice(0, 4)
        //     : ""
        // } catch (err) {
        //   console.error("Lỗi lấy thông tin bệnh nhân:", err)
        //   card.hoten = ""
        //   card.namsinh = ""
        // }

        if (item.loai === "uutien") {
          this.enqueueSpeak(`Mời bệnh nhân ưu tiên số ${item.sott} vào quầy số ${card.quay}`)
        } else {
          this.enqueueSpeak(`Mời bệnh nhân số ${item.sott} vào quầy số ${card.quay}`)
        }

        this.startBlink(card.quay, () => {
          step()
        })
      }

      step()
    },

    // 🔹 Blink số
    startBlink(quay, done) {
      const id = String(quay)
      this.blinkingIds.add(id)

      if (this.blinkTimeouts[id]) clearTimeout(this.blinkTimeouts[id])

      this.blinkTimeouts[id] = setTimeout(() => {
        this.blinkingIds.delete(id)
        delete this.blinkTimeouts[id]
        this.$forceUpdate()
        if (done) done()
      }, this.stepIntervalMs)

      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
/* ==== Layout tổng ==== */
.fullvh {
  height: 100vh;
  width: 100vw;
  padding: 0 16px;
  margin: 0;
  overflow: hidden; /* chặn scroll */
  --rows: 3;        /* số hàng (6 ô = 2 cột x 3 hàng) */
  --gap: 10px;      /* khoảng cách dọc giữa các hàng (ảo, do margin thẻ .card) */
}

/* Mỗi cột chiếm nửa màn hình (Bootstrap col-6) và có chiều cao bằng nhau */
.col-6 {
  padding: 0; /* bỏ gutter để viền khớp đẹp */
}

/* Dùng d-flex trên col để .card cao 100% */
.col-6.d-flex {
  /* Tính chiều cao từng ô: (100vh - tổng khoảng trống do margin) / số hàng */
  /* Mỗi .card có margin: 5px => trên + dưới = 10px/ô. 3 hàng => ~20px-30px tùy lề biên.
     Chọn trừ 24px cho an toàn hiển thị mọi trình duyệt. */
  min-height: calc((100vh - 24px) / var(--rows));
}

/* ==== Thẻ card ==== */
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 5px;               /* tạo khoảng cách giữa các ô */
  border-radius: 15px;
  overflow: hidden;          /* đảm bảo bo góc cho phần con */
  background: #fff;
  box-shadow: rgba(0,0,0,0.08) 0 2px 6px;
}

/* ==== Header (top) ==== */
.top {
  background: #125ad6;
  color: #fff;
  text-align: center;
  padding: 5px 8px;
}

.title {
  font-size: 3vw;
  margin: 0;
  padding: 10px 0;
  font-weight: 800;
  line-height: 1.1;
}

/* ==== Thân (bottom) ==== */
.bottom {
  border-top: 6px solid #41bfa9;
  background: #f9f9f6;
  color: #173468;
  flex: 1;                         /* chiếm hết phần còn lại để các card bằng nhau */
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  font-size: 2vw;
}

.sott {
  font-size: 3.5vw;
  font-weight: 800;
  line-height: 1.1;
}

/* Tên bệnh nhân – tránh đẩy cao ô */
.benhnhan {
  font-size: 3vw;
  font-weight: 600;
  margin-top: 6px;
  line-height: 1.3;
  white-space: nowrap;        /* 1 dòng */
  overflow: hidden;
  text-overflow: ellipsis;    /* hiển thị ... nếu dài */
}

/* ==== Hiệu ứng chớp ==== */
@keyframes blinkbg {
  0%, 100% {
    background: #FFD600;
    color: #000;
  }
  50% {
    background: #f9f9f6;
    color: #173468;
  }
}
.bottom.blinking {
  animation: blinkbg 1s steps(2, start) infinite;
}


</style>

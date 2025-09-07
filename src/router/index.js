import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/phongkham/:ids",
    name: "phongkham",
    component: () => import("../views/PhongKham.vue"),
  },
  {
    path: "/goiso",
    name: "goiso",
    component: () => import("../views/GoiSo.vue"),
  },
    {
    path: "/goisonb",
    name: "goisonb",
    component: () => import("../views/GoiSoNhanBenh.vue"),
  },
  {
    path: "/kiosk",
    name: "kiosk",
    component: () => import("../views/Kiosk.vue"),
  },
    {
    path: "/nhanbenh",
    name: "nhanbenh",
    component: () => import("../views/NhanBenh.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import RegisterUser from "../views/RegisterUsers.vue";

const routes = [
  {
    path: "/register",
    name: "RegisterUser",
    component: RegisterUser,
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;

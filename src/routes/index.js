import { createRouter, createWebHistory } from "vue-router";
import RegisterUser from "../views/RegisterUsers.vue";
import LoginUser from "../views/LoginUsers.vue";

const routes = [
  {
    path: "/register",
    name: "RegisterUser",
    component: RegisterUser,
  },
  {
    path: "/login",
    name: "LoginUsers",
    component: LoginUser,
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;

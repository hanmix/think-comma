import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import HomePage from "@/components/HomePage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomePage,
    meta: { stackId: "main", isRoot: true },
  },
  {
    path: "/chat",
    name: "chat",
    component: () => import("@/views/ChatDemo.vue"),
    meta: { stackId: "main" },
  },
  {
    path: "/example",
    name: "example",
    component: () => import("@/views/ExamplePage.vue"),
    meta: { stackId: "main" },
  },
  {
    path: "/flow",
    name: "flow",
    component: () => import("@/views/ThinkingFlow.vue"),
    meta: { stackId: "main" },
  },
  {
    path: "/design",
    name: "design",
    component: () => import("@/views/DesignSystem.vue"),
    meta: { stackId: "main" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;

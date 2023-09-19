const routes = [
  {
    path: "/",
    component: () => import("src/layouts/AuthenticatedLayout.vue"),
    children: [
      { path: "cuotas", component: () => import("pages/paymentCuotas.vue") },
      { path: "parents", component: () => import("pages/parentsView.vue") },
      { path: "houseHold", component: () => import("pages/houseHoldView.vue") },
      // { path: "owed", component: () => import("pages/houseHoldOwed.vue") },
      { path: "students", component: () => import("pages/indexPage.vue") },
      { path: "reportcaja", component: () => import("pages/reportCaja.vue") }
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

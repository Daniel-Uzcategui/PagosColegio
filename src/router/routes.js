const routes = [
  {
    path: "/",
    component: () => import("src/layouts/AuthenticatedLayout.vue"),
    children: [
      { path: "cuotas", component: () => import("pages/paymentCuotas.vue") },
      // { path: "parents", component: () => import("pages/parentsView.vue") },
      // { path: "houseHold", component: () => import("pages/houseHoldView.vue") },
      // { path: "owed", component: () => import("pages/houseHoldOwed.vue") },
      //add logs path
      //users management tab
      { path: "users", component: () => import("pages/usersView.vue") },
      { path: "logs", component: () => import("pages/logsHistory.vue") },
      { path: "students",name: 'Students', component: () => import("pages/IndexPage.vue") },
      { path: "login", component: () => import("pages/LoginPage.vue") },
      // add license path
      { path: "license", component: () => import("pages/LicensePage.vue") },
      { path: "reportcaja", component: () => import("pages/reportCaja.vue") },
      { 
        path: "receiptpage", 
        name: 'ReceiptTemplate', 
        component: () => import("pages/receiptTemplate.vue"),
      },
      { path: "reportpayments", component: () => import("pages/reportPayments.vue") }
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

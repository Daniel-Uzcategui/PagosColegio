const routes = [
  {
    path: "/",
    component: () => import("src/layouts/MainLayout.vue"),
    children: [
      {
        path: "myboard",
        component: () => import("pages/myBoard.vue"),
        props: (route) => ({
          project: route.query.p,
          user: route.query.u,
          invite: route.query.i,
        }),
      },
      { path: "cuotas", component: () => import("pages/paymentCuotas.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

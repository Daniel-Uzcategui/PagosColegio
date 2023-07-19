const routes = [
  {
    path: "/",
    component: () => import("src/layouts/boardLayout.vue"),
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
      { path: "bubble", component: () => import("pages/bubbleChart.vue") },
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

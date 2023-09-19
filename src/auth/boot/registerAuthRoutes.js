import { boot } from "quasar/wrappers";

export default boot(({ router }) => {
  router.addRoute({
    path: "/",
    component: () => import("src/auth/layouts/layoutAuths.vue"),
    children: [
      {
        path: "login",
        name: "auth.login",
        component: () => import("src/auth/pages/IdentityPasswordLoginPage.vue"),
        meta: { title: "Login", unauthOnly: true },
        props: (route) => ({
          project: route.query.p,
          user: route.query.u,
          invite: route.query.i,
        }),
      },
      {
        path: "loginemail",
        name: "loginemail",
        component: () => import("src/auth/pages/loginEmail.vue"),
        meta: { title: "Login", unauthOnly: true },
      },
      {
        name: "auth.requestPasswordReset",
        path: "/forgot-password",

        meta: { title: "Password Reset", unauthOnly: true },
        component: () =>
          import("src/auth/pages/PasswordResetRequestViaEmailPage.vue"),
      },
      {
        name: "auth.resetPassword",
        path: "/password-reset",
        meta: { unauthOnly: true },
        component: () => import("src/auth/pages/PasswordResetViaEmailPage.vue"),
      },
      {
        name: "auth.register",
        path: "/register",

        meta: { title: "Register", unauthOnly: true },
        component: () =>
          import("src/auth/pages/IdentityPasswordRegisterPage.vue"),
      },
    ],
  });
  router.addRoute("/", {
    path: "",
    component: () => import("src/layouts/AuthenticatedLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/indexPage.vue"),
        name: "dashboard",
        meta: { authOnly: true },
      },
    ],
  });
});

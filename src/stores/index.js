import { store } from "quasar/wrappers";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */
// import Cookies from "js-cookie";
export default store((/* { ssrContext } */) => {
  const pinia = createPinia();
  pinia
  .use(
    createPersistedState()
  );
  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)

  return pinia;
});

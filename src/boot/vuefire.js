import { boot } from "quasar/wrappers";
import { VueFire, VueFireAuth } from "vuefire";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "app/config/firebase";
export const firebaseApp = initializeApp(firebaseConfig.credentials);
export const db = getFirestore();
const serialize = (doc) => {
  return Object.defineProperty(
    { ...doc.data() },
    'id',
    {
      value: doc.id,
      enumerable: true,
    }
  )
}
export default boot(({ app }) => {
  app.use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [
      // we will see other modules later on
      VueFireAuth(),
    ],
    serialize,
  });
});

import { boot } from "quasar/wrappers";
import { VueFire, VueFireAuth } from "vuefire";
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator  } from "firebase/firestore";
import firebaseConfig from "app/config/firebase";
import { getFunctions, connectFunctionsEmulator  } from "firebase/functions";
export const firebaseApp = initializeApp(firebaseConfig.credentials);
export const db = getFirestore();
connectFirestoreEmulator(db, '127.0.0.1', 8080);
export const functions = getFunctions(firebaseApp)
connectFunctionsEmulator (functions,"127.0.0.1", 5001)
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

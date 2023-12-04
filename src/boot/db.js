// import { boot } from "quasar/wrappers";
// import { MongoClient } from 'mongodb';
// const MONGO_USERNAME = 'admin';
// const MONGO_PASSWORD = 'admin';
// const MONGO_HOSTNAME = '127.0.0.1';
// const MONGO_PORT = '27017';
// const MONGO_DB = 'PagosColegio';
// const AUTH_SOURCE = 'admin'; 

// const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=${AUTH_SOURCE}`;
// const client = new MongoClient(url);

// export default boot({ app }) => {
//   await client.connect();
//   app.config.globalProperties.$mongoClient = client;
// };

// export { client };
// export default boot(({ app }) => {
//     app.use(VueFire, {
//       // imported above but could also just be created here
//       firebaseApp,
//       modules: [
//         // we will see other modules later on
//         VueFireAuth(),
//       ],
//       serialize,
//     });
//   });
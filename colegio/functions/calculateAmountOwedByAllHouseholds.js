import axios from "axios";
import { onCall } from "../intialize.js";
import cheerio from "cheerio";
// export const updateStudentByDiscount = onCall(async (data, context) => {
//   const {studentId, startDate, Discount} = data;
//   if (!Number.isFinite(Discount)) {
//     // eslint-disable-next-line no-throw-literal
//     throw {Message: "Invalid Discount"};
//   }
//   const db = admin.firestore();
//   const cuotasRef = db.collection(`students/${studentId}/cuota_payments`);

//   // Query the cuotas with a Periodo.from date greater than or equal to the start date
//   // Query the cuotas with a Periodo.from date greater than or equal to the start date
//   // and order the results by the Periodo.from field
//   const cuotasSnap = await cuotasRef.where("Periodo.from", ">=", startDate).orderBy("Periodo.from").get();
//   const cuotasData = cuotasSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}));

//   // Update the cuota amount and recalculate the remaining amount due for each cuota
//   for (let i = 0; i < cuotasData.length; i++) {
//     const cuotaData = cuotasData[i];
//     const cuotaRef = cuotasRef.doc(cuotaData.id);
//     const cuotaWithDiscount = Discount * cuotaData.cuotaDefault.Monto;
//     await cuotaRef.update({Monto: cuotaWithDiscount});
//     const totalPaid = cuotaData.TotalPaid || 0;
//     let remainingAmountDue = cuotaWithDiscount - totalPaid;

//     // Check if the remaining amount due is negative
//     if (remainingAmountDue < 0) {
//     // Apply the excess payment to the next cuota
//       if (i < cuotasData.length - 1) {
//         const nextCuotaData = cuotasData[i + 1];
//         const nextCuotaRef = db.collection(`students/${studentId}/cuota_payments`).doc(nextCuotaData.id);
//         const nextTotalPaid = nextCuotaData.TotalPaid || 0;
//         const nextRemainingAmountDue = nextCuotaData.Monto - (nextTotalPaid + Math.abs(remainingAmountDue));
//         await nextCuotaRef.update({TotalPaid: nextTotalPaid + Math.abs(remainingAmountDue), RemainingAmountDue: nextRemainingAmountDue});
//         remainingAmountDue = 0;
//       }
//     }

//     await cuotaRef.update({RemainingAmountDue: remainingAmountDue});
//   }
// });
// export const calcamount = onRequest (
//     async (req, res) => {
//       console.log("Starting the call");
//       // Calculate the amount owed by each household
//       let totalAmountOwed = 0;
//       const today = new Date();
//       // Read all cuota payments
//       const cuotasRef = admin
//           .firestore()
//           .collectionGroup("cuota_payments")
//           .where("RemainingAmountDue", ">", 0);
//       // Process the data in memory
//       const houseHoldAmountsOwed = {};
//       let lastDoc;
//       let hasMoreData = true;
//       while (hasMoreData) {
//         let cuotasSnapshot;
//         if (lastDoc) {
//           cuotasSnapshot = await cuotasRef.startAfter(lastDoc).limit(500).get();
//         } else {
//           cuotasSnapshot = await cuotasRef.limit(500).get();
//         }
//         if (cuotasSnapshot.empty) {
//           hasMoreData = false;
//         } else {
//           lastDoc = cuotasSnapshot.docs[cuotasSnapshot.docs.length - 1];
//           for (const cuotaDoc of cuotasSnapshot.docs) {
//             const cuotaData = cuotaDoc.data();
//             if (today > cuotaData.Periodo.from.toDate()) {
//               const houseHoldId = cuotaData.houseHold;
//               houseHoldAmountsOwed[houseHoldId] =
//               (houseHoldAmountsOwed[houseHoldId] || 0) + cuotaData.RemainingAmountDue;
//             }
//           }
//         }
//       }
//       // Split the households into batches of 500
//       const batchSize = 500;
//       const houseHoldBatches = [];
//       for (let i = 0; i < Object.keys(houseHoldAmountsOwed).length; i += batchSize) {
//         houseHoldBatches.push(Object.keys(houseHoldAmountsOwed).slice(i, i + batchSize));
//       }
//       // Batch update the household documents in multiple writes
//       for (const houseHoldBatch of houseHoldBatches) {
//         const batch = admin.firestore().batch();
//         for (const houseHoldId of houseHoldBatch) {
//           if (houseHoldAmountsOwed[houseHoldId]) {
//             const amountOwed = houseHoldAmountsOwed[houseHoldId];
//             const houseHoldRef = admin
//                 .firestore()
//                 .doc(`houseHolds/${houseHoldId}`);
//             batch.set(houseHoldRef, {amountOwed}, {merge: true});
//             totalAmountOwed += amountOwed;
//           }
//         }
//         await batch.commit();
//       }
//       // Update the total amount owed in the school/accounting document
//       await admin
//           .firestore()
//           .doc("school/accounting")
//           .set({totalAmountOwed, lastUpdate: new Date()}, {merge: true});
//       // Return the calculated total amount owed
//      return res.send({totalAmountOwed});
//     },
// );
export const getBCV = onCall(
    async (data, context) => {
      const response = await axios.get("https://www.bcv.org.ve/");
      const cheer = cheerio.load(response.data);
      const rateValue = parseFloat(cheer("#dolar > div > div > div.col-sm-6.col-xs-6.centrado > strong").text().replace(",", "."));
      return rateValue;
    // return response.data
    },
);

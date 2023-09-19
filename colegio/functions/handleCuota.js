/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
import {admin, onDocumentWritten} from "../intialize.js";

export const handleCuota = onDocumentWritten(
    "cuotas/{cuotaId}",
    async (event) => {
      // Get the cuota data
      const cuotaData = event.data.after.data() || event.data.before.data();
      // Handle the different operation types
      if (!event.data.before.exists) {
        // Create operation
        // Query for all students whose TipoCuota matches the cuota's Tipo
        const studentsSnapshot = await admin
            .firestore()
            .collection("students")
            .where("Grado", "<=", 14)
            .get();
        let batch = admin.firestore().batch();
        let count = 0;
        for (const studentDoc of studentsSnapshot.docs) {
          const cuotaRef = admin.firestore().collection(`students/${studentDoc.id}/cuota_payments`).doc();
          const student = studentDoc.data();
          const cuotaDiscount = student.Discount || 1;
          const newAmount = cuotaDiscount * cuotaData.Monto;
          batch.set(cuotaRef, {...cuotaData, cuotaDefault: cuotaData, Monto: newAmount, Discount: cuotaDiscount, RemainingAmountDue: newAmount, cuotaId: event.params.cuotaId, houseHold: student.houseHold, studentId: studentDoc.id});
          count++;
          if (count === 500) {
            await batch.commit();
            batch = admin.firestore().batch();
            count = 0;
          }
        }
        if (count > 0) {
          await batch.commit();
        }
      } else if (event.data.before.exists && event.data.after.exists) {
        // Updating existing document : Do something
        return;
      } else if (!event.data.after.exists) {
        // Delete operation
        const cuotasGroup = await admin
            .firestore()
            .collectionGroup("cuota_payments")
            .where("cuotaId", "==", event.params.cuotaId).get();

        let batch = admin.firestore().batch();
        let count = 0;
        for (const cuotasDocRef of cuotasGroup.docs) {
          batch.delete(cuotasDocRef.ref);
          count++;
          if (count === 500) {
            await batch.commit();
            batch = admin.firestore().batch();
            count = 0;
          }
        }
        if (count > 0) {
          await batch.commit();
        }
      }
    },
);
export const handlePayment = onDocumentWritten(
    "students/{studentId}/cuota_payments/{cuotaId}",
    async (event) => {
      // Get the cuota data
      const cuotaDataAfter = event.data.after.data();
      const cuotaDataBefore = event.data.before.data();
      let RemainingAmountDue = 0;
      if (cuotaDataBefore && cuotaDataBefore.RemainingAmountDue) {
        RemainingAmountDue = cuotaDataBefore.RemainingAmountDue;
      }
      if (cuotaDataAfter.RemainingAmountDue === RemainingAmountDue) {
        return;
      }
      const houseHoldId = cuotaDataAfter.houseHold;
      // Handle the different operation types
      return updateHouseHoldById(houseHoldId);
    },
);
async function updateHouseHoldById(houseHoldId) {
  // const houseHoldData = houseHoldDoc.data();
  let amountOwed = 0;
  const studentsSnapshot = await admin
      .firestore()
      .collection(`/students`).where("houseHold", "==", houseHoldId)
      .get();
  for (const studentDoc of studentsSnapshot.docs) {
    const cuotasSnapshot = await admin
        .firestore()
        .collection(`students/${studentDoc.id}/cuota_payments`)
        .where("RemainingAmountDue", ">", 0)
        .get();
    for (const cuotaDoc of cuotasSnapshot.docs) {
      const cuotaData = cuotaDoc.data();
      if (cuotaData.Periodo.from.toDate() <= new Date()) {
        amountOwed += cuotaData.RemainingAmountDue;
      }
    }
  }

  // Update the amount owed in the household's document
  await admin
      .firestore()
      .doc(`houseHolds/${houseHoldId}`)
      .update({amountOwed});
}

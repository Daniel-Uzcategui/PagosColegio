/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
import {admin, onDocumentCreated, onDocumentUpdated} from "../intialize.js";
export const handleNewDiscount = onDocumentUpdated(
    "students/{studentId}",
    async (event) => {
    // Get the cuota data
      const studentDataAfter = event.data.after.data();
      const studentDataBefore = event.data.before.data();
      if (studentDataAfter.Discount === studentDataBefore.Discount) {
        return;
      }
      const Discount = studentDataAfter.Discount;
      const studentId = event.params.studentId;
      const startDate = studentDataAfter.newAmountStartDate;
      if (!Number.isFinite(Discount)) {
        // eslint-disable-next-line no-throw-literal
        throw {Message: "Invalid Discount"};
      }
      if (!startDate) {
        // eslint-disable-next-line no-throw-literal
        throw {Message: "Invalid Start Date"};
      }
      const db = admin.firestore();
      const cuotasRef = db.collection(`students/${studentId}/cuota_payments`);
      // Query the cuotas with a Periodo.from date greater than or equal to the start date
      // and order the results by the Periodo.from field
      const cuotasSnap = await cuotasRef.where("Periodo.from", ">=", startDate).orderBy("Periodo.from").get();
      if (cuotasSnap.empty) {
        return;
      }
      const cuotasData = cuotasSnap.docs.map((doc) => ({id: doc._id, ...doc.data()}));
      // Calculate the total amount paid across all cuotas
      let totalPaid = 0;
      for (const cuotaData of cuotasData) {
        totalPaid += cuotaData.TotalPaid || 0;
      }

      // Redistribute the total amount paid across all cuotas
      for (let i = 0; i < cuotasData.length; i++) {
        const cuotaData = cuotasData[i];
        const cuotaRef = cuotasRef.doc(cuotaData._id);
        const cuotaWithDiscount = Discount * cuotaData.cuotaDefault.Monto;
        await cuotaRef.update({Monto: cuotaWithDiscount});
        let remainingAmountDue = cuotaWithDiscount - totalPaid;

        // Check if the remaining amount due is negative
        if (remainingAmountDue < 0) {
          // Apply the excess payment to the next cuota
          totalPaid = Math.abs(remainingAmountDue);
          remainingAmountDue = 0;
        } else {
          totalPaid = 0;
        }

        await cuotaRef.update({RemainingAmountDue: remainingAmountDue});
      }
    });

export const handleStudent = onDocumentCreated(
    "students/{studentId}",
    async (event) => {
    // Check if there is data associated with the event
      const snapshot = event.data;
      if (!snapshot) {
        return;
      }

      // Get the cuota data
      const studentData = snapshot.data();
      const cuotaDiscount = studentData.Discount || 1;
      const cuotaStartDate = studentData.FechaInicioCuota;
      // Query for all cuotas whose TipoCuota matches the cuota's Tipo and are older than cuotaStartDate
      const cuotasSnapshot = await admin
          .firestore()
          .collection("cuotas")
          .where("Periodo.from", ">=", cuotaStartDate || new Date(1))
          .get();

      // Update payment information for each cuota
      let batch = admin.firestore().batch();
      let count = 0;
      for (const cuotaDoc of cuotasSnapshot.docs) {
        const cuotaDocData = cuotaDoc.data();
        const newAmount = cuotaDiscount * cuotaDocData.Monto;
        const cuotaRef = admin.firestore().collection(`students/${event.params.studentId}/cuota_payments`).doc();
        batch.set(cuotaRef, {...cuotaDocData, cuotaDefault: cuotaDocData, Monto: newAmount, Discount: cuotaDiscount, RemainingAmountDue: newAmount, cuotaId: cuotaDoc._id, houseHold: studentData.houseHold, studentId: event.params.studentId}, {merge: true});
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
    },
);

import {onDocumentWritten} from "firebase-functions/v2/firestore";
import { onCall } from "firebase-functions/v2/https";
import admin from 'firebase-admin';
import { setGlobalOptions } from "firebase-functions/v2/options";
setGlobalOptions({maxInstances: 10})
admin.initializeApp();

export const handleCuota = onDocumentWritten(
  'cuota/{cuotaId}',
  async (event) => {
    // Get the cuota data
    const cuota = event.value.data();
    event.subject
    // Query for all students whose TipoCuota matches the cuota's Tipo
    const studentsSnapshot = await admin
      .firestore()
      .collection('students')
      .where('TipoCuota', '==', cuota.Tipo)
      .get();

    // Handle the different operation types
    if (event.data.before.data()) {
      // Update the cuota in each student's cuota_payments subcollection
      for (const studentDoc of studentsSnapshot.docs) {
        const studentData = studentDoc.data();
        await admin
          .firestore()
          .doc(`students/${studentData.id}/cuota_payments/${event.params.cuotaId}`)
          .update(cuota);
      }
    } else if (event.data.after.data()) {
      // Add the cuota to each student's cuota_payments subcollection
      for (const studentDoc of studentsSnapshot.docs) {
        const studentData = studentDoc.data();
        await admin
          .firestore()
          .doc(`students/${studentData.id}/cuota_payments/${event.params.cuotaId}`)
          .set(cuota);
      }
    }  else if (!event.data.after.exists()) {
      // Delete the cuota from each student's cuota_payments subcollection
      for (const studentDoc of studentsSnapshot.docs) {
        const studentData = studentDoc.data();
        await admin
          .firestore()
          .doc(`students/${studentData.id}/cuota_payments/${event.params.cuotaId}`)
          .delete();
      }
    }
  }
);




export const calculateAmountOwedByAllHouseholds = onCall(
  async (data, context) => {
      // Calculate the amount owed by each household
      let totalAmountOwed = 0;
      const houseHoldsSnapshot = await admin
        .firestore()
        .collection('houseHolds')
        .get();
      for (const houseHoldDoc of houseHoldsSnapshot.docs) {
        const houseHoldData = houseHoldDoc.data();
        let amountOwed = 0;
        const studentsSnapshot = await admin
          .firestore()
          .collection(`/students`).where('houseHold', '==', houseHoldDoc.id)
          .get();
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          const cuotasSnapshot = await admin
            .firestore()
            .collection(`students/${studentData.id}/cuota_payments`)
            .get();
          for (const cuotaDoc of cuotasSnapshot.docs) {
            const cuotaData = cuotaDoc.data();
            amountOwed += cuotaData.RemainingAmountDue;
          }
        }

        // Update the amount owed in the household's document
        await admin
          .firestore()
          .doc(`houseHolds/${houseHoldDoc.id}`)
          .update({ amountOwed });

        // Add the household's amount owed to the total amount owed
        totalAmountOwed += amountOwed;
      }

      // Update the total amount owed in the school/accounting document
      await admin
        .firestore()
        .doc('school/accounting')
        .update({ totalAmountOwed, lastUpdate: new Date() });

      // Return the calculated total amount owed
      return { totalAmountOwed };
    });


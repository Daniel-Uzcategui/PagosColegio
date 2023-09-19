import { collectionGroup, query, where, startAfter, limit, getDocs, doc, writeBatch, setDoc } from "firebase/firestore";
import { db } from 'src/boot/vuefire';
export async function calculateAmountOwedByAllHouseholds() {
    console.log("Starting the call");
    // Calculate the amount owed by each household
    let totalAmountOwed = 0;
    const today = new Date();
    // Read all cuota payments
    const cuotasRef = query(collectionGroup(db, "cuota_payments"), where("RemainingAmountDue", ">", 0));
    // Process the data in memory
    const houseHoldAmountsOwed = {};
    let lastDoc;
    let hasMoreData = true;
    while (hasMoreData) {
      let cuotasSnapshot;
      if (lastDoc) {
        cuotasSnapshot = await getDocs(query(cuotasRef, startAfter(lastDoc), limit(500)));
      } else {
        cuotasSnapshot = await getDocs(query(cuotasRef, limit(500)));
      }
      if (cuotasSnapshot.empty) {
        hasMoreData = false;
      } else {
        lastDoc = cuotasSnapshot.docs[cuotasSnapshot.docs.length - 1];
        for (const cuotaDoc of cuotasSnapshot.docs) {
          const cuotaData = cuotaDoc.data();
          if (today > cuotaData.Periodo.from.toDate()) {
            const houseHoldId = cuotaData.houseHold;
            houseHoldAmountsOwed[houseHoldId] =
            (houseHoldAmountsOwed[houseHoldId] || 0) + cuotaData.RemainingAmountDue;
          }
        }
      }
    }
    // Split the households into batches of 500
    const batchSize = 500;
    const houseHoldBatches = [];
    for (let i = 0; i < Object.keys(houseHoldAmountsOwed).length; i += batchSize) {
      houseHoldBatches.push(Object.keys(houseHoldAmountsOwed).slice(i, i + batchSize));
    }
    // Batch update the household documents in multiple writes
    for (const houseHoldBatch of houseHoldBatches) {
      const batch = writeBatch(db);
      for (const houseHoldId of houseHoldBatch) {
        if (houseHoldAmountsOwed[houseHoldId]) {
          const amountOwed = houseHoldAmountsOwed[houseHoldId];
          const houseHoldRef = doc(db, `houseHolds/${houseHoldId}`);
          batch.set(houseHoldRef, {amountOwed}, {merge: true});
          totalAmountOwed += amountOwed;
        }
      }
      await batch.commit();
    }
    // Update the total amount owed in the school/accounting document
    await setDoc(doc(db, "school/accounting"), {totalAmountOwed, lastUpdate: new Date()}, {merge: true});
    
    // Return the calculated total amount owed
   return {totalAmountOwed};
}


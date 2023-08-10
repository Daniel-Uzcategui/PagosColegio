<template>
    <div>
      <q-btn color="primary" icon="check" label="OK" @click="calculateAmountOwedByAllHouseholds" />
        <q-table
          title="Parents"
          :rows="houseHoldsWithAmountOwed"
          :columns="columns"
        />

    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
  import { db } from 'src/boot/vuefire';
  import { calculateAmountOwedByAllHouseholds } from 'src/utils/callable';

  const houseHoldsCollection = collection(db, 'houseHolds');
  const houseHolds = ref([]);
  const houseHoldsWithAmountOwed = ref([]);
  
  onMounted(async () => {
    const querySnapshot = await getDocs(houseHoldsCollection);
    houseHolds.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
    for (const houseHold of houseHolds.value) {
      let totalOwed = 0;
      const studentsSnapshots = await getDocs(query(collection(db, 'students'), where('houseHold', '==', houseHold.id)));
      for (const studentSnapshot of studentsSnapshots.docs) {
        const student = studentSnapshot.data();
        const cuotasSnapshots = await getDocs(collection(db, `cuotas`));
        for (const cuotaSnapshot of cuotasSnapshots.docs) {
          const cuota = cuotaSnapshot.data();
          const cuotaPaymentRef = doc(db, `students/${student.id}/cuota_payments`, cuota.id);
          const cuotaPaymentSnap = await getDoc(cuotaPaymentRef);
          if (cuotaPaymentSnap.exists()) {
            totalOwed += cuotaPaymentSnap.data().RemainingAmountDue;
          } else {
            totalOwed += cuota.Monto;
          }
        }
      }
      houseHoldsWithAmountOwed.value.push({ ...houseHold, totalOwed });
    }
  });
  
  const columns = [
    { name: 'Nombre', label: 'Name', field: 'Nombre', align: 'left' },
    { name: 'Apellido', label: 'Apellido', field: 'Apellido', align: 'left' },
    { name: 'Telefono', label: 'Telefono', field: 'Telefono', align: 'left' },
    { name: 'Email', label: 'Email', field: 'Email', align: 'left' },
    {
      name: 'totalOwed',
      label: 'Total Owed',
      field: 'totalOwed',
      align: 'right',
      format: val => `$ ${val.toFixed(2)}`
    }
  ];
  </script>
  
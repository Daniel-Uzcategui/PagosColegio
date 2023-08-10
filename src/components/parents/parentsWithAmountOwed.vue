<template>
    <div>
        {{ parentsWithAmountOwed }}
        <q-table
          title="Parents"
          :rows="parentsWithAmountOwed"
          :columns="columns"
        />

    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
  import { db } from 'src/boot/vuefire';
  
  const $q = useQuasar();
  
  const parentsCollection = collection(db, 'parents');
  const parents = ref([]);
  const parentsWithAmountOwed = ref([]);
  
  onMounted(async () => {
    const querySnapshot = await getDocs(parentsCollection);
    parents.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
    for (const parent of parents.value) {
      let totalOwed = 0;
      const studentsSnapshots = await getDocs(query(collection(db, 'students'), where('Padres', 'array-contains', parent.id)));
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
      parentsWithAmountOwed.value.push({ ...parent, totalOwed });
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
  
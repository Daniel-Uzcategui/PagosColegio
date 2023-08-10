<template>
    <q-dialog :model-value="showDialog" @hide="$emit('update:showDialog', false)">
      <q-table
        flat bordered
        title="Cuotas"
        :rows="cuotas"
        :columns="columns"
        row-key="id"
        v-model:selected="selected"
        selection="multiple"
      >
        <template v-slot:top-right>
          <q-btn color="primary" icon="add" label="Añadir pago" @click="addPaymentDialog = true" />
        </template>
        <template v-slot:body-cell-Monto="{ row }">
            <q-td :class="{ 'bg-green text-white': remainingAmountDue[row.id] === 0, 'bg-red text-white': remainingAmountDue[row.id] === row.Monto , 'bg-yellow-10 text-white': remainingAmountDue[row.id] !== row.Monto && remainingAmountDue[row.id] > 0}">
                {{ remainingAmountDue[row.id] }}
                <q-inner-loading :showing="typeof remainingAmountDue[row.id] === 'undefined'">
                    <q-spinner size="20px" color="primary" />
                </q-inner-loading>
            </q-td>
        </template>
      </q-table>
      <AddPayment v-if="addPaymentDialog" @submitted="submitted = !submitted" :selectedCuotas="selected" :students="students" :show-dialog="addPaymentDialog" @update:show-dialog="updateAddPaymentDiag" :houseHold="houseHoldRef" />
    </q-dialog>
  </template>
  
  <script setup>
  import { toRef, watchEffect } from 'vue';
  import { ref } from 'vue';
  import { collection, query, where,getDoc, orderBy, limit, doc } from 'firebase/firestore';
  import { useCollection } from 'vuefire'
  import { db } from 'src/boot/vuefire';
  import AddPayment from './addPayment.vue';
  const submitted = ref(false)
  const selected = ref([]);
  const props = defineProps({
    showDialog: {
      type: Boolean,
      required: true,
    },
    houseHold: {
      type: Object,
      required: true,
    },
  });
  const emits = defineEmits(['update:showDialog'])
  
  const houseHoldRef = toRef(props, 'houseHold');
  const addPaymentDialog = ref(false);
  
  function updateAddPaymentDiag(value) {
    addPaymentDialog.value = value;
  }
  
  const cuotas = ref([]);
  const students = useCollection(query(collection(db, 'students'), where('houseHold', '==', houseHoldRef.value.id)), { ssrKey: 'students-ssr' })
  const cuotasCollection = useCollection(query(collection(db, 'cuotas'), orderBy('Periodo.from', 'desc'), limit(12), where('Periodo.from', '<=', new Date())), { ssrKey: 'cuotas-ssr' })
  
  watchEffect(async () => {
    cuotas.value = [];
    students.value.forEach(student => {
      const studentCuotas = cuotasCollection.value.filter(cuota => cuota.Tipo === student.TipoCuota);
      studentCuotas.forEach(cuota => {
        const newCuota = {...cuota};
        newCuota.Student = student;
        cuotas.value.push(newCuota);
      });
    });
  });
  const remainingAmountDue = ref({});

watchEffect(async () => {
    console.log(submitted.value)
  const newRemainingAmountDue = {};
  for (const cuota of cuotas.value) {
    const cuotaPaymentRef = doc(db, `students/${cuota.Student.id}/cuota_payments`, cuota.id);
    const cuotaPaymentSnap = await getDoc(cuotaPaymentRef);
    if (cuotaPaymentSnap.exists()) {
      newRemainingAmountDue[cuota.id] = cuotaPaymentSnap.data().RemainingAmountDue;
    } else {
      newRemainingAmountDue[cuota.id] = cuota.Monto;
    }
  }
  remainingAmountDue.value = newRemainingAmountDue;
});
  
  const columns = [
    { type: 'selection', name: 'selected', align: 'center', field: 'selected' },
    { name: 'PeriodoFrom', label: 'Periodo Desde', field: row => toDateLocate(row.Periodo.from), align: 'left', sortable: true },
    { name: 'PeriodoTo', label: 'Periodo Hasta', field: row => toDateLocate(row.Periodo.to), align: 'left', sortable: true },
    { name: 'Monto', label: 'Monto', field: (row) => remainingAmountDue.value[row.id], align: 'left', sortable: true },
    { name: 'Student',label: 'Estudiante', field: (row) => row.Student?.Nombre, align: 'left', sortable: true }
  ];
  
  function toDateLocate(date) {
    return date.toDate().toLocaleDateString('es-MX');
  }
  </script>

  
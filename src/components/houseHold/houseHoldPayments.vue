<template>
    <q-dialog :model-value="showDialog" @hide="$emit('update:showDialog', false)" maximized>
      <q-table
        flat bordered
        title="Cuotas"
        :rows="cuotas"
        :columns="columns"
        :row-key="row=>row.id + row.Student.id"
        >
        <template v-slot:top-right>
          <q-btn color="secondary" class="q-mr-md" icon="add" label="Añadir cuota" @click="addCuotaDialog = true" />
          <q-btn color="primary" class="q-mr-md" icon="add" label="Añadir pago" @click="addPaymentDialog = true" />
          <q-btn class="absolute-top-right" style="z-index: 99999;" dense flat icon="close" @click="emits('update:showDialog', false)">
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
        </template>
        <template v-slot:body-cell-Monto="prop">
            <q-td :class="{ 'bg-green text-white': prop.row.RemainingAmountDue=== 0, 'bg-red text-white': prop.row.RemainingAmountDue === prop.row.Monto , 'bg-yellow-10 text-white': prop.row.RemainingAmountDue !== prop.row.Monto && prop.row.RemainingAmountDue > 0}">
                {{ prop.row.RemainingAmountDue?.toFixed(2) }}
            </q-td>
        </template>
        <template v-slot:body-cell-Student="prop">
            <q-td>
                <q-btn color="primary" icon="person" :label="prop.row.Student?.Nombre" @click="studentRefEdit=prop.row.Student;addStudentDialog = true;" />
            </q-td>
        </template>
      </q-table>
      <AddCuotaStudent v-if="addCuotaDialog" :cuotaRef="{}" @updatedOrCreated="submitted=!submitted; emits('submitted')" :selectedCuotas="cuotas" :students="students" v-model="addCuotaDialog" @update:show-dialog="updateAddPaymentDiag" :houseHold="houseHoldRef" />
      <AddPayment v-if="addPaymentDialog" @submitted="submitted=!submitted; emits('submitted')" :selectedCuotas="cuotas" :students="students" :show-dialog="addPaymentDialog" @update:show-dialog="updateAddPaymentDiag" :houseHold="houseHoldRef" />
      <AddStudent v-if="addStudentDialog" v-model:show-dialog="addStudentDialog" @submitted="submitted=!submitted; emits('submitted')" :student="studentRefEdit" />
    </q-dialog>
  </template>
  <script setup>
  import { toRef, watchEffect } from 'vue';
  import { ref } from 'vue';
  import { collection, query, where, getDocs } from 'firebase/firestore';
  import { useCollection } from 'vuefire'
  import { db } from 'src/boot/vuefire';
  import AddPayment from './addPayment.vue';
  import AddStudent from '../students/addStudent.vue';
  import AddCuotaStudent from '../payments/addCuotaStudent.vue';
  const submitted = ref(false)
  const studentRefEdit = ref()
  const addStudentDialog = ref(false)
  const addCuotaDialog = ref(false)
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
  const emits = defineEmits(['update:showDialog', 'submitted'])
  
  const houseHoldRef = toRef(props, 'houseHold');
  const addPaymentDialog = ref(false);
  
  function updateAddPaymentDiag(value) {
    addPaymentDialog.value = value;
  }
  
  const cuotas = ref([]);
  const students = useCollection(query(collection(db, 'students'), where('houseHold', '==', houseHoldRef.value.id)))
  
  watchEffect(async () => {
    console.log(submitted.value)
    cuotas.value = []
  for (const student of students.value) {
    const cuotaPaymentsRef = query(collection(db, `students/${student.id}/cuota_payments`), where('RemainingAmountDue', '>', 0));
    const cuotaPaymentsSnap = await getDocs(cuotaPaymentsRef);
    cuotaPaymentsSnap.forEach(cuotaPayment => {
      const newCuota = cuotaPayment.data();
    if (newCuota.Periodo.from.toDate() <= new Date()) {
      newCuota.Student = student;
      newCuota.id = cuotaPayment.id
      cuotas.value.push(newCuota);
    }
    });
  }
});
  
  const columns = [
    { type: 'selection', name: 'selected', align: 'center', field: 'selected' },
    { name: 'Alias', label: 'Alias', field: 'Alias', align: 'left', sortable: true },
    { name: 'PeriodoFrom', label: 'Periodo Desde', field: row => toDateLocate(row.Periodo.from), align: 'left', sortable: true },
    { name: 'PeriodoTo', label: 'Periodo Hasta', field: row => toDateLocate(row.Periodo.to), align: 'left', sortable: true },
    { name: 'Monto', label: 'Monto Restante', field: 'RemainingAmountDue', align: 'left', sortable: true },
    { name: 'Student',label: 'Estudiante', field: (row) => row.Student?.Nombre, align: 'left', sortable: true }
  ];
  
  function toDateLocate(date) {
    return date.toDate().toLocaleDateString('es-MX');
  }
  </script>

  
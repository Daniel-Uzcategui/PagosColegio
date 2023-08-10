<template>
<q-dialog @show="tableRefCuota.requestServerInteraction()" full-width :model-value="modelValue"
  @update:model-value="(e) => $emit('update:modelValue', e)">
  <q-table
    flat bordered
    ref="tableRefCuota"
    title="Cuotas"
    :rows="rows"
    :columns="columns"
    row-key="id"
    v-model:pagination="pagination"
    :loading="serverPagination.loading"
    :selected-rows-label="getSelectedString"
    selection="multiple"
    v-model:selected="selected"
    :filter="filter"
    binary-state-sort
    @request="(e)=> onRequest(e,pagination, serverPagination, rows)"
  >
    <template v-slot:body-cell-PeriodoFrom="props">
      <q-btn class="full-width" color="primary" no-caps @click="getCuotaInfo(props.row)"> {{ toDateLocate(props.row.Periodo.from)}} </q-btn>
    </template>
    <template v-slot:top-right>
      <q-btn color="primary" icon="add" label="Añadir un pago" @click="addPayment()" />
      <q-btn size="md" flat icon="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date minimal @update:model-value="removeRange" :model-value="filter" range>
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-btn>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props" v-if="props.row.Tipo" :class="getPaymentStatusClass(props.row)">
        <q-td>
          <q-checkbox v-model="props.selected" filled />
        </q-td>
        <q-td
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
        >
          {{ col.value }}
        </q-td>
        <q-td auto-width>
          <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <div v-if="hasPayments(props.row)" class="text-left">
            Pagos:
            <ul>
              <li v-for="payment in getPayments(props.row)" :key="payment.id">
                {{ payment.Monto }} {{ payment.dateIn.toDate() }} {{ payment.Referencia }}
              </li>
            </ul>
          </div>
          <div v-else class="text-left">No Existen pagos para esta cuota</div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div class="q-mt-md">
    Selected: {{ JSON.stringify(selected) }}
  </div>
  <AddPayment v-model="addpaymentDialog" :selectedCuota="selected" :student="studentRef" :payments="payments"/>
</q-dialog>
</template>
<script setup>
import { ref, toRef, computed } from 'vue';
import AddPayment from './addPayment.vue'
import { onRequest } from 'src/utils/onRequest.js';
import { useCollection, useDocument } from 'vuefire';
import { db } from 'src/boot/vuefire';
import { collection, doc } from 'firebase/firestore';
const selected = ref([])
const props = defineProps({modelValue: {
  type: Boolean,
  required: true
}, student: {
  type: Object,
  default(rawProps) {
    return {['Cédula de identidad']: '1'}
  }
}})
const studentRef = toRef(props, 'student')
const studentSource = computed(() => {
  console.log(studentRef.value)
  return doc(collection(db, 'students'), studentRef.value.id)
}
)
function getSelectedString () {
      return selected.value.length === 0 ? '' : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rows.value.length}`
    }
defineEmits(['update:modelValue'])
const selectedStudent = useDocument(studentSource, {maxRefDepth: 0});
const payments = computed(() => {
  if (!studentRef.value || !studentRef.value.Padres) return [];
  let allPayments = [];
  for (const padre of studentRef.value.Padres) {
    const paymentsRef = ref([]);
    useCollection(
      collection(db, `parents/${padre}/payments`),
      {
        // options
      },
      paymentsRef
    );
    allPayments.push(...paymentsRef.value);
  }
  return allPayments;
});

const tableRefCuota = ref()
const cuotaOpen = ref(false)
const editCuota = ref()
const rows = ref([])
const addpaymentDialog = ref(false)
function addPayment() {
  addpaymentDialog.value = true
}
function removeRange(value,reason) {
  console.log(value,reason)
  if (reason === 'remove-range') {
    console.log('Setting value')
    return filter.value = ''
  }
  filter.value = value
}
function getCuotaInfo(cuota) {
  console.log({cuota})
  cuotaOpen.value = true
  if (cuota) {
      editCuota.value = cuota
      return
  }
  editCuota.value = null
}
const columns = [
  { "name": "PeriodoFrom", "label": "Periodo Desde", "field": row => toDateLocate(row.Periodo.from), "align": "left", "sortable": true },
  { "name": "PeriodoTo", "label": "Periodo Hasta", "field": row => toDateLocate(row.Periodo.to), "align": "left", "sortable": true },
  { "name": "Monto", "label": "Monto", "field": "Monto", "align": "left", "sortable": true },
  { "name": "tipo", "label": "Tipo", "field": "Tipo", "align": "left", "sortable": true },
]
function toDateLocate (date) {
  return date.toDate().toLocaleDateString("es-MX")
}
  const filter = ref('')
  const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 3,
    rowsNumber: 10,
    first: '',
    last: ''
  })
  const serverPagination = ref({
    callerCollection: "cuotas",
    defaultColumn: "PeriodoFrom",
    lastDocument: null,
    loading: false,
    extraFilter: {
      key: 'Tipo',
      value: studentRef.value.TipoCuota || 'A',
      condition: '=='
    }
  })
  function getPaymentStatusClass(row) {
      if (!hasPayments(row)) {
        return 'bg-red text-white text-bold';
      } else if (getTotalPayments(row) < row.Monto) {
        return 'bg-pink text-bold text-white';
      } else {
        return '';
      }
    }
    function getPayments(row) {
      return payments.value.filter(payment => payment.CuotaId === row.id);
    }

    function hasPayments(row) {
      return getPayments(row).length > 0;
    }

    function getTotalPayments(row) {
      return getPayments(row).reduce((total, payment) => total + payment.Monto, 0);
    }
</script>
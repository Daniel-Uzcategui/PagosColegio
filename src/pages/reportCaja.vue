<template>
  <div class="q-pa-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6 q-my-sm">Filtros:</div>
        <div class="q-gutter-md row items-start">
          <q-input v-model="filters.referencia" label="Referencia de pago" @update:model-value="fetchPayments" debounce="1000" class="col-6" />
          <q-select ref="userSelectOption" v-model="filters.userId" :options="users" option-label="email" option-value="_id" emit-value map-options label="Usuario" @update:model-value="fetchPayments" debounce="1000" class="col-6" />
          {{ userSelectOption?.ref }}
        </div>
      </q-card-section>
      <q-card-actions align="center" class="q-pt-none">
        <q-btn icon="sym_o_today" color="primary" label="Fecha Desde" @click="showStartDateDialog=!showStartDateDialog" class="q-mx-sm" />
        <q-btn icon="sym_o_event" color="secondary" label="Fecha Hasta" @click="showEndDateDialog=!showEndDateDialog" class="q-mx-sm" />
      </q-card-actions>
    </q-card>
    <q-btn label="Descargar Excel" icon="sym_o_sheets_rtl" color="accent" @click="downloadExcel" />
    <q-btn :disable="!studentid || !selected.length" color="primary" icon="check" label="Enviar a Recibo" @click="reciboTemplate" />
    <q-table
    bordered
      selection="multiple"
      v-model:selected="selected"
      :rows="payments"
      :columns="columns"
      separator="cell"
      row-key="_id"
      binary-state-sort
      class="q-mt-md full-width"
    >
    <template v-slot:header-selection="scope">
        <q-toggle disable v-model="scope.selected" />
      </template>

      <template v-slot:body-selection="scope">
        <q-toggle :disable="scope.row.status === 'reverted'" v-model="scope.selected" />
      </template>
    <template v-slot:body-cell="props">
        <q-td :class="[{'bg-red-5 text-white text-bold': props.row.status === 'reverted'}]" :props="props">
          {{ props.value }}
        </q-td>
    </template>
    <template v-slot:body-cell-cuotasPaidRefs="props">
        <q-td :props="props">
          <q-list separator>
            <q-item>
              <q-item-section>Alias</q-item-section>
              <q-item-section>Monto</q-item-section>
            </q-item>
            <q-item v-for="(i,index) of getCuotas(props.row)" :key="index" clickable v-ripple>
              <q-item-section>{{i.Alias}}</q-item-section>
              <q-item-section>{{formatCurrency(i.MontoPaid)}}</q-item-section>
            </q-item>
          </q-list>
        </q-td>
      </template>
      <template v-slot:body-cell-Tipo="props">
        <q-td :props="props">
          <q-icon  :name="paymentMethods[props.value].icon" :color="paymentMethods[props.value].color" />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn v-if="props.row.status !== 'reverted'" flat color="negative" icon="undo" no-caps label="Revertit el pago" @click="openConfirmDialog(props.row)" />
      </q-td>
    </template>

  </q-table>
  <q-dialog v-model="showConfirmDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">¿Estás seguro de que quieres revertir este pago?</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Confirm" color="negative" @click="revertPayment" />
      </q-card-actions>
    </q-card>
  </q-dialog>
    <q-dialog v-model="showStartDateDialog">
      <q-card>
        <q-date v-model="filters.dateFrom" label="Start Date" @update:model-value="fetchPayments" debounce="1000" />
      </q-card>
    </q-dialog>
    <q-dialog v-model="showEndDateDialog">
      <q-card>
        <q-date v-model="filters.dateTo" label="End Date" @update:model-value="fetchPayments" debounce="1000" />
      </q-card>
    </q-dialog>
  </div>
</template>

<style>
.my-card {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}
</style>


<script setup>

import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';
import { format } from 'date-fns';
import { utils, write } from 'xlsx';
import { useRouter } from 'vue-router';
import { usePaymentStore } from 'src/stores/Payments';
const paymentStore = usePaymentStore()
const router = useRouter();
const userSelectOption = ref(null)
const showConfirmDialog = ref(false);
const selectedPayment = ref(null);
const emits = defineEmits(['revert'])
const selected = ref([])
function reciboTemplate () {
  paymentStore.selectedPayments = selected.value
  router.push({ 
    name: 'ReceiptTemplate'
  });
}

function openConfirmDialog(row) {
    selectedPayment.value = row;
    showConfirmDialog.value = true;
  }

  async function revertPayment() {
    // Call your API endpoint to revert the payment
    await api.post('/revert-payment', { paymentId: selectedPayment.value._id });
    // Refresh the payments data
    await fetchPayments();
    // Close the dialog
    showConfirmDialog.value = false;
    return emits('revert')
  }
const paymentMethods = {
  'Tarjeta Débito': { icon: 'point_of_sale', color: 'blue' },
  'Punto de venta': { icon: 'point_of_sale', color: 'blue' },
  'Tarjeta Crédito': { icon: 'point_of_sale', color: 'blue' },
  'Credit': { icon: 'point_of_sale', color: 'blue', 'alias': 'Abono anterior' },
  'Efectivo $': { icon: 'attach_money', color: 'green' },
  'Efectivo BS': { icon: 'money', color: 'red' },
  'Zelle': { icon: 'account_balance', color: 'purple' },
  'Pago Movil': { icon: 'phone_android', color: 'orange' },
  'Transferencia': { icon: 'swap_horiz', color: 'yellow' },
  'Otros': { icon: 'more_horiz', color: 'gray' }
};
const options = {
  'Tarjeta Débito': 0,
  'Tarjeta Crédito': 0,
  'Efectivo $': 0,
  'Efectivo BS': 0,
  'Zelle': 0,
  'Pago Movil': 0,
  'Transferencia': 0,
  'Credit': 0,
  'Otros': 0
};
const props = defineProps({
  studentid: {
      type: String,
  }
})
async function downloadExcel() {
  let userEmail = getEmail(filters.value)
  userEmail = userEmail !== '' ? userEmail.split('@')[0] : userEmail
  // Prepare the data for the Excel file
  const data = payments.value.map(payment => ({
    tipoEstudiante: payment.studentId.help ? 'Ayuda' : 'Regular',
    UsuarioCaja: getEmail(payment),
    FechaRegistro: formatDateHour(payment.dateIn),
    FechaPago: formatDate(payment.fechaPago),
    Referencia: payment.Referencia,
    MontoTotalBS: formatCurrencyBS(payment.MontoTotalBS),
    Tipo: payment.Tipo,
    ...options,
    [payment.Tipo]: formatCurrency(payment.Monto),
    ['Tasa BCV']: formatCurrencyBS(payment.TasaBCV),
    Mensualidad: getCuotas(payment).map(cuota => `${cuota.Alias} - ${formatCurrency(cuota.MontoPaid)}`).join(', '),
    Estudiante: getStudent(payment),
    Cédula: getStudentCed(payment),
    MontoTotal: formatCurrency(payment.Monto),
  }));
  const totalMontoTotal = payments.value.reduce((accumulator, payment) => accumulator + parseFloat(payment.Monto), 0);
  const totalMontoTotalBS = payments.value.reduce((accumulator, payment) => accumulator + parseFloat(payment.MontoTotalBS), 0);
  // Add the total to the data array
  data.push({ MontoTotal: parseFloat(totalMontoTotal.toFixed(2)), MontoTotalBS: parseFloat(totalMontoTotalBS.toFixed(2)) });
  // Convert the data to a worksheet
  const worksheet = utils.json_to_sheet(data);

  // Create a new workbook and add the worksheet to it
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Payments');

  // Write the workbook to an Excel file
  const excelBuffer = write(workbook, { type: 'array' });

  // Create a Blob from the Excel file
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

  // Create a URL for the Blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ReporteCaja' + ' '+ userEmail + ' ' + (new Date()).getDate()  + '-'+ ((new Date()).getMonth() + 1) + '-' +  (new Date()).getFullYear() + '.xlsx';

  // Append the anchor element to the body
  document.body.appendChild(a);

  // Trigger a click on the anchor element
  a.click();

  // Remove the anchor element from the body
  document.body.removeChild(a);
}


// Define a filter for date formatting
const formatDate = (value) => {
if (!value) return '';
return format(new Date(value), 'dd/MM/yyyy');
};
// Define a filter for date formatting
const formatDateHour = (value) => {
if (!value) return '';
return format(new Date(value), 'dd/MM/yyyy HH:mm');
};
// Define a filter for currency formatting
const formatCurrency = (value) => {
if (typeof value !== 'number') return 'NA';
return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};
const formatCurrencyBS = (value) => {
if (typeof value !== 'number') return 'NA';
return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VES' }).format(value);
};
const columns = [
{ name: 'actions', required: true, label: 'Acciones', align: 'left', field: 'actions' },
{ name: 'Referencia', required: true, label: 'Referencia', align: 'left', field: 'Referencia' },
{ name: 'Monto', required: true, label: 'Monto Total', align: 'left', field: row => formatCurrency(row.Monto) },
{ name: 'MontoTotalBS', required: true, label: 'Monto Total BS', align: 'left', field: row => formatCurrencyBS(row.MontoTotalBS) },
{ name: 'userId', required: true, label: 'Usuario Caja', align: 'left', field: getEmail },
{ name: 'cuotasPaidRefs', required: true, label: 'Cuotas Pagadas y montos', align: 'left', field: getCuotas},
{ name: 'TasaBCV', required: true, label: 'Tasa BCV', align: 'left', field: row => formatCurrencyBS(row.TasaBCV) },
{ name: 'Tipo', required: true, label: 'Tipo de pago', align: 'left', field: 'Tipo' },
{ name: 'studentId', required: true, label: 'Estudiante', align: 'left', field: getStudent },
{ name: 'studentCed', required: true, label: 'Cédula', align: 'left', field: getStudentCed },
{ name: 'dateIn',sortable: true, required: true, label: 'Fecha Registro', align: 'left', field: row => formatDateHour(row.dateIn) },
{ name: 'fechaPago' , required: true, label: 'Fecha Pago', align: 'left', field: row => formatDate(row.fechaPago) },
]
const users = ref([])
const payments = ref([])
const cuotaPaymentMap = ref({}) 
const showStartDateDialog = ref(false)
const showEndDateDialog = ref(false)
const userMap = ref({})
const filters = ref({
referencia: '',
userId: '',
dateFrom: '',
dateTo: '',
})
function getStudent(row) {
try {
return row.studentId.Nombre

} catch (error) {
return ""
}
}
function getStudentCed (row) {
try {
return row.studentId.ced

} catch (error) {
return ""
}
}
function getStudentGrado (row) {
try {
return row.studentId.Grado

} catch (error) {
return ""
}
}
function getStudentSeccion (row) {
try {
return row.studentId.Seccion

} catch (error) {
return ""
}
}
function getCuotas(row) {
try {
  const keys = Object.keys(row.cuotasPaid)
  return keys.map((cuota,index) => {
    return {
      ...cuotaPaymentMap.value[cuota],
      MontoPaid: row.cuotasPaid[keys[index]]
    }
  })
} catch (error) {
return []
}
}
function getEmail(row) {
try {
return userMap.value[row.userId].email
} catch (error) {
return ""
}
}
async function fetchPayments() {
const params = {};
for (const key in filters.value) {
if (filters.value[key]) {
params[key] = filters.value[key];
}
}
if (props.studentid) {
    params[`studentId`] = props.studentid
}
const response = await api.get('/payments?resolveCuotasPaid=true&resolveStudent=true', { params });
payments.value = response.data;
// Create a map of CuotaPayment documents
for (const payment of response.data) {
console.log(response.data)
for (const key in payment.cuotasPaidRefs) {
console.log(key)
cuotaPaymentMap.value[key] = payment.cuotasPaidRefs[key];
}
}
}
async function fetchUsers() {
const response = await api.get('/users');
users.value = response.data;
// Create a map of users
for (const user of response.data) {
userMap.value[user._id] = user;
}
}
onMounted(async()=>{
await fetchPayments();
await fetchUsers();
})
</script>
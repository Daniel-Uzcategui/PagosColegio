<template>
  <div class="q-pa-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6 q-my-sm">Filtros:</div>
        <div class="q-gutter-md row items-start">
          <q-input v-model="filters.referencia" label="Referencia de pago" @update:model-value="fetchPayments" debounce="1000" class="col-6" />
          <q-select v-model="filters.userId" :options="users" option-label="email" option-value="_id" emit-value map-options label="Usuario" @update:model-value="fetchPayments" debounce="1000" class="col-6" />
        </div>
      </q-card-section>
      <q-card-actions align="center" class="q-pt-none">
        <q-btn icon="sym_o_today" color="primary" label="Fecha Desde" @click="showStartDateDialog=!showStartDateDialog" class="q-mx-sm" />
        <q-btn icon="sym_o_event" color="secondary" label="Fecha Hasta" @click="showEndDateDialog=!showEndDateDialog" class="q-mx-sm" />
      </q-card-actions>
    </q-card>
    <q-btn label="Descargar Excel" icon="sym_o_sheets_rtl" color="accent" @click="downloadExcel" />
    <q-table
    bordered
      :rows="payments"
      :columns="columns"
      separator="cell"
      row-key="_id"
      binary-state-sort
      class="q-mt-md full-width"
    >
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
           {{ props.value }}
        </q-td>
      </template>
  </q-table>
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
const paymentMethods = {
  'Punto de venta': { icon: 'point_of_sale', color: 'blue' },
  'Efectivo $': { icon: 'attach_money', color: 'green' },
  'Efectivo BS': { icon: 'money', color: 'red' },
  'Zelle': { icon: 'account_balance', color: 'purple' },
  'Pago Movil': { icon: 'phone_android', color: 'orange' },
  'Transferencia': { icon: 'swap_horiz', color: 'yellow' },
  'Otros': { icon: 'more_horiz', color: 'gray' }
};

const props = defineProps({
  studentid: {
      type: String,
      required: true
  }
})
async function downloadExcel() {
  // Prepare the data for the Excel file
  const data = payments.value.map(payment => ({
    Referencia: payment.Referencia,
    FechaRegistro: formatDateHour(payment.dateIn),
    FechaPago: formatDate(payment.fechaPago),
    MontoTotal: formatCurrency(payment.Monto),
    MontoTotalBS: formatCurrencyBS(payment.MontoTotalBS),
    UsuarioCaja: getEmail(payment),
    CuotasPagadas: getCuotas(payment).map(cuota => `${cuota.Alias} - ${formatCurrency(cuota.MontoPaid)}`).join(', '),
    TasaBCV: formatCurrencyBS(payment.TasaBCV),
    Tipo: payment.Tipo,
    Estudiante: getStudent(payment),
    Cédula: getStudentCed(payment),
    // Add more fields as needed
  }));

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
  a.download = 'payments.xlsx';

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
{ name: 'Referencia', required: true, label: 'Referencia', align: 'left', field: 'Referencia' },
{ name: 'dateIn', required: true, label: 'Fecha Registro', align: 'left', field: row => formatDateHour(row.dateIn) },
{ name: 'fechaPago', required: true, label: 'Fecha Pago', align: 'left', field: row => formatDate(row.fechaPago) },
{ name: 'Monto', required: true, label: 'Monto Total', align: 'left', field: row => formatCurrency(row.Monto) },
{ name: 'MontoTotalBS', required: true, label: 'Monto Total BS', align: 'left', field: row => formatCurrencyBS(row.MontoTotalBS) },
{ name: 'userId', required: true, label: 'Usuario Caja', align: 'left', field: getEmail },
{ name: 'cuotasPaidRefs', required: true, label: 'Cuotas Pagadas y montos', align: 'left', field: getCuotas},
{ name: 'TasaBCV', required: true, label: 'Tasa BCV', align: 'left', field: row => formatCurrencyBS(row.TasaBCV) },
{ name: 'Tipo', required: true, label: 'Tipo de pago', align: 'left', field: 'Tipo' },
{ name: 'studentId', required: true, label: 'Estudiante', align: 'left', field: getStudent },
{ name: 'studentCed', required: true, label: 'Cédula', align: 'left', field: getStudentCed },
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
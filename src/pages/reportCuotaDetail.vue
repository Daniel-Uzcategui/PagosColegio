<template>
  <div>
    Filtrar por Cuotas
    <q-select
      clearable
      style="width: 400px;"
      v-model="filters.cuotaIds"
      :option-label="(x) => x.Alias + ' REF ' + x.Monto"
      option-value="_id"
      emit-value
      map-options
      :options="sortedCuotasOption"
      label="Agregar Cuota existente (OPCIONAL)"
      filled
      multiple
    />
    <q-input style="width: 400px;" v-model="filters.fromDate" label="Fecha desde" type="date" />
    <q-input style="width: 400px;" v-model="filters.toDate" label="Fecha hasta" type="date" />

    <q-btn label="Descargar XLS" @click="downloadXLS" />
    <q-toggle v-model="filters.paid" :disable="fetching" color="green" toggle-indeterminate :label="paidLabel(filters.paid)" />
    <HelpType multiple v-model:model-value="filters.help"></HelpType>
    <q-table
      :rows="cuotaPayments"
      :columns="columns"
      row-key="id"
      :loading="fetching"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">{{ props.row.studentInfo.Nombre }}</q-td>
          <q-td key="apellido" :props="props">{{ props.row.studentInfo.Apellido }}</q-td>
          <q-td key="ced" :props="props">{{ props.row.studentInfo.ced }}</q-td>
          <q-td key="remaining" :props="props">{{ props.row.RemainingAmountDue.toFixed(2) }}</q-td>
          <q-td key="alias" :props="props">{{ props.row.Alias }}</q-td>
          <q-td key="help" :props="props">{{  translateHelp(props.row.studentInfo.help) }}</q-td>
        </q-tr>
      </template>
    </q-table>
    <q-card  class="text-center">
        <div>Total de estudiantes filtrados: {{ totalStudents }}</div>
    </q-card>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { api } from "src/boot/axios";
import HelpType from 'src/components/students/helpType.vue';
import { useCuotaStore } from "src/stores/Cuotas";
import * as XLSX from 'xlsx';

const fetching = ref(false)
const cuotaPayments = ref([]);
const CuotasOption = ref([]);
const sortedCuotasOption = computed(() => {
  return [...CuotasOption.value].sort((a, b) => {
    const labelA = `${a.Alias} REF ${a.Monto}`.toLowerCase();
    const labelB = `${b.Alias} REF ${b.Monto}`.toLowerCase();
    return labelA.localeCompare(labelB);
  });
});
function paidLabel () {
  switch (filters.value.paid) {
    case true:
      return "Cuotas No pagadas";
    case false:
      return "Cuotas Pagadas";
    default:
      return "Todas las cuotas";
  }
}
const helpTypes = ref([]);
const filters = ref({
  cuotaIds: [],  // Change to array to support multiple values
  fromDate: null,
  paid: false,
    toDate: null,
  help: null
});

// Assuming cuotaPayments is already defined and is a reactive reference
const totalStudents = computed(() => {
  const uniqueStudentIds = new Set(cuotaPayments.value.map(payment => payment.studentInfo._id));
  return uniqueStudentIds.size;
});



const columns = [
  { name: 'name', required: true, label: 'Nombre', align: 'left', field: 'name', sortable: true },
  { name: 'apellido', align: 'left', label: 'Apellido', field: 'apellido', sortable: true },
  { name: 'ced', align: 'left', label: 'Cedula', field: 'ced', sortable: true },
  { name: 'remaining', align: 'left', label: 'Total que se debe', field: 'remaining', sortable: true },
  { name: 'alias', align: 'left', label: 'Cuota', field: 'alias', sortable: true },
  { name: 'help', align: 'left', label: 'Tipo', field: 'help', sortable: true },
];

async function downloadXLS() {
  let formattedData = cuotaPayments.value.map(payment => ({
    Name: payment.studentInfo.Nombre,
    Apellido: payment.studentInfo.Apellido,
    Cedula: payment.studentInfo.ced,
    TotalQueSeDebe: payment.RemainingAmountDue.toFixed(2),
    Cuota: payment.Alias,
    help: payment.studentInfo.help ? 'Ayuda' : 'Regular',
    Vencimiento: payment.Periodo.to
  }));

  // Add a row with the total number of students
  formattedData.push({
    Name: 'Total',
    Apellido: '',
    Cedula: '',
    TotalQueSeDebe: '',
    Cuota: '',
    help: '',
    Vencimiento: totalStudents.value
  });

  formattedData = formattedData.sort((a,b) => a.Vencimiento - b.Vencimiento);

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, 'report.xlsx');
}

async function fetchData() {
  try {
    fetching.value = true
    const response = await api.post('/report/cuotapayments', { ...filters.value });
    cuotaPayments.value = response.data;
    return fetching.value = false
  } catch (error) {
    console.error('There was an error fetching the data:', error);
  }
}
const translateHelp = function (helpId) {
  return helpTypes.value.find(x => x.value === helpId)?.label || 'Regular'
}
onMounted(async () => {
  await fetchData();
  CuotasOption.value = await useCuotaStore().getAllQuotas();
 await getHelps()
});

async function getHelps () {
  try {
    const response = await api.get('/helps'); // Adjust the path based on your API structure
    helpTypes.value = response.data.map(help => ({ label: help.name, value: help._id }));
  } catch (error) {
    console.error('Error fetching help types:', error);
    Notify.create({ message: 'Error al cargar tipos de ayuda', color: 'red' });
  }
}
watch(filters, async (newFilters) => {
  await fetchData();
}, { deep: true });

</script>
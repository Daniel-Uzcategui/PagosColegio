<template>
  <div>
    <q-select
      clearable
      style="width: 400px;"
      v-model="filters.cuotaIds"
      :option-label="(x) => x.Alias + ' REF ' + x.Monto"
      option-value="_id"
      emit-value
      map-options
      :options="CuotasOption"
      label="Agregar Cuota existente (OPCIONAL)"
      filled
      multiple
    />
    <q-input style="width: 400px;" v-model="filters.fromDate" label="Fecha de Cuotas" type="date" />
    <q-btn label="Descargar XLS" @click="downloadXLS" />
    <q-toggle v-model="filters.paid" color="green" toggle-indeterminate :label="paidLabel(filters.paid)" />
    <q-toggle v-model="filters.help" color="orange" toggle-indeterminate :label="helpLabel(filters.help)" />
    <q-table
      :rows="cuotaPayments"
      :columns="columns"
      row-key="id"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">{{ props.row.studentInfo.Nombre }}</q-td>
          <q-td key="apellido" :props="props">{{ props.row.studentInfo.Apellido }}</q-td>
          <q-td key="ced" :props="props">{{ props.row.studentInfo.ced }}</q-td>
          <q-td key="remaining" :props="props">{{ props.row.RemainingAmountDue.toFixed(2) }}</q-td>
          <q-td key="alias" :props="props">{{ props.row.Alias }}</q-td>
          <q-td key="help" :props="props">{{ props.row.studentInfo.help ? 'Ayuda' : 'Regular' }}</q-td>
        </q-tr>
      </template>
      <template v-slot:bottom>
        <div>Total de estudiantes filtrados: {{ totalStudents }}</div>
      </template>
    </q-table>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { api } from "src/boot/axios";
import { useCuotaStore } from "src/stores/Cuotas";
import * as XLSX from 'xlsx';

const cuotaPayments = ref([]);
const CuotasOption = ref([]);
const filters = ref({
  cuotaIds: [],  // Change to array to support multiple values
  fromDate: null,
  paid: false,
  help: false
});

const totalStudents = computed(() => cuotaPayments.value.length);

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

function helpLabel () {
  switch (filters.value.help) {
    case true:
      return "Estudiante Ayuda";
    case false:
      return "Estudiante Regular";
    default:
      return "Todos los estudiantes";
  }
}

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
    const response = await api.post('/report/cuotapayments', { ...filters.value });
    cuotaPayments.value = response.data;
  } catch (error) {
    console.error('There was an error fetching the data:', error);
  }
}

onMounted(async () => {
  await fetchData();
  CuotasOption.value = await useCuotaStore().getAllQuotas();
});

watch(filters, async (newFilters) => {
  await fetchData();
}, { deep: true });

</script>
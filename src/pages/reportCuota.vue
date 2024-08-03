<template>
  <div>
    <q-toggle v-model="filters.help" color="orange" toggle-indeterminate :label="helpLabel(filters.help)" />
    <q-btn label="Descargar XLS" @click="downloadXLS" />
    <q-table
      title="Reporte General"
      :rows="cuotaPayments"
      :columns="columns"
      row-key="Cuota"
      ref="table"
    >
    <template v-slot:body="props">
        <!-- Iterate over rows and create table rows dynamically -->
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name">
            {{ props.row[col.field] || 0 }}
          </q-td>
        </q-tr>
        <!-- Totals Row -->
        <q-tr v-if="props.pageIndex === $refs.table.computedRows.length - 1">
          <q-td>Totales:</q-td>
          <q-td v-for="col in props.cols.slice(1)" :key="col.name">
            <template v-if="typeof columnSums[col.field] === 'number'">
              {{ columnSums[col.field].toFixed(2) }}
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>



<script setup>
import { api } from "src/boot/axios";
import { onMounted, ref, watch, computed } from "vue";
import * as XLSX from 'xlsx';

// Define columns according to your API response
const columns = ref([
  { name: 'Cuota', required: true, label: 'Cuota', align: 'left', field: 'Cuota' },
  { name: 'Total por cobrar', label: 'Total por cobrar', align: 'right', field: 'Total por cobrar' },
  { name: 'Total cuotas pagadas', label: 'Total cuotas pagadas', align: 'right', field: 'Total cuotas pagadas' },
  { name: 'Total cuotas no pagadas', label: 'Total cuotas no pagadas', align: 'right', field: 'Total cuotas no pagadas' },
  { name: 'Tarjeta Débito', label: 'Tarjeta Débito', align: 'right', field: 'Tarjeta Débito' },
  { name: 'Tarjeta Crédito', label: 'Tarjeta Crédito', align: 'right', field: 'Tarjeta Crédito' },
  { name: 'Efectivo $', label: 'Efectivo $', align: 'right', field: 'Efectivo $' },
  { name: 'Efectivo BS', label: 'Efectivo BS', align: 'right', field: 'Efectivo BS' },
  { name: 'Zelle', label: 'Zelle', align: 'right', field: 'Zelle' },
  { name: 'Pago Movil', label: 'Pago Movil', align: 'right', field: 'Pago Movil' },
  { name: 'Transferencia', label: 'Transferencia', align: 'right', field: 'Transferencia' },
  { name: 'Credit', label: 'Credit', align: 'right', field: 'Credit' },
  { name: 'Otros', label: 'Otros', align: 'right', field: 'Otros' }
]);

const cuotaPayments = ref([]);
const filters = ref({
  cuotaId: null,
  fromDate: null,
  paid: false,
  help: false
});

const helpLabel = () => {
  switch (filters.value.help) {
    case true:
      return "Estudiante Ayuda";
    case false:
      return "Estudiante Regular";
    default:
      return "Todos los estudiantes";
  }
};

// Compute sums for numeric columns
const columnSums = computed(() => {
  const sums = {};

  cuotaPayments.value.forEach(row => {
    columns.value.forEach(col => {
      if (col.field && typeof row[col.field] === 'number') {
        sums[col.field] = (sums[col.field] || 0) + row[col.field];
      }
    });
  });

  return sums;
});

const getTotal = (field) => {
  return typeof columnSums.value[field] === 'number' ? columnSums.value[field].toFixed(2) : '';
};

async function fetchData() {
  try {
    const response = await api.post('/report/general', { ...filters.value });
    cuotaPayments.value = response.data;
  } catch (error) {
    console.error('There was an error fetching the data:', error);
  }
}

onMounted(async () => {
  await fetchData();
});

watch(filters, async (newFilters) => {
  await fetchData();
}, { deep: true });

async function downloadXLS() {
  // Create the sum row with the correct format
  const sumRow = columns.value.map(col => 
    typeof columnSums.value[col.field] === 'number'
      ? columnSums.value[col.field].toFixed(2)
      : ''
  );

  // Convert formattedData to an array of arrays format
  const formattedData = cuotaPayments.value.map(payment => 
    columns.value.map(col => payment[col.field] || 0)
  );

  // Prepare the header row
  const headerRow = columns.value.map(col => col.name);

  // Combine the sum row, header row, and data rows
  const allRows = [sumRow, headerRow, ...formattedData];

  // Convert the array of arrays to a worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, 'report.xlsx');
}


</script>
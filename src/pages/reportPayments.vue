<template>
    <div>
      <q-select clearable style="width: 400px;" v-model="filters.cuotaId" option-label="Alias" option-value="_id" emit-value map-options :options="CuotasOption" label="Agregar Cuota existente (OPCIONAL)" filled />
      <q-input style="width: 400px;" v-model="filters.fromDate" label="Fecha de Cuotas" type="date" />
      <q-btn label="Descargar XLS" @click="downloadXLS" />

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
            <q-td key="to" :props="props">{{ props.row.Periodo.to }}</q-td>
            <q-td key="help" :props="props">{{ props.row.studentInfo.help? 'Ayuda' : 'Regular' }}</q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { api } from "src/boot/axios";
  import { useCuotaStore } from "src/stores/Cuotas";
  import * as XLSX from 'xlsx';
  const cuotaPayments = ref([]);
  const CuotasOption = ref([]);
  const filters = ref({
    cuotaId: null,
    fromDate: null
  });
  
  const columns = [
    { name: 'name', required: true, label: 'Nombre', align: 'left', field: 'name', sortable: true },
    { name: 'apellido', align: 'left', label: 'Apellido', field: 'apellido', sortable: true },
    { name: 'ced', align: 'left', label: 'Cedula', field: 'ced', sortable: true },
    { name: 'remaining', align: 'left', label: 'Total que se debe', field: 'remaining', sortable: true },
    { name: 'alias', align: 'left', label: 'Cuota', field: 'alias', sortable: true },
    { name: 'to', align: 'left', label: 'Vencimiento', field: 'to', sortable: true },
    { name: 'help', align: 'left', label: 'Tipo', field: 'help', sortable: true },
  ];
  async function downloadXLS() {
  // Map the cuotaPayments data to match the column structure
  console.log({c: cuotaPayments.value})
  let formattedData = cuotaPayments.value.map(payment => ({

    Name: payment.studentInfo.Nombre,
    Apellido: payment.studentInfo.Apellido,
    Cedula: payment.studentInfo.ced,
    TotalQueSeDebe: payment.RemainingAmountDue.toFixed(2),
    Cuota: payment.Alias,
    help: payment.studentInfo.help ? 'Ayuda' : 'Regular',
    Vencimiento: payment.Periodo.to
  }))
  console.log({formattedData})
  formattedData = formattedData.sort((a,b) =>a.Vencimiento - b.Vencimiento);
  console.log({formattedData})
  // Convert the formatted data to a worksheet
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, 'report.xlsx');
}

  async function fetchData() {
    try {
        console.log('fetching', filters.value)
      const response = await api.post('/report/cuotapayments', { ...filters.value });
      cuotaPayments.value = response.data;
      console.log({response: cuotaPayments.value})
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
  
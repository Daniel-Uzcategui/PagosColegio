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
      :options="CuotasOption"
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
      :rows="transformedPayments"
      :columns="dynamicColumns"
      row-key="id"
      :loading="fetching"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">{{ props.row.studentInfo.Nombre }}</q-td>
          <q-td key="apellido" :props="props">{{ props.row.studentInfo.Apellido }}</q-td>
          <q-td key="ced" :props="props">{{ props.row.studentInfo.ced }}</q-td>
          <q-td v-for="alias in sortedAliases" :key="alias" :props="props">
            {{ props.row[alias]?.toFixed(2) || '-' }}
          </q-td>
          <q-td key="help" :props="props">{{  translateHelp(props.row.studentInfo.help) }}</q-td>
        </q-tr>
      </template>
    </q-table>
    <q-card class="text-center">
      <div>Total de estudiantes filtrados: {{ totalStudents }}</div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { api } from "src/boot/axios";
import { useCuotaStore } from "src/stores/Cuotas";
import * as XLSX from 'xlsx';
import HelpType from 'src/components/students/helpType.vue';
const fetching = ref(false)
const cuotaPayments = ref([]);
const CuotasOption = ref([]);
const filters = ref({
  cuotaIds: [],
  fromDate: null,
  paid: false,
  toDate: null,
  help: null
});

const totalStudents = computed(() => {
  const uniqueStudentIds = new Set(cuotaPayments.value.map(payment => payment.studentInfo._id));
  return uniqueStudentIds.size;
});


// Map Spanish months to numbers
const monthMapping = {
  septiembre: 1,
  octubre: 2,
  noviembre: 3,
  diciembre: 4,
  enero: 5,
  febrero: 6,
  marzo: 7,
  abril: 8,
  mayo: 9,
  junio: 10,
  julio: 11,
  agosto: 12
};
const helpTypes = ref([]);
async function getHelps () {
  try {
    const response = await api.get('/helps'); // Adjust the path based on your API structure
    helpTypes.value = response.data.map(help => ({ label: help.name, value: help._id }));
  } catch (error) {
    console.error('Error fetching help types:', error);
    Notify.create({ message: 'Error al cargar tipos de ayuda', color: 'red' });
  }
}
// Function to parse cuota alias and sort
function parseCuotaAlias(alias) {
  // Convert the alias to lowercase for case-insensitive comparison
  const lowerAlias = alias.toLowerCase();

  // Check for "Inscripcion" (case-insensitive)
  if (lowerAlias.startsWith("inscripcion")) {
    const yearRange = alias.match(/\d{4}-\d{4}/);
    if (yearRange) {
      const [startYear] = yearRange[0].split('-').map(Number);
      return { month: 0, year: startYear };  // Place Inscripción before September
    }
  }

  // Split the alias into month and year (assuming the month is case-insensitive)
  const [month, year] = lowerAlias.split(" ");

  // Make sure monthMapping works and returns correct month number
  const monthNumber = monthMapping[month];
  if (!monthNumber) {
    console.error(`Month "${month}" not found in monthMapping.`);
    return { month: 0, year: 0 };  // Return a fallback if month is invalid
  }

  return { month: monthNumber, year: parseInt(year) };
}



// Custom sort function for the aliases
const sortedAliases = computed(() => {
  const aliases = Array.from(new Set(cuotaPayments.value.map(payment => payment.Alias)));

  return aliases.sort((a, b) => {
    const cuotaA = parseCuotaAlias(a);
    const cuotaB = parseCuotaAlias(b);

    // Sort by year first, then by month
    if (cuotaA.year !== cuotaB.year) {
      return cuotaA.year - cuotaB.year;
    }
    return cuotaA.month - cuotaB.month;
  });
});

// Generate dynamic columns based on sorted aliases
const dynamicColumns = computed(() => [
  { name: 'name', required: true, label: 'Nombre', align: 'left', field: 'name', sortable: true },
  { name: 'apellido', align: 'left', label: 'Apellido', field: 'apellido', sortable: true },
  { name: 'ced', align: 'left', label: 'Cedula', field: 'ced', sortable: true },
  ...sortedAliases.value.map(alias => ({
    name: alias, align: 'left', label: alias, field: alias, sortable: true
  })),
  { name: 'help', align: 'left', label: 'Tipo', field: 'help' , sortable: true }
]);

const translateHelp = function (helpId) {
  return helpTypes.value.find(x => x.value === helpId)?.label || 'Regular'
}
// Transform payments data to spread RemainingAmountDue across columns
const transformedPayments = computed(() => {
  return cuotaPayments.value.map(payment => {
    const transformedPayment = {
      ...payment,
      ...sortedAliases.value.reduce((acc, alias) => {
        acc[alias] = payment.Alias === alias ? payment.RemainingAmountDue : null;
        return acc;
      }, {})
    };
    return transformedPayment;
  });
});

async function downloadXLS() {
  let formattedData = transformedPayments.value.map(payment => ({
    Name: payment.studentInfo.Nombre,
    Apellido: payment.studentInfo.Apellido,
    Cedula: payment.studentInfo.ced,
    ...sortedAliases.value.reduce((acc, alias) => {
      acc[alias] = payment[alias]?.toFixed(2) || '-';
      return acc;
    }, {}),
    help: payment.studentInfo.help ? 'Ayuda' : 'Regular'
  }));

  formattedData.push({
    Name: 'Total',
    Apellido: '',
    Cedula: '',
    help: '',
    Vencimiento: totalStudents.value
  });

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

onMounted(async () => {
  await fetchData();
  CuotasOption.value = await useCuotaStore().getAllQuotas();
  await getHelps()
});

watch(filters, async (newFilters) => {
  await fetchData();
}, { deep: true });

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
</script>

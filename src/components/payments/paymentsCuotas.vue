<template>
  <div>
    <q-table
      flat bordered
      ref="tableRef"
      title="Cuotas"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="serverPagination.loading"
      :filter="filter"
      binary-state-sort
      @request="(e)=> onRequest(e,pagination, serverPagination, rows)"
    >
      <template v-slot:top-right>
        <q-btn color="secondary" icon="add" label="Añadir cuotas a estudiantes" @click="addBatchCuotaDialog = true" />
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-Periodo="props">
      <q-td :props="props">
        <DateRangePicker
          :model-value="props.row.Periodo"
          @update:model-value="(newPeriodo) => updatePeriodo(props.row._id, newPeriodo)"
        />
      </q-td>
    </template>

      <template v-slot:body-cell-help="prop">
            <q-td>
                <HelpType :model-value="prop.row.help" @update:model-value="(e)=>updateHelp(prop.row._id, e)"></HelpType>

            </q-td>
        </template>
      <template v-slot:body-cell-Monto="prop">
            <q-td>
                <q-btn class="full-width" color="primary" icon="payments" :label="prop.row.Monto?.toFixed(2)" @click="Monto=prop.row.Monto; Motivo=''">
                    <q-tooltip class="bg-white text-primary">Editar Monto Inicial</q-tooltip>
                    <q-popup-proxy ref="popupProxy" transition-show="scale" transition-hide="scale">
                        <q-form class="q-ma-md" @submit="updateMonto(prop.row._id, Monto, Motivo)">
                            <MoneyInput v-model="Monto" ></MoneyInput>
                            <q-input v-model="Motivo" :rules="[val => val.length > 5]" label="Motivo*" />
                            <q-btn label="Submit" type="submit" color="primary" />
                        </q-form>
                    </q-popup-proxy>
                </q-btn>
            </q-td>
        </template>
      <template v-slot:body-cell-edit="props">
        <q-td class="column items-center">
          <q-btn label="Eliminar" color="negative" icon="delete" @click="deleteCuotaBatch(props.row)" />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="addBatchCuotaDialog">
      <AddBatchCuota @show-dialog="updateAddBatchCuotaDiag" />
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, toRef } from 'vue';
import { onRequest } from 'src/utils/onRequest.js';
import AddBatchCuota from './addCuotaBatch.vue';
import { useCuotaStore }  from 'stores/Cuotas';
import { format } from 'date-fns';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import MoneyInput from '../moneyInput.vue';
import HelpType from '../students/helpType.vue';
import DateRangePicker from '../houseHold/dateRangePicker.vue';
const $q = useQuasar();
const Monto = ref(0)
const Motivo = ref("")
const cuotaStore = useCuotaStore();
const addBatchCuotaDialog = ref(false)
const userMap = ref({})
const cuotaDefault = {
  Alias: '',
  Monto: 0,
  Periodo: { from: undefined, to: undefined },
  userId: ''
}
const cuotaRefEdit = ref(cuotaDefault)
function deleteCuotaBatch(cuota){
  // add prompt to confirm delete
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro que deseas eliminar la cuota ${cuota.Alias}?, esta acción no se puede deshacer, se eliminarán todas las cuotas de los estudiantes que tengan esta cuota.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    // OK
    const response = await cuotaStore.deleteCuotaBatch(cuota)
    if(response) {
      tableRef.value.requestServerInteraction()
    }
  })

}
async function updateMonto(id, Monto, Motivo) {
  await cuotaStore.updateMontoInCuota({id, Monto, Motivo}).then(() => {
    $q.notify({message: "Cuota Actualizada para los estudiantes asociados", color: 'positive'})
    tableRef.value.requestServerInteraction()
  })
}

async function updatePeriodo(id, newPeriodo) {
  try {
    // Ensure the date strings are properly formatted before sending them to the API
    const formattedPeriodo = {
      from: new Date(newPeriodo.from).toISOString().split('T')[0], // Converts to 'YYYY-MM-DD'
      to: new Date(newPeriodo.to).toISOString().split('T')[0],     // Converts to 'YYYY-MM-DD'
    };

    // Send the formatted dates to the API
    const response = await api.patch(`/cuotas/batch/${id}`, { Periodo: formattedPeriodo });

    // Notify success
    $q.notify({ message: 'Periodo actualizado', color: 'positive' });
  } catch (error) {
    // Notify error
    $q.notify({ message: 'Error updating Periodo', color: 'negative' });
    console.error(error);
  }
}

async function updateHelp (id, help) {
  const response = await api.patch('/cuotas/batch/' + id, {help})
      return response.data;

}
function updateAddBatchCuotaDiag (value) {
  console.log('updateadd', value)
  addBatchCuotaDialog.value = value
  if (value === false) {
    cuotaRefEdit.value = cuotaDefault
  }
  tableRef.value.requestServerInteraction()
}
const formatDate = (value) => {
if (!value) return '';
return format(new Date(value), 'dd/MM/yyyy');
};
const columns = [
  { "name": "Alias", "label": "ALIAS", "field": "Alias", "align": "left", "sortable": true },
  { "name": "Monto", "label": "MONTO", "field": "Monto", "align": "center", "sortable": true },
  { "name": "Periodo", "label": "PERIODO", "field": "Periodo", "align": "center", "sortable": true },
  { "name": "help", "label": "Tipo de ayuda", "field": "help", "align": "center", "sortable": true },
  { name: 'userId', required: true, label: 'Creado por', align: 'left', field: getEmail },
  { name: 'edit', label: 'Eliminar', align: 'center', sortable: false },
]
function getEmail(row) {
try {
return userMap.value[row.userId].email
} catch (error) {
return ""
}
}
const tableRef = ref()
const rows = toRef(cuotaStore, 'list')
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
  defaultColumn: "Alias",
  lastDocument: null,
  loading: false,
  extraFilter: undefined
})
async function fetchUsers() {
const response = await api.get('/users');
// Create a map of users
for (const user of response.data) {
userMap.value[user._id] = user;
}
}
onMounted(async() => {
  // get initial data from server (1st page)
  await fetchUsers()
  tableRef.value.requestServerInteraction()
})
</script>

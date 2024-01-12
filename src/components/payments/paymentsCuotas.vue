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
          <q-list separator>
            <q-item clickable v-ripple>
              <q-item-section>{{formatDate(props.value.from)}}</q-item-section>
              <q-item-section>{{formatDate(props.value.to)}}</q-item-section>
            </q-item>
          </q-list>
        </q-td>
      </template>
      <template v-slot:body-cell-edit="props">
        <q-td class="column items-center">
          <q-btn label="Eliminar" color="negative" icon="delete" @click="deleteCuotaBatch(props.row)" />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="addBatchCuotaDialog">
      <AddBatchCuota :show-dialog="addBatchCuotaDialog" @update:show-dialog="updateAddBatchCuotaDiag" />
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
const $q = useQuasar();
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
function updateAddBatchCuotaDiag (value) {
  addBatchCuotaDialog.value = value
  if (value === false) {
    cuotaRefEdit.value = cuotaDefault
  }
}
const formatDate = (value) => {
if (!value) return '';
return format(new Date(value), 'dd/MM/yyyy');
};
const columns = [
  { "name": "Alias", "label": "ALIAS", "field": "Alias", "align": "left", "sortable": true },
  { "name": "Monto", "label": "MONTO", "field": "Monto", "align": "left", "sortable": true },
  { "name": "Periodo", "label": "PERIODO", "field": "Periodo", "align": "center", "sortable": true },
  { name: 'userId', required: true, label: 'Usuario Caja', align: 'left', field: getEmail },
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

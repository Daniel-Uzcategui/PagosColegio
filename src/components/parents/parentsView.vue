<template>
    <div>
    <q-table
      flat bordered
      ref="tableRef"
      title="Representantes"
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
        <q-btn color="primary" icon="add" label="Añadir representante" @click="addParentDialog = true" />
        <q-input debounce="500" class="q-pl-md" borderless dense  v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-edit="props">
        <q-td>
          <q-btn label="Editar" color="secondary" icon="edit" @click="editParent(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-Nombre="props">
        <q-td>
          <q-btn class="full-width" color="primary" no-caps >
            {{ props.row.Nombre }}
          <q-menu auto-close anchor="bottom right" self="top right">
            <q-list>
              <q-item clickable @click="getParentInfo(props.row)">
                <q-item-section>Ver cuotas pendientes</q-item-section>
              </q-item>
              <q-item clickable @click="viewPastPayments(props.row)">
                <q-item-section>Ver pagos realizados</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        </q-td>
      </template>

    </q-table>
    <AddParent @Submitted="tableRef.requestServerInteraction()" v-if="addParentDialog" :show-dialog="addParentDialog" @update:show-dialog="updateAddParentDiag" :parent="parentRefEdit" />
    </div>
  </template>
  <script setup>
  import { ref, onMounted } from 'vue';
  import { onRequest } from 'src/utils/onRequest.js';
  import AddParent from './addParent.vue';
  const parentHistoryOpen = ref(false)
  const parentOpen = ref(false)
  const addParentDialog = ref(false)
  const parentRef = ref()
  const parentDefault = {
        Nombre: '',
        Apellido: '',
        Telefono: '',
        Email: '',
        'ced': 0,
      }
  const parentRefEdit = ref(parentDefault)
  function editParent(parent){
    parentRefEdit.value = parent
    addParentDialog.value = true
  }
  function updateAddParentDiag (value) {
    addParentDialog.value = value
    if (value === false) {
      parentRefEdit.value = parentDefault
    }
  }
  function getParentInfo(parent) {
    parentRef.value = parent
    parentOpen.value = true
  }
  function viewPastPayments(parent) {
    parentRef.value = parent
    parentHistoryOpen.value = true
  }
  const columns = [
    { "name": "Nombre", "label": "NOMBRE", "field": "Nombre", "align": "left", "sortable": true },
    { "name": "Apellido", "label": "APELLIDO", "field": "Apellido", "align": "left", "sortable": true },
    { "name": "ced", "label": "CÉDULA DE IDENTIDAD", "field": "ced", "align": "left", "sortable": true },
    { "name": "Telefono", "label": "TELEFONO", "field": "Telefono", "align": "left", "sortable": true },
    { "name": "Email", "label": "EMAIL", "field": "Email", "align": "left", "sortable": true },
    { name: 'edit', label: 'Editar', align: 'center', sortable: false },
  ]
  const tableRef = ref()
    const rows = ref([])
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
      callerCollection: "parents",
      defaultColumn: "Apellido",
      lastDocument: null,
      loading: false
    })
    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })
  </script>
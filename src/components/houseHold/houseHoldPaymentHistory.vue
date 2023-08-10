<template>
    <q-dialog
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
      full-width
      full-height
      :model-value="houseHoldHistoryOpen"
      @hide="$emit('update:houseHoldHistoryOpen')"
    >
      <q-table
        flat
        bordered
        ref="tableRef"
        title="Pagos"
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
        <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
        </template>
        <template v-slot:body-cell-edit="props">
          <q-td>
            <q-btn
              label="Editar"
              color="secondary"
              icon="edit"
              @click="editPayment(props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-Nombre="props">
          <q-td>
            <q-btn
              class="full-width"
              color="primary"
              no-caps
              @click="getPaymentInfo(props.row)"
            >
              {{ props.row.Nombre}}
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-dialog>
  </template>
  <script setup>
  import { ref, toRef, watchEffect } from 'vue';
  import { onRequest } from 'src/utils/onRequest.js';
  const maximizedToggle = ref(true)
  const props = defineProps(['houseHold', 'houseHoldHistoryOpen'])
  const studentOpen = ref(false)
  const addPaymentDialog = ref(false)
  const studentRef = ref()
  const studentRefEdit = ref()
  function editPayment(student){
    studentRefEdit.value = student
    addPaymentDialog.value = true
  }
  function getPaymentInfo(student) {
    studentRef.value = student
    studentOpen.value = true
  }
  const columns = [
    { "name": "Fecha", "label": "Fecha", "field": "Fecha", "align": "left", "sortable": true },
    { "name": "Monto", "label": "Monto", "field": "Monto", "align": "left", "sortable": true },
    { "name": "StudentId", "label": "Cédula estudiante", "field": "StudentId", "align": "left", "sortable": true },
    { "name": "Referencia", "label": "Referencia", "field": "Referencia", "align": "left", "sortable": true },
    { "name": "CuotaName", "label": "Cuota", "field": "CuotaName", "align": "left", "sortable": true },
    { name: 'edit', label: 'Edit', align: 'center', sortable: false },
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
      callerCollection: "houseHolds/" + props.houseHold.id +"/payments",
      defaultColumn: "dateIn",
      lastDocument: null,
      loading: false,
      extraFilter: undefined
    })
    watchEffect(() =>{
      console.log(tableRef.value)
      if (tableRef.value) {
        tableRef.value.requestServerInteraction()
      }
    })
  </script>
  
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
        v-model:selected="selectedPayments"
        selection="multiple"
        binary-state-sort
        @request="(e)=> onRequest(e,pagination, serverPagination, rows)"
      >
        <template v-slot:top-right>
        <q-input class="q-pl-md" borderless dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
        </template>
        <template v-slot:body-cell-Fecha="props">
          <q-td>
            {{ props.row.fechaPago.toDate().toLocaleDateString('es-VE') }}
          </q-td>
        </template>
        <template v-slot:body-cell-FechaEntry="props">
          <q-td>
            {{ props.row.dateIn.toDate().toLocaleDateString('es-VE') }}
          </q-td>
        </template>
      </q-table>
    </q-dialog>
  </template>
  <script setup>
  import { ref, watchEffect } from 'vue';
  import { onRequest } from 'src/utils/onRequest.js';
  // import PrintHolder from './printHolder.vue';
  const maximizedToggle = ref(true)
  const props = defineProps(['houseHold', 'houseHoldHistoryOpen'])
  const selectedPayments = ref([])

  const columns = [
    { "name": "Fecha", "label": "Fecha", "field": row => row.fechaPago.toDate(), "align": "left", "sortable": true },
    { "name": "FechaEntry", "label": "Fecha Registro", "field": row => row.dateIn.toDate(), "align": "left", "sortable": true },
    { "name": "Monto", "label": "Monto$", "field": (row) => row.Monto.toFixed(2), "align": "left", "sortable": true },
    { "name": "MontoBS", "label": "MontoBS", "field": "MontoTotalBS", "align": "left", "sortable": true },
    { "name": "TasaBCV", "label": "TasaBCV", "field": "TasaBCV", "align": "left", "sortable": true },
    { "name": "cuotaInfo.student.ced", "label": "Cédula estudiante", "field": row => row.cuotaInfo.student.ced, "align": "left", "sortable": true },
    { "name": "Referencia", "label": "Referencia", "field": "Referencia", "align": "left", "sortable": true },
    { "name": "CuotaName", "label": "Cuota", field: row=> row.cuotaInfo.Alias, "align": "left", "sortable": true },
    { "name": "Motivo", "label": "Motivo", "field": "Motivo", "align": "left", "sortable": true },
    
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
  
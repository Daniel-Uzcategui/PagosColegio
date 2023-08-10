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
        <div class="row justify-end full-width">
          <q-btn color="primary" icon="add" label="Añadir" @click="getCuotaInfo()" />
          <q-btn size="md" flat icon="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date minimal @update:model-value="removeRange" :model-value="filter" range>
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </div>
        <div>
          <p>Filtros:</p>
          <q-option-group
            v-model="group"
            color="secondary"
            :options="options"
            inline
            @update:model-value="changeFilter"
          />
        </div>
      </template>
      <template v-slot:body-cell-PeriodoFrom="props">
        <q-btn class="full-width" color="primary" no-caps @click="getCuotaInfo(props.row)"> {{ toDateLocate(props.row.Periodo.from)}} </q-btn>
      </template>

    </q-table>
    <cuotasEdit @hide="editCuota = undefined" v-model="cuotaOpen" :editCuota="editCuota" @updatedOrCreated="tableRef.requestServerInteraction()" />
    </div>
  </template>
  <script setup>
  import { ref, onMounted } from 'vue';
  import cuotasEdit from './cuotasEdit.vue';
  import { onRequest } from 'src/utils/onRequest';
  const tableRef = ref()
  const cuotaOpen = ref(false)
  const editCuota = ref()
  const rows = ref([])
  const group = ref()
  const options = ref([
        {
          label: 'Todos',
          value: 'All'
        },
        {
          label: 'A',
          value: 'A'
        },
        {
          label: 'B',
          value: 'B'
        },
        {
          label: 'C',
          value: 'C'
        },
        {
          label: 'D',
          value: 'D'
        }
      ])
  function changeFilter (value) {
    console.log({value})
    if (value === 'All') {
      serverPagination.value.extraFilter = undefined
    } else {
      serverPagination.value.extraFilter = {
        key: 'Tipo',
        value: value,
        condition: '=='
      }
    }
    tableRef.value.requestServerInteraction()

  }
  function getCuotaInfo(cuota) {
    console.log({cuota})
    cuotaOpen.value = true
    if (cuota) {
        editCuota.value = cuota
        return
    }
    editCuota.value = null
  }
  const columns = [
    { "name": "PeriodoFrom", "label": "Periodo Desde", "field": row => toDateLocate(row.Periodo.from), "align": "left", "sortable": true },
    { "name": "PeriodoTo", "label": "Periodo Hasta", "field": row => toDateLocate(row.Periodo.to), "align": "left", "sortable": true },
    { "name": "Monto", "label": "Monto", "field": "Monto", "align": "left", "sortable": true },
    { "name": "Tipo", "label": "Tipo", "field": "Tipo", "align": "left", "sortable": true },
  ]
  function toDateLocate (date) {
    return date.toDate().toLocaleDateString("es-MX")
  }
  function removeRange(value,reason) {
    console.log(value,reason)
    if (reason === 'remove-range') {
      console.log('Setting value')
      return filter.value = ''
    }
    filter.value = value
  }
    const filter = ref('')
    const pagination = ref({
      sortBy: 'desc',
      descending: true,
      page: 1,
      rowsPerPage: 3,
      rowsNumber: 10,
      first: '',
      last: ''
    })
    const serverPagination = ref({
      callerCollection: "cuotas",
      defaultColumn: "PeriodoFrom",
      lastDocument: null,
      loading: false,
      extraFilter: undefined
    })
    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })
  </script>
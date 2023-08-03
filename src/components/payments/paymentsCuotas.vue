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
      :loading="loading"
      :filter="filter"
      binary-state-sort
      @request="onRequest"
    >
      <template v-slot:top>
        <div class="row justify-around full-width">
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
              <template v-slot:append>
                  <q-icon name="search" />
              </template>
          </q-input>
          <q-btn color="primary" icon="add" label="Añadir" @click="getCuotaInfo()" />
        </div>
      </template>
      <template v-slot:body-cell-PeriodoFrom="props">
        <q-btn class="full-width" color="primary" no-caps @click="getCuotaInfo(props.row)"> {{ toDateLocate(props.row.Periodo.from)}} </q-btn>
      </template>

    </q-table>
    <cuotasEdit @hide="editCuota = undefined" v-model="cuotaOpen" :editCuota="editCuota" />
    </div>
  </template>
  <script setup>
  import { computed, ref, onMounted } from 'vue';
  import { collection,query, orderBy, limit,getCountFromServer} from "firebase/firestore";
  import { db } from "src/boot/vuefire";
  import { useCollection } from 'vuefire'
  import cuotasEdit from './cuotasEdit.vue';
  const tableRef = ref()
  const cuotaOpen = ref(false)
  const editCuota = ref()
  const sort = ref('Periodo.from')
  const descending = ref('desc')
  const filt = ref('')
  const count = ref(10)
  const que = computed(() => query(collection(db, "cuotas"),
    orderBy(sort.value, descending.value),
    limit(count.value))
  )
  const rows = ref([])
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
    { "name": "tipo", "label": "Tipo", "field": "Tipo", "align": "left", "sortable": true },
  ]
  function toDateLocate (date) {
    return date.toDate().toLocaleDateString("es-MX")
  }
    const filter = ref('')
    const loading = ref(false)
    async function fetchFromServer (startRow, cou, filter, sortBy, desc) {
      sort.value = sortBy === 'desc' ? 'Periodo.from' : sortBy
      descending.value = desc ? 'desc' : 'asc'
      count.value = cou
      filt.value = filter.toUpperCase()
    }
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 3,
      rowsNumber: 10,
      first: '',
      last: ''
    })
    async function onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      console.log({ prp: props })
      const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage
      const filter = props.filter
      var coll = collection(db, "cuotas")
      const snapshot = await getCountFromServer(coll)
      loading.value = true

      // emulate server
        // update rowsCount with appropriate value
        pagination.value.rowsNumber = snapshot.data().count

        // get all rows if "All" (0) is selected

        // calculate starting row of data
        const startRow = (page - 1) * rowsPerPage

        // fetch data from "server"
        const returnedData = await fetchFromServer(startRow, fetchCount, filter, sortBy, descending)
        console.log({returnedData})
        // clear out existing data and add new
        // rows.value.splice(0, rows.value.length, ...returnedData)

        // don't forget to update local pagination object
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        pagination.value.sortBy = sortBy
        pagination.value.descending = descending

        // ...and turn of loading indicator
        loading.value = false
    }
    onMounted(() => {
      // get initial data from server (1st page)
      useCollection(que, {target: rows})
    //   tableRef.value.requestServerInteraction()
    })
  </script>
<template>
    <div>
    <q-table
      flat bordered
      ref="tableRef"
      title="Alumnos"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      binary-state-sort
      @request="onRequest"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-Nombre="props">
        <q-btn class="full-width" color="primary" no-caps @click="getStudentInfo(props.row)"> {{ props.row.Nombre}} </q-btn>
      </template>

    </q-table>
    <StudentPayments v-model="studentOpen" :student="studentRef" />
    </div>
  </template>
  <script setup>
  import { useStudentStore } from 'src/stores/Students';
  import { computed, ref, onMounted } from 'vue';
  import { collection, doc, setDoc, query, orderBy, limit, startAt, startAfter, getDocs, getCountFromServer, where, endAt } from "firebase/firestore";
  import { db } from "src/boot/vuefire";
import StudentPayments from './studentPayments.vue';
  //
  const studentOpen = ref(false)
  const studentRef = ref()
  function getStudentInfo(student) {
    studentRef.value = student
    studentOpen.value = true
  }
  const columns = [
    { "name": "Nombre", "label": "NOMBRE", "field": "Nombre", "align": "left", "sortable": true },
    { "name": "Apellido", "label": "APELLIDO", "field": "Apellido", "align": "left", "sortable": true },
    { "name": "Cédula de identidad", "label": "CÉDULA DE IDENTIDAD", "field": "Cédula de identidad", "align": "left", "sortable": true },
    { "name": "Sección", "label": "SECCIÓN", "field": "Sección", "align": "left", "sortable": true },
    { "name": "Grado", "label": "GRADO", "field": "Grado", "align": "left", "sortable": true },
  ]

  const tableRef = ref()
    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    // emulate ajax call
    // SELECT * FROM ... WHERE...LIMIT...
    async function fetchFromServer(startRow, count, filter, sortBy, descending) {
      let sort = sortBy === 'desc' ? 'Apellido' : sortBy;
      let docData = [];
      var coll = collection(db, "students");
      let filt = filter.toUpperCase();
      const q = query(coll, orderBy(sort, descending ? 'desc' : 'asc'), where(sort, '>=', filt), where(sort, '<=', filt + '~'), limit(10));
      const docs = await getDocs(q);
      docs.forEach((doc) => {
        docData.push(doc.data());
      });
      return docData;
    }

    // emulate 'SELECT count(*) FROM ...WHERE...'
    function getRowsNumberCount (filter) {
      if (!filter) {
        return originalRows.length
      }
      let count = 0
      originalRows.forEach(treat => {
        if (treat.name.includes(filter)) {
          ++count
        }
      })
      return count
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
    async function onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;
      const filter = props.filter;
      var coll = collection(db, "students");
      const snapshot = await getCountFromServer(coll);
      loading.value = true;

      // update rowsCount with appropriate value
      pagination.value.rowsNumber = snapshot.data().count;

      // calculate starting row of data
      const startRow = (page - 1) * rowsPerPage;

      // fetch data from "server"
      const returnedData = await fetchFromServer(startRow, fetchCount, filter, sortBy, descending);

      // clear out existing data and add new
      rows.value.splice(0, rows.value.length, ...returnedData);

      // don't forget to update local pagination object
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
      pagination.value.sortBy = sortBy;
      pagination.value.descending = descending;

      // ...and turn of loading indicator
      loading.value = false;
    }
    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })
  </script>
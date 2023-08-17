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
      :loading="serverPagination.loading"
      :filter="filter"
      binary-state-sort
      @request="(e)=> onRequest(e,pagination, serverPagination, rows)"
    >
      <template v-slot:top-right>
        <!-- <q-select style="min-width: 300px;" v-model="Padres" :options="parents" filled use-input
            :option-label="(parent) => parent.Nombre + ' ' + parent.Apellido"
            :option-value="(value) => value.id"
            label="Representates"
            emit-value
            map-options
            @update:model-value="setFilter"
            :filter="(options, filter) => options.filter(option => option.Apellido.toLowerCase().includes(filter.toLowerCase()))" /> -->
        <q-btn color="primary" icon="add" label="Añadir estudiante" @click="addStudentDialog = true" />
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-edit="props">
        <q-td>
          <q-btn label="Editar" color="secondary" icon="edit" @click="editStudent(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-Nombre="props">
        <q-td>
        <q-btn class="full-width" color="primary" no-caps @click="getStudentInfo(props.row)"> {{ props.row.Nombre}} </q-btn>
      </q-td>
      </template>

    </q-table>
    <HouseHoldPayments v-if="studentOpen" v-model:show-dialog="studentOpen" :houseHold="houseHoldRef" />
    <AddStudent v-if="addStudentDialog" :show-dialog="addStudentDialog" @update:show-dialog="updateAddStudentDiag" :student="studentRefEdit" />
    </div>
  </template>
  <script setup>
  import { ref, onMounted } from 'vue';

import { onRequest } from 'src/utils/onRequest.js';
import AddStudent from './addStudent.vue';
// import { useCollection } from 'vuefire';
// import { collection } from 'firebase/firestore';
// import { db } from 'src/boot/vuefire';
import { yearsByNumber } from 'src/utils/schoolYear.js';
import HouseHoldPayments from '../houseHold/houseHoldPayments.vue';
  // const parents = useCollection(collection(db, 'parents'));
  // const Padres = ref(null)
  const studentOpen = ref(false)
  const addStudentDialog = ref(false)
  const studentRef = ref()
  const studentDefault = {
        Nombre: '',
        Apellido: '',
        'ced': 0,
        Sección: '',
        Grado: 1,
        houseHold: '',
        Discount: 1
      }
  const studentRefEdit = ref(studentDefault)
  function editStudent(student){
    studentRefEdit.value = student
    addStudentDialog.value = true
  }
  function updateAddStudentDiag (value) {
    addStudentDialog.value = value
    if (value === false) {
      studentRefEdit.value = studentDefault
    }
  }
  const houseHoldRef = ref({
    id: ''
  })
  function getStudentInfo(student) {
    studentRef.value = student
    houseHoldRef.value.id = student.houseHold
    studentOpen.value = true
  }
  function setFilter (value) {
    console.log({value})
    if (value === null) {
      serverPagination.value.extraFilter = undefined
    } else {
      serverPagination.value.extraFilter = {
        key: 'houseHold',
        value: value,
        condition: '=='
      }
    }
    tableRef.value.requestServerInteraction()

  }
  const columns = [
    { "name": "Nombre", "label": "NOMBRE", "field": "Nombre", "align": "left", "sortable": true },
    { "name": "Apellido", "label": "APELLIDO", "field": "Apellido", "align": "left", "sortable": true },
    { "name": "ced", "label": "CÉDULA DE IDENTIDAD", "field": "ced", "align": "left", "sortable": true },
    { "name": "Sección", "label": "SECCIÓN", "field": "Sección", "align": "left", "sortable": true },
    { "name": "Grado", "label": "GRADO", "field": (row) => yearsByNumber.get(row.Grado), "align": "left", "sortable": true },
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
      callerCollection: "students",
      defaultColumn: "Apellido",
      lastDocument: null,
      loading: false,
      extraFilter: undefined
    })
    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })
  </script>
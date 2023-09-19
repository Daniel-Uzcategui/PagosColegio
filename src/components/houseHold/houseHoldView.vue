<template>
  <div>
    <q-table
      flat bordered
      ref="tableRef"
      title="Familias"
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
        <calculateOwed />
        <q-btn color="primary" icon="add" label="Añadir Familia" @click="addhouseHoldDialog = true" />
        <q-input class="q-pl-md" borderless dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:top-row>
        <totalOwed/>
      </template>
      <template v-slot:body-cell-edit="props">
        <q-td>
          <q-btn label="Editar" color="secondary" icon="edit" @click="edithouseHold(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-contactos="props">
        <q-td>
          <q-btn label="Ver" no-caps color="green" @click="contactoshouseHold(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-Apellido="props">
        <q-td>
          <q-btn class="full-width" color="primary" no-caps >
            {{ props.row.Apellido }}
          <q-menu auto-close anchor="bottom right" self="top right">
            <q-list>
              <q-item clickable @click="gethouseHoldInfo(props.row)">
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
    <ParentContacts  v-if="contactosOpen" v-model:openDiag="contactosOpen" :houseHold="houseHoldRef" />
    <houseHoldPayments @submitted="submittedPayments" v-if="houseHoldOpen" v-model:show-dialog="houseHoldOpen" :houseHold="houseHoldRef" />
      <houseHoldPaymentHistory v-if="houseHoldHistoryOpen" v-model:houseHoldHistoryOpen="houseHoldHistoryOpen" :houseHold="houseHoldRef" />
    <AddhouseHold @submitted="submittedPayments" v-if="addhouseHoldDialog" :show-dialog="addhouseHoldDialog" @update:show-dialog="updateAddhouseHoldDiag" :houseHold="houseHoldRefEdit" />
  </div>
</template>
<script setup>
import totalOwed from '../accountig/totalOwed.vue'
import { ref, onMounted } from 'vue';
import houseHoldPayments from './houseHoldPayments.vue';
import { onRequest } from 'src/utils/onRequest.js';
import AddhouseHold from './addHouseHold.vue';
import calculateOwed from 'src/components/accountig/caculateOwed.vue'
import houseHoldPaymentHistory from './houseHoldPaymentHistory.vue';
import ParentContacts from './parentContacts.vue';
  const houseHoldHistoryOpen = ref(false)
  const houseHoldOpen = ref(false)
  const contactosOpen = ref(false)
  const addhouseHoldDialog = ref(false)
  const houseHoldRef = ref()
  const houseHoldRefEdit = ref({Apellido: '', Padres: []})
  function edithouseHold(houseHold){
    houseHoldRefEdit.value = houseHold
    addhouseHoldDialog.value = true
  }
  function updateAddhouseHoldDiag (value) {
    addhouseHoldDialog.value = value
    if (value === false) {
      houseHoldRefEdit.value = {Apellido: '', Padres: []}
    }
  }
  function contactoshouseHold (houseHold) {
    houseHoldRef.value = houseHold
    contactosOpen.value = true
  }
  function gethouseHoldInfo(houseHold) {
    houseHoldRef.value = houseHold
    houseHoldOpen.value = true
  }
  function viewPastPayments(houseHold) {
    houseHoldRef.value = houseHold
    houseHoldHistoryOpen.value = true
  }
  const columns = [
    { "name": "Apellido", "label": "APELLIDO", "field": "Apellido", "align": "left", "sortable": true },
    { name: 'contactos', label: 'Contactos', align: 'center' },
    { name: 'amountOwed', label: 'Monto', field: 'amountOwed', format: val => `$ ${val.toFixed(2)}`, align: 'left' },
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
      callerCollection: "houseHolds",
      defaultColumn: "Apellido",
      lastDocument: null,
      loading: false
    })
    async function submittedPayments () {
    setTimeout(() => {
      tableRef.value.requestServerInteraction()
      }, 1000);
    }
    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })
  </script>
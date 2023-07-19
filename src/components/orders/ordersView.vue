<template>
    <div>
      <q-table
        :rows="list"
        row-key="id"
        bordered
        grid
        hide-header
        selection="multiple"
        v-model:selected="selected"
      >
      <template v-slot:top-right>
        <q-btn color="secondary" no-caps icon="print" label="Imprimir Selección" @click="printSelectedRecursively(0)" />
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card  flat bordered class="cursor-pointer">
            <q-card-section class="row justify-between">
              <q-checkbox dense v-model="props.selected" :label="'Mesa #' + props.row.table + '   ' + getHours(props.row.dateIn)" />
              <q-btn color="primary" icon="print" flat @click="printOrderAndSaveDevice(props.row)" />
            </q-card-section>
            <q-list bordered>
              <q-item v-for="(item, index) of props.row.cart" :key="index">
                <q-item-section>{{item.name}}</q-item-section>
                <q-item-section side>x{{item.quantity}}</q-item-section>
              </q-item>
            </q-list>
            <q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
    </div>
  </template>
  <script setup>
  import { useOrderStore } from 'src/stores/Orders';
  import { computed, ref, watch } from 'vue';
  import { printRequest } from '../printer/printer.js'
  import { useUsersStore } from 'src/stores/User.js';
  import { logoCode } from 'components/printer/logoCode.js'
  import { printContent, getHours} from './ordersUtils.js'
  //
  const selected = ref([])
  const userStore = useUsersStore()
  const orderStore = useOrderStore()
  const last = computed(()=> orderStore.lastOrder)
  watch(() => last.value?.[0].id, (x, old) => !old ? printRequest(logoCode,userStore.device) : printOrderAndSaveDevice(last.value[0]))
  const list = computed( () => orderStore.list)
  async function printOrderAndSaveDevice (order) {
    userStore.device.gatt = await printContent(order, userStore.device).then(()=> orderStore.set({id: order.id, print: true}))
  }
  async function printSelectedRecursively (index = 0) {
    if (selected.value[index] === undefined) {return}
    let indx = index + 1
    return printOrderAndSaveDevice(selected.value[index]).then(async() => printSelectedRecursively(indx)).then(()=> orderStore.set({id: selected.value[index].id, print: true}))
  }
  </script>
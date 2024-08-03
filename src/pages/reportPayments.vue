<template>
    <div>
      <q-tabs
        v-model="tab"
        class="text-secondary"
      >
        <q-tab name="cuota" icon="mail" label="Por Cuotas" />
        <q-tab name="detail" icon="alarm" label="Detalle" />
      </q-tabs>
      <reportCuotaDetail v-if="tab==='detail'" />
      <reportCuota v-if="tab==='cuota'" />
    </div>
  </template>
  
  <script setup>
  import {ref} from 'vue'
  import reportCuotaDetail from './reportCuotaDetail.vue';
  import reportCuota from './reportCuota.vue'
  const tab = ref('cuota')
  </script>
  
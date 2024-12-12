<template>
    <div>
      <q-tabs
        v-model="tab"
        class="text-secondary"
      >
        <q-tab name="cuota" icon="mail" label="Por Cuotas" />
        <q-tab name="detail" icon="details" label="Detalle" />
        <q-tab name="detaiPîvot" icon="pivot_table_chart" label="Detalle Pivot" />
      </q-tabs>
      <reportCuotaDetail v-if="tab==='detail'" />
      <reportCuota v-if="tab==='cuota'" />
      <ReportCuotaHelp v-if="tab==='cuota'"></ReportCuotaHelp>
      <ReportCuotaDetailSpread v-if="tab==='detaiPîvot'" />
    </div>
  </template>
  
  <script setup>
  import {ref} from 'vue'
  import reportCuotaDetail from './reportCuotaDetail.vue';
  import reportCuota from './reportCuota.vue'
import ReportCuotaDetailSpread from './reportCuotaDetailSpread.vue';
import ReportCuotaHelp from './reportCuotaHelp.vue';
  const tab = ref('cuota')
  </script>
  
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="text-grey-9" elevated>
      <ToolbarIndex></ToolbarIndex>
      <q-tabs v-model="tab" align="center" class="text-white">
        <q-route-tab name="cuotas" label="Cuotas" to="/cuotas" />
        <q-route-tab name="students" label="Estudiantes" to="/students" />
        <q-route-tab name="reportcaja" label="Reporte Caja" to="/reportcaja" />
        <q-route-tab name="reportpayments" label="Reporte Cuotas" to="/reportpayments" />
        <q-route-tab name="logs" label="Logs" to="/logs" />
        <q-route-tab name="users" label="Usuarios" to="/users" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
  import { ref } from "vue";
  import ToolbarIndex from "src/components/ToolBar/ToolbarIndex.vue";
  const leftDrawerOpen = ref(false);
  const tab = ref('students')
  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  }
</script>

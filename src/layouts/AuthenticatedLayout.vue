<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="text-grey-9" elevated>
      <ToolbarIndex></ToolbarIndex>
      <q-tabs v-model="tab" align="center" class="text-white">
        <q-route-tab name="cuotas" label="Cuotas" to="/cuotas" />
        <q-route-tab name="parents" label="Representantes" to="/parents" />
        <q-route-tab name="houseHold" label="Familias" to="/houseHold" />
        <q-route-tab name="students" label="Estudiantes" to="/students" />
        <q-route-tab name="reportcaja" label="Reporte Caja" to="/reportcaja" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
  import { ref } from "vue";
  import { getDefaultProvider } from "@vueauth/core";
  import ToolbarIndex from "src/components/ToolBar/ToolbarIndex.vue";
  const leftDrawerOpen = ref(false);
  const tab = ref('students')
  const authProvider = getDefaultProvider();
  const authProviderUpperFirst =
    authProvider.charAt(0).toUpperCase() + authProvider.slice(1);
  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  }
</script>

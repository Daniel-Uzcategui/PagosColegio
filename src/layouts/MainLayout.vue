<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          My App
        </q-toolbar-title>
      </q-toolbar>
      <q-tabs v-model="tab" align="center" class="text-white">
        <q-route-tab name="cuotas" label="Cuotas" to="/cuotas" />
        <q-route-tab name="parents" label="Parents" to="/parents" />
        <q-route-tab name="houseHold" label="House Hold" to="/houseHold" />
        <q-route-tab name="students" label="Students" to="/students" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {ref} from 'vue'
const tab = ref("cuotas")
</script>

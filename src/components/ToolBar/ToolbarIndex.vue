<template>
  <q-toolbar class="text-primary row justify-between">
    <q-card
      :class="{ 'border-card': !$q.screen.lt.sm }"
      flat
      class="row q-pr-md q-pl-md"
    >
      <div class="text-h5 text-weight-bold self-end cursor-pointer">
        Restaurant
      </div>
    </q-card>
    <q-card
      :class="{ 'border-card': !$q.screen.lt.sm }"
      flat
      class="row q-pr-md q-pl-md text-accent"
    >
      <q-btn icon="person" round flat>
        <AuthAccountMenu />
      </q-btn>

      <!-- <q-btn flat round dense icon="more_vert" /> -->
    </q-card>
  </q-toolbar>
</template>
<script setup>
import AuthAccountMenu from "src/auth/components/AccountMenu/AccountMenu.vue";
;
</script>

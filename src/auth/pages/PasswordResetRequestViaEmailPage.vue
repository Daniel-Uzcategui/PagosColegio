<script setup>
import PasswordResetRequestCard from "src/auth/components/PasswordResetRequestCard.vue";
</script>

<template>
  <q-page class="column items-center">
    <div class="text-h5 text-bold q-ma-md">Password Reset</div>
    <div class="text-center">
      <PasswordResetRequestCard />
      <q-btn
        class="full-width q-mt-md"
        color="grey-6"
        label="back"
        flat
        :to="{ name: 'auth.login' }"
      />
    </div>
  </q-page>
</template>

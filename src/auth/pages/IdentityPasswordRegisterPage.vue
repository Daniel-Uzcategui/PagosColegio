<script setup>
import AuthRegisterCard from "src/auth/components/RegisterCard.vue";
</script>

<template>
  <q-page class="column items-center">
    <div class="text-h5 text-bold q-ma-md">Register</div>
    <div class="logincard column items-center">
      <AuthRegisterCard />
      <p>
        By registering in you’re accepting the
        <q-btn flat no-caps dense class="link text-bold"
          >terms of service</q-btn
        >
      </p>
      <q-btn
        dense
        class="full-width q-mt-md"
        color="grey-6"
        label="Already have an account?"
        flat
        :to="{ name: 'auth.login' }"
      ></q-btn>
    </div>
  </q-page>
</template>

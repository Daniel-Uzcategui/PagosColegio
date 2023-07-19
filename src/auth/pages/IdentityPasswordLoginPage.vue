<template>
  <q-page class="column items-center">
    <div class="logincard column items-center">
      <div class="text-h5 text-bold q-ma-md">Sign In</div>
      <AuthLoginCard />
      <div class>Don't Have an account yet?</div>
      <q-btn
        flat
        no-caps
        class="link text-bold"
        :to="{ name: 'auth.register' }"
      >
        Get started here for free
      </q-btn>
      <p>
        By signing in you’re accepting the
        <q-btn flat no-caps dense class="link text-bold"
          >terms of service</q-btn
        >
      </p>
      <q-btn
        dense
        class="full-width q-mt-md"
        color="grey-6"
        label="forgot password"
        flat
        :to="{ name: 'auth.requestPasswordReset' }"
      ></q-btn>
    </div>
  </q-page>
</template>

<script setup>
import AuthLoginCard from "src/auth/components/LoginCard.vue";
import LogoTitle from "../components/logoTitle.vue";
</script>
<style lang="stylus">
.logincard
  min-width 40%
.link
  border-bottom 1px dashed #2f2f2f
</style>

<script setup>
import AuthLoginForm from "src/auth/components/forms/LoginForm.vue";
import useLogin from "auth/composables/useLogin";
import AuthErrorsBanner from "./ErrorsBanner.vue";
import { useUsersStore } from "src/stores/User";
import { onMounted } from "vue";
const {
  onLoginClicked,
  form,
  loading,
  errors,
  validationErrors,
  hasValidationErrors,
} = useLogin();
onMounted(() => {
  useUsersStore().LoginWithEmail();
});
</script>

<template>
  <!-- Login Form -->
  <AuthLoginForm
    v-model:email="form.email"
    v-model:password="form.password"
    :validation-errors="validationErrors"
  />

  <!-- Errors -->
  <div v-if="!hasValidationErrors">
    <AuthErrorsBanner :errors="errors" />
  </div>

  <!-- Login Button -->
  <q-btn
    :loading="loading"
    class="full-width q-ma-md"
    color="blue-10"
    label="Sign In"
    @click="onLoginClicked"
  />
  <q-btn
    :loading="loading"
    class="full-width q-ma-md"
    color="blue-10"
    label="Login without Password"
    @click="useUsersStore().sendSingInLink(form.email)"
  />
</template>

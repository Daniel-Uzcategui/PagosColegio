<script setup>
import { QCard, QCardSection, QBtn } from "quasar";
import usePasswordReset from "auth/composables/usePasswordReset";
import ErrorsBanner from "./ErrorsBanner.vue";
import PasswordResetForm from "./forms/PasswordResetForm.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const {
  reset,
  resetPasswordForm,
  loading,
  hasValidationErrors,
  validationErrors,
  errors,
  resetErrors,
  hasErrors,
} = usePasswordReset();

async function onResetClicked() {
  await reset();
  if (!hasErrors.value) {
    router.push({ name: "index" });
  }
}
</script>

<template>
  <!-- Password Reset Form -->
  <PasswordResetForm
    v-model:email="resetPasswordForm.email"
    v-model:password="resetPasswordForm.password"
    v-model:passwordConfirmation="resetPasswordForm.password_confirmation"
    :validation-errors="validationErrors"
    @update:model-value="resetErrors"
  />

  <!-- Errors -->
  <div v-if="!hasValidationErrors">
    <ErrorsBanner :errors="errors" />
  </div>

  <!-- Change Password Button -->
  <q-btn
    :loading="loading"
    class="full-width"
    color="grey-8"
    label="Change Password"
    unelevated
    @click="onResetClicked"
  />
</template>

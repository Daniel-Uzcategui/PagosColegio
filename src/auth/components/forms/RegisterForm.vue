<script setup>
import { QInput, QForm } from "quasar";
import { getConfig } from "@vueauth/core";
const { withUsername } = getConfig("identityPassword:register");

defineProps({
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  passwordConfirmation: {
    required: true,
    type: String,
  },
  name: {
    required: false,
    type: String,
    default: null,
  },
  username: {
    required: false,
    type: String,
    default: null,
  },
  validationErrors: {
    required: false,
    type: Object,
    default() {
      return {};
    },
  },
});

const emit = defineEmits([
  "update:email",
  "update:password",
  "update:passwordConfirmation",
  "update:name",
  "update:username",
]);
</script>

<template>
  <q-form class="full-width q-ma-md">
    <q-input
      :model-value="name"
      :error="!!validationErrors?.['name']"
      :error-message="validationErrors?.['name']?.[0]"
      outlined
      square
      placeholder="Ex: My Name"
      @update:model-value="(value) => emit('update:name', value)"
    />
    <q-input
      v-if="withUsername"
      filled
      label="Username"
      :model-value="username"
      :error="!!validationErrors?.['username']"
      :error-message="validationErrors?.['username']?.[0]"
      class="q-mb-sm"
      hide-bottom-space
      @update:model-value="(value) => emit('update:username', value)"
    />
    <q-input
      :model-value="email"
      :error="!!validationErrors?.['email']"
      :error-message="validationErrors?.['email']?.[0]"
      outlined
      square
      placeholder="Ex: you@company.com"
      @update:model-value="(value) => emit('update:email', value)"
    />
    <q-input
      type="password"
      label="Password"
      outlined
      square
      :model-value="password"
      :error="!!validationErrors?.['password']"
      autocomplete="new-password"
      :error-message="validationErrors?.['password']?.[0]"
      @update:model-value="(value) => emit('update:password', value)"
    />
    <q-input
      v-if="typeof passwordConfirmation === 'string'"
      type="password"
      label="Confirm Password"
      outlined
      square
      autocomplete="new-password"
      :model-value="passwordConfirmation"
      :error="!!validationErrors?.['password_confirmation']"
      :error-message="validationErrors?.['password_confirmation']?.[0]"
      class="q-mb-sm"
      hide-bottom-space
      @update:model-value="
        (value) => emit('update:passwordConfirmation', value)
      "
    />
  </q-form>
</template>

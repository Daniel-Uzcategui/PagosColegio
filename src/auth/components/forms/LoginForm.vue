<script setup>
import { QInput, QForm } from "quasar";

defineProps({
  email: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  validationErrors: {
    required: false,
    type: Object,
    default() {
      return {};
    },
  },
});

const emit = defineEmits(["update:email", "update:password"]);
</script>

<template>
  <q-form class="full-width q-ma-md">
    <slot name="top" />
    <div class="full-width q-ma-md">
      Work email
      <q-input
        :model-value="email"
        :error="!!validationErrors?.['email']"
        :error-message="validationErrors?.['email']?.[0]"
        outlined
        square
        autocomplete="username"
        placeholder="Ex: you@company.com"
        @update:model-value="(value) => emit('update:email', value)"
      />
    </div>
    <q-input
      type="password"
      label="Password"
      autocomplete="current-password"
      :model-value="password"
      :error="!!validationErrors?.['password']"
      :error-message="validationErrors?.['password']?.[0]"
      outlined
      square
      @update:model-value="(value) => emit('update:password', value)"
    />
    <slot name="bottom" />
  </q-form>
</template>

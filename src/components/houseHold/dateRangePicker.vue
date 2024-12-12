<template>
    <q-input
      filled
      v-model="formattedPeriodo"
      label="Periodo"
      readonly
      @click="showDateRange = !showDateRange"
    >
      <template v-slot:append>
        <q-icon name="event" />
      </template>
    </q-input>
  
    <q-popup-proxy v-model="showDateRange" transition-show="scale" transition-hide="scale">
      <q-date
        v-model="internalPeriodo"
        range
        mask="MM/DD/YYYY"
        @update:model-value="onPeriodoChange"
        :default-view="'Calendar'"
      />
    </q-popup-proxy>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { format } from 'date-fns';
  
  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({ from: null, to: null })
    }
  });
  
  const emits = defineEmits(['update:modelValue']);
  
  const internalPeriodo = ref({ from: props.modelValue?.from, to: props.modelValue?.to });
  const showDateRange = ref(false);
  
  // Helper to format date range into a string for display
  const formattedPeriodo = ref(formatDateRange(internalPeriodo.value));
  
  // Flag to track user interaction with the date picker
  let userInteracted = false;
  
  watch(() => props.modelValue, (newValue) => {
    if (!userInteracted) {
      internalPeriodo.value = { ...newValue };
      formattedPeriodo.value = formatDateRange(newValue);
    }
    // Reset the flag after the props change is handled
    userInteracted = false;
  });
  
  watch(internalPeriodo, (newValue) => {
    if (userInteracted) {
      emits('update:modelValue', newValue);
      formattedPeriodo.value = formatDateRange(newValue);
    }
    // Reset the flag after the date change
    userInteracted = false;
  });
  
  // Function to handle formatting of the date range for display
  function formatDateRange(periodo) {
    if (!periodo?.from || !periodo?.to) return '';
    return `${format(new Date(periodo.from), 'dd/MM/yyyy')} - ${format(new Date(periodo.to), 'dd/MM/yyyy')}`;
  }
  
  // Function to handle user date selection and set the interaction flag
  function onPeriodoChange(newPeriodo) {
    userInteracted = true;  // Set the flag when the user interacts with the date picker
    internalPeriodo.value = newPeriodo;
  }
  </script>
  
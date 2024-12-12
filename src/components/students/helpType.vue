<template>
    <q-select
      v-model="internalValue"
      :options="helpTypes"
      :label="label"
      filled
      @new-value="addNewHelpType"
      emit-value
      use-input
      map-options
      clearable
      input-debounce="0"
      new-value-mode="add-unique"
    />
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
  
  const props = defineProps({
    modelValue: [String, Number], // Bind value
    returnId: [Boolean],
    label: {
      type: String,
      default: 'Tipo de Ayuda', // Default label
    },
  });
  
  const emits = defineEmits(['update:modelValue']);
  
  const internalValue = ref(props.modelValue);
  const helpTypes = ref([]);
  
  onMounted(async () => {
    try {
      const response = await api.get('/helps');
      helpTypes.value = response.data.map(help => ({ label: help.name, value: help._id }));
      helpTypes.value.unshift({ label: 'Regular', value: null })
    } catch (error) {
      console.error('Error fetching help types:', error);
      Notify.create({ message: 'Error al cargar tipos de ayuda', color: 'red' });
    }
  });
  
  watch(() => props.modelValue, (newValue) => {
    internalValue.value = newValue;
  });
  
  watch(internalValue, (newValue) => {
    emits('update:modelValue', newValue);
  });
  
  async function addNewHelpType(newHelpType) {
    try {
      const response = await api.post('/helps', { name: newHelpType });
      helpTypes.value.push({ label: response.data.name, value: response.data.name });
      internalValue.value = newHelpType; // Set the newly created help type
      Notify.create({ message: 'Tipo de ayuda añadido', color: 'green' });
    } catch (error) {
      console.error('Error adding help type:', error);
      Notify.create({ message: 'Error al añadir tipo de ayuda', color: 'red' });
    }
  }
  </script>
  
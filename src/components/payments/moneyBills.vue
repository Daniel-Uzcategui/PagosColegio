<template>
    <div class="column">
      <q-select
        v-model="selectedBillType"
        :options="billTypes"
        style="width: 300px;"
        class="q-ma-md"
        label="Seleccionar el billete"
        outlined
      ></q-select>
      <q-input
      style="width: 300px;"
      class="q-ma-md"
        v-model="serialNumber"
        label="Coloque el serial"
        outlined
      ></q-input>
      <q-btn
        label="Añadir billete"
        @click="addBill"
        color="primary"
      ></q-btn>
  
      <div class="q-mt-md">
        <div v-for="(bill, index) in bills" :key="index" class="row items-center">
          <q-chip
            :label="`${bill.type.label} - ${bill.serial}`"
            class="q-mr-md"
          ></q-chip>
          <q-btn
            icon="delete"
            flat
            round
            dense
            @click="deleteBill(index)"
          ></q-btn>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const selectedBillType = ref('');
  const serialNumber = ref('');
  const bills = ref([]);
  
  const billTypes = [
    { label: '$1', value: '1' },
    { label: '$2', value: '2' },
    { label: '$5', value: '5' },
    { label: '$10', value: '10' },
    { label: '$20', value: '20' },
    { label: '$50', value: '50' },
    { label: '$100', value: '100' }
  ];
  
  const addBill = () => {
    if (selectedBillType.value && serialNumber.value) {
      bills.value.push({
        type: selectedBillType.value,
        serial: serialNumber.value
      });
      serialNumber.value = ''; // Reset the input after adding
    }
  };
  
  const deleteBill = (index) => {
    bills.value.splice(index, 1);
  };
  const emit = defineEmits(['update:modelValue']);
  watch(bills, (newBills) => {
    const output = newBills.map(bill => `${bill.type.label} - ${bill.serial}`).join(', ');
    console.log('emitting', bills)
    emit('update:modelValue', output);
  }, { deep: true, immediate: true });
  </script>
  
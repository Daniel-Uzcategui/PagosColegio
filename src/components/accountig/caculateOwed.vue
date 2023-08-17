<template>
<q-btn color="primary" icon="add" label="Calcular deuda" @click="awaitForCall">
<q-inner-loading :showing="loading">
    <q-spinner color="primary" />
</q-inner-loading>
</q-btn>
</template>
<script setup>
import { calculateAmountOwedByAllHouseholds } from 'src/utils/callable';
import { ref } from 'vue';
import { Notify } from 'quasar';
  const loading = ref(false)
  async function awaitForCall () {
    try {
        loading.value = true
        await calculateAmountOwedByAllHouseholds()
    } catch (error) {
        Notify.create({message:error, color: 'red'})
    } finally {
        loading.value = false
    }

  }
</script>
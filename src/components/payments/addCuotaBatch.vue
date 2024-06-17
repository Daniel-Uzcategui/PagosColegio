<template>
    <q-card class="my-card">
        <q-card-section>
            <q-form @submit="onSubmit">
              <q-input v-model="Alias" label="Alias" />
              <!-- <q-input v-model.number="Monto" label="Monto" type="number" /> -->
              <money-input v-model="Monto" label="Monto"></money-input>
              <q-date v-model="Periodo" mask="MM/DD/YYYY" range minimal />
              <q-select v-model="Grado" :options="grados" map-options emit-value label="Grado" />
              <q-btn label="Submit" type="submit" color="primary" />
            </q-form>

        </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useCuotaStore } from 'src/stores/Cuotas.js';
import { yearLabelValue, yearsByNumber } from 'src/utils/schoolYear';
import { Notify } from 'quasar';
import MoneyInput from '../moneyInput.vue';
const emits = defineEmits(['show-dialog'])
        const cuotaStore = useCuotaStore();
        const Alias = ref('');
        const Monto = ref(0);
        const Periodo = ref({ from: undefined, to: undefined });
        const Grado = ref(100);
        const grados = ref([{value: 100, label: 'Todos'}, ...yearLabelValue]); // Populate this array with the available grades
        const onSubmit = async () => {
            try {
                /* if cuotaStore.addBatchCuota succesfull close dialog */
                const response = await cuotaStore.addBatchCuota({ Alias: Alias.value, Monto: Monto.value, Periodo: Periodo.value, Grado: Grado.value });
                console.log({ response });
                if (response) {
                    // send notification to user that the cuota was added if Grado is not null say in notification what grade was added, of grado was null say that the cuota was added to all grades
                    Notify.create({
                        message: `Cuota ${Alias.value} agregada exitosamente a ${Grado.value !== null ? yearsByNumber.get(Grado.value) : 'todos los grados'}`,
                        color: 'positive',
                        icon: 'check',
                        position: 'top-right',
                        timeout: 3000
                    });
                    emits('show-dialog', false)
                }
            }
            catch (error) {
                console.error(error);
            }
        };
  </script>
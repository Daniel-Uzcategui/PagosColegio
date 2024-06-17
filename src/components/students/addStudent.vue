<template>
    <q-dialog :model-value="showDialog" @hide="$emit('update:showDialog', false)">
      <q-card>
        <q-card-section>
          <div class="text-h6">
          {{ ID ? 'Editando edtudiante' : 'Añadir estudiante' }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit">
            <q-input
              v-model="Nombre"
              label="Nombre"
              filled
              :rules="[
                val => (val && val.length > 0) || 'Este campo es obligatorio',
                val => /^[a-zA-Z\s]*$/.test(val) || 'Este campo solo acepta letras y espacios'
              ]"
            />
            <q-input
              v-model="Apellido"
              label="Apellido"
              filled
              :rules="[
                val => (val && val.length > 0) || 'Este campo es obligatorio',
                val => /^[a-zA-Z\s]*$/.test(val) || 'Este campo solo acepta letras y espacios'
              ]"
            />
            <q-input
              v-model="ced"
              label="Cédula de identidad"
              filled
              :rules="[
                val => (val && val.length > 0) || 'Este campo es obligatorio',
              ]"
            />
            <q-input
              v-model="Seccion"
              label="Seccion"
              filled
              :rules="[
                val => (val && val.length > 0) || 'Este campo es obligatorio',
                val => /^[A-Z]*$/.test(val) || 'Este campo solo acepta letras mayúsculas'
              ]"
            />
            <q-select
              v-model="Grado"
              emit-value
              map-options
              :options="yearLabelValue"
              label="Grado"
              filled
              :rules="[val => (Number.isSafeInteger(val)) || 'Debe seleccionar un grado']"
            />
            <q-toggle label="Estudiante Ayuda" v-model="help" color="green" />
            <q-input
              v-if="ID"
              v-model="inicioCuotaHandle"
              type="text"
              label="Fecha de ingreso"
            />
            <q-date
              v-else
              class="q-ma-sm"
              title="Fecha de ingreso"
              mask="M/D/YYYY"
                v-model="inicioCuotaHandle"
                landscape
            />
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <!-- <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" /> -->
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { Notify } from 'quasar';
  import { yearLabelValue } from 'src/utils/schoolYear.js';
  import { useStudentStore } from 'src/stores/Students.js'; // import your store
import { api } from 'src/boot/axios';

  const studentStore = useStudentStore(); // use your store

  const props = defineProps({
    showDialog: {
      type: Boolean,
      required: true,
    },
    student: {
      type: Object,
      default: () => ({}),
    },
  });

  const emits = defineEmits(['update:showDialog', 'submitted'])

  const FechaInicioCuota = ref(props.student.FechaInicioCuota)
  const inicioCuotaHandle = computed({ get:() => FechaInicioCuota.value?.toLocaleDateString?.('en-US') || new Date().toLocaleDateString('en-US'), set: (e) => {
    FechaInicioCuota.value = new Date(e)}})
  const help = ref(props.student.help || false)
  const ID = ref(props.student._id)
  const Nombre = ref(props.student.Nombre);
  const Apellido = ref(props.student.Apellido);
  const ced = ref(props.student.ced);
  const Seccion = ref(props.student.Seccion);
  const Grado = ref(props.student.Grado);
  const newAmountStartDate = ref()
  async function onSubmit() {
    try {
      const response = await api.get(`/check-ced/${ced.value}`);
      if (response.data.isUsed && response.data.id !== ID.value) {
        // If the ced is already used and the id is not the same, show an error
        return Notify.create({ message: 'Cédula ya está en uso', color: 'red' });
      }
      if (ID.value) {
        // Update existing student
        const response = await studentStore.set({
          _id: ID.value,
          Nombre: Nombre.value,
          Apellido: Apellido.value,
          'ced': ced.value,
          Seccion: Seccion.value,
          Grado: Grado.value,
          help: help.value,
          FechaInicioCuota: FechaInicioCuota.value,
          newAmountStartDate: newAmountStartDate.value
        });
        if (response) {
          Notify.create({ message: 'Student updated', color: 'green' });
        }
      } else {
        // Add new student
        const response = await studentStore.add({
          Nombre: Nombre.value,
          Apellido: Apellido.value,
          'ced': ced.value,
          help: help.value,
          Seccion: Seccion.value,
          Grado: Grado.value,
          FechaInicioCuota: inicioCuotaHandle.value
        });
        if (response) { 
          Notify.create({ message: 'Student added', color: 'green' });
        }
      }
      emits('update:showDialog', false);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.code === 11000 && error.response.data?.keyValue?.ced) {
        Notify.create({ message: 'Cédula Repetida: ' + error.response.data.keyValue.ced , color: 'red' });
      }
      Notify.create({ message: 'Error guardando estudiante', color: 'red' });
    } finally {
      emits('submitted');
    }
  }
</script>

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
            <p>Porcentaje del monto a pagar: {{ DiscountComputed }} %</p>
            <q-slider
              v-model="DiscountComputed"
              :min="1"
              :max="100"
              :step="1"
              label
              color="green"
            />
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
            <div class="q-mt-xl q-ma-sm text-bold" v-if="ID && oldDiscount !== Discount">
              <p>A partir de que Fecha se calcula el nuevo monto?</p>
              <q-date
              title="Fecha para calculo monto nuevo"
                mask="M/D/YYYY"
                  v-model="computedStartDate"
                  landscape
              />
            </div>
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
  const ID = ref(props.student._id)
  const Nombre = ref(props.student.Nombre);
  const Apellido = ref(props.student.Apellido);
  const ced = ref(props.student.ced);
  const Seccion = ref(props.student.Seccion);
  const Grado = ref(props.student.Grado);
  const Discount = ref(props.student.Discount);
  const oldDiscount = ref(props.student.Discount)
  const newAmountStartDate = ref()
  const computedStartDate = computed({ get:() => newAmountStartDate.value?.toLocaleDateString?.('en-US') || new Date().toLocaleDateString('en-US'), set: (e) => {
  newAmountStartDate.value = new Date(e)}})
  const DiscountComputed = computed({
    get: () => parseFloat(((Discount.value || 1) * 100).toFixed(2)), set: (e) => {
      Discount.value = Math.round(e) * 0.01
    }
  })

  async function onSubmit() {
    try {
      if (ID.value) {
        // Update existing student
        await studentStore.set({
          _id: ID.value,
          Nombre: Nombre.value,
          Apellido: Apellido.value,
          'ced': ced.value,
          Seccion: Seccion.value,
          Grado: Grado.value,
          Discount: Discount.value,
          FechaInicioCuota: FechaInicioCuota.value,
          newAmountStartDate: newAmountStartDate.value
        });
        Notify.create({ message: 'Student updated', color: 'green' });
      } else {
        // Add new student
        await studentStore.add({
          Nombre: Nombre.value,
          Apellido: Apellido.value,
          'ced': ced.value,
          Seccion: Seccion.value,
          Grado: Grado.value,
          Discount: Discount.value,
          FechaInicioCuota: inicioCuotaHandle.value
        });
        Notify.create({ message: 'Student added', color: 'green' });
      }
      emits('update:showDialog', false);
    } catch (error) {
      console.error(error);
      Notify.create({ message: 'Error saving student', color: 'red' });
    } finally {
      emits('submitted');
    }
  }
</script>

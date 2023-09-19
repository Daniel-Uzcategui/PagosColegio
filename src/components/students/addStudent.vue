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
              v-model="Sección"
              label="Sección"
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
            <q-select
              v-model="houseHold"
              :options="houseHoldOptions"
              use-input
              label="Familia"
              filled
              :rules="[(value) => value?.length || 'Debe Seleccionar una Familia']"
              :option-label="(parent) => parent.Apellido"
              :option-value="(value) => value.id"
              emit-value
              map-options
              @filter="filterFn"
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
  import { collection, addDoc, updateDoc,doc, Timestamp } from 'firebase/firestore';
  import { db } from 'src/boot/vuefire';
  import { Notify } from 'quasar';
  import { useCollection } from 'vuefire';
  import { yearLabelValue } from 'src/utils/schoolYear';
  const houseHolds = useCollection(collection(db, 'houseHolds'));
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
  const inicioCuotaHandle = computed({ get:() => FechaInicioCuota.value?.toDate?.().toLocaleDateString('en-US') || new Date().toLocaleDateString('en-US'), set: (e) => {
    FechaInicioCuota.value = Timestamp.fromDate(new Date(e))}})
  const ID = ref(props.student.id)
  const Nombre = ref(props.student.Nombre);
  const Apellido = ref(props.student.Apellido);
  const ced = ref(props.student.ced);
  const Sección = ref(props.student.Sección);
  const Grado = ref(props.student.Grado);
  const Discount = ref(props.student.Discount);
  const oldDiscount = ref(props.student.Discount)
  const newAmountStartDate = ref()
  const computedStartDate = computed({ get:() => newAmountStartDate.value?.toDate?.().toLocaleDateString('en-US') || new Date().toLocaleDateString('en-US'), set: (e) => {
  newAmountStartDate.value = Timestamp.fromDate(new Date(e))}})
  const DiscountComputed = computed({
    get: () => parseFloat(((Discount.value || 1) * 100).toFixed(2)), set: (e) => {
      Discount.value = Math.round(e) * 0.01
    }
  })
  const houseHold = ref(props.student.houseHold);
  const houseHoldOptions = ref(houseHolds.value)
function filterFn (val, update) {
        if (val === '') {
          update(() => {
            houseHoldOptions.value = houseHolds.value

            // here you have access to "ref" which
            // is the Vue reference of the QSelect
          })
          return
        }

        update(() => {
          const needle = val.toLowerCase()
          houseHoldOptions.value = houseHolds.value.filter(option =>
            option.Apellido.toLowerCase().includes(needle)
          )
        })
      }
  
async function onSubmit() {
  try {
    if (ID.value) {
      // Update existing student
      await updateDoc(doc(db, 'students', ID.value), {
        Nombre: Nombre.value,
        Apellido: Apellido.value,
        'ced': ced.value,
        Sección: Sección.value,
        Grado: Grado.value,
        houseHold: houseHold.value,
        Discount: Discount.value,
        FechaInicioCuota: FechaInicioCuota.value,
        newAmountStartDate: newAmountStartDate.value
      });
      Notify.create({ message: 'Student updated', color: 'green' });
    } else {
      // Add new student
      await addDoc(collection(db, 'students'), {
        Nombre: Nombre.value,
        Apellido: Apellido.value,
        'ced': ced.value,
        Sección: Sección.value,
        Grado: Grado.value,
        houseHold: houseHold.value,
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
  
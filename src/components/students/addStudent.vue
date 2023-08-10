<template>
    <q-dialog :model-value="showDialog" @hide="$emit('update:showDialog', false)">
      <q-card>
        <q-card-section>
          <div class="text-h6">Añadir estudiante</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit">
            <q-input v-model="Nombre" label="Nombre" filled />
            <q-input v-model="Apellido" label="Apellido" filled />
            <q-input v-model="Cédula_de_identidad" label="Cédula de identidad" filled />
            <q-input v-model="Sección" label="Sección" filled />
            <q-input v-model="Grado" label="Grado" filled />
            <q-select v-model="Padres" :options="parents" label="Padres" filled multiple
            :option-label="(parent) => parent.Nombre + ' ' + parent.Apellido"
            :option-value="(value) => value.id"
            opti
            emit-value
            map-options
            :filter="(options, filter) => options.filter(option => option.Apellido.toLowerCase().includes(filter.toLowerCase()))" />
            <q-input v-model="TipoCuota" label="Tipo de Cuota" filled />
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
<script setup>
  import { toRef, ref } from 'vue';
  import { collection, addDoc, updateDoc,doc } from 'firebase/firestore';
  import { db } from 'src/boot/vuefire';
  import { Notify } from 'quasar';
  import { useCollection } from 'vuefire';
  const parents = useCollection(collection(db, 'parents'));

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
const emits = defineEmits(['update:showDialog'])
  
const Nombre = toRef(props.student, 'Nombre');
const Apellido = toRef(props.student, 'Apellido');
const Cédula_de_identidad = toRef(props.student, 'Cédula de identidad');
const Sección = toRef(props.student, 'Sección');
const Grado = toRef(props.student, 'Grado');
const TipoCuota = toRef(props.student, 'TipoCuota');
const Padres = toRef(props.student, 'Padres');

  
async function onSubmit() {
  try {
    if (props.student.id) {
      // Update existing student
      await updateDoc(doc(db, 'students', props.student.id), {
        Nombre: Nombre.value,
        Apellido: Apellido.value,
        'Cédula de identidad': Cédula_de_identidad.value,
        Sección: Sección.value,
        Grado: Grado.value,
        Padres: Padres.value
      });
      Notify.create({ message: 'Student updated', color: 'green' });
    } else {
      // Add new student
      await addDoc(collection(db, 'students'), {
        Nombre: Nombre.value,
        Apellido: Apellido.value,
        'Cédula de identidad': Cédula_de_identidad.value,
        Sección: Sección.value,
        Grado: Grado.value,
        Padres: Padres.value
      });
      Notify.create({ message: 'Student added', color: 'green' });
    }
    emits('update:showDialog', false);
  } catch (error) {
    console.error(error);
    Notify.create({ message: 'Error saving student', color: 'red' });
  }
}

</script>
  